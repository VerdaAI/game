"""Test manipulation combos on all 30 images using the Verda Python SDK.

Submits all decode jobs with wait=False, then batch-polls for results.
"""

import json
import os
import sys
import time
import itertools
import tempfile
from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageFilter

# Add sdk-python to path
SDK_PATH = Path(__file__).resolve().parent.parent.parent / "sdk-python"
sys.path.insert(0, str(SDK_PATH))
from verda import VerdaClient

API_KEY = os.environ.get("VERDA_API_KEY", "")
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "content" / "images"


# === Manipulations (matching game Canvas API, medium strength) ===

def blur_region(img):
    w, h = img.size
    cw, ch = int(w * 0.35), int(h * 0.12)
    box = (0, h - ch, cw, h)
    region = img.crop(box).filter(ImageFilter.GaussianBlur(20))
    out = img.copy()
    out.paste(region, box)
    return out

def apply_filter(img):
    img = ImageEnhance.Brightness(img).enhance(1.12)
    img = ImageEnhance.Contrast(img).enhance(1.1)
    img = ImageEnhance.Color(img).enhance(0.8)
    return img

def reencode(img, quality):
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    return Image.open(buf).copy()

def crop_upscale(img):
    w, h = img.size
    px = int(min(w, h) * 0.08)
    cropped = img.crop((px, px, w - px, h - px))
    return cropped.resize((w, h), Image.BILINEAR)

def resize_down_up(img):
    w, h = img.size
    small = img.resize((int(w * 0.45), int(h * 0.45)), Image.BILINEAR)
    return small.resize((w, h), Image.BILINEAR)

def add_border(img):
    w, h = img.size
    out = Image.new("RGB", (w, h), (0, 0, 0))
    out.paste(img.resize((w - 40, h - 40)), (20, 20))
    return out

MANIPS = {
    "remove_wm": blur_region,
    "filter": apply_filter,
    "screenshot": lambda img: reencode(img, 55),
    "crop": crop_upscale,
    "mirror": lambda img: img.transpose(Image.FLIP_LEFT_RIGHT),
    "resize": resize_down_up,
    "border": add_border,
    "overlay_wm": lambda img: img,
    "compress": lambda img: reencode(img, 35),
}


def apply_combo(img, combo):
    result = img.copy()
    for name in combo:
        result = MANIPS[name](result)
    return result


def save_temp(img):
    """Save image to a temp file and return the path."""
    f = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    img.save(f, format="JPEG", quality=85)
    f.close()
    return f.name


def main():
    if not API_KEY:
        print("Set VERDA_API_KEY env var")
        return

    client = VerdaClient(api_key=API_KEY)
    balance = client.credits()
    print(f"Credits: ${balance.balance_dollars:.2f}")

    test_images = sorted([f.name for f in IMAGES_DIR.glob("demo-*.jpg") if "original" not in str(f)])
    print(f"Images: {len(test_images)}")

    # Build combos to test
    manip_keys = list(MANIPS.keys())
    singles = [(k,) for k in manip_keys]
    doubles = [
        ("remove_wm", "crop"), ("remove_wm", "filter"), ("remove_wm", "mirror"),
        ("remove_wm", "compress"), ("remove_wm", "screenshot"), ("remove_wm", "border"),
        ("crop", "compress"), ("crop", "border"), ("crop", "filter"), ("crop", "resize"),
        ("filter", "compress"), ("filter", "screenshot"), ("mirror", "compress"),
        ("mirror", "filter"), ("border", "compress"), ("resize", "compress"),
    ]
    triples = [
        ("crop", "compress", "border"), ("crop", "compress", "filter"),
        ("crop", "compress", "resize"), ("remove_wm", "crop", "compress"),
        ("remove_wm", "filter", "compress"), ("remove_wm", "crop", "border"),
        ("crop", "border", "filter"), ("mirror", "crop", "compress"),
        ("filter", "compress", "resize"), ("remove_wm", "mirror", "crop"),
        ("remove_wm", "crop", "filter"), ("crop", "filter", "border"),
    ]

    test_combos = singles + doubles + triples
    total = len(test_combos) * len(test_images)
    print(f"Combos: {len(singles)}S + {len(doubles)}D + {len(triples)}T = {len(test_combos)}")
    print(f"Total jobs: {total}, est cost: ~${total * 0.005:.2f}\n")

    # === Phase 1: Prepare images + submit all jobs ===
    print("Preparing & submitting jobs...")
    pending = []  # (combo_label, img_file, job_id, tmp_path)
    errors = []
    count = 0

    for combo in test_combos:
        label = "+".join(combo)
        for img_file in test_images:
            path = IMAGES_DIR / img_file
            img = Image.open(path).convert("RGB")
            manipulated = apply_combo(img, combo)
            tmp = save_temp(manipulated)

            try:
                job_id = client.decode(file=tmp, wait=False)
                pending.append((label, img_file, job_id, tmp))
                count += 1
                if count % 50 == 0:
                    print(f"  Submitted {count}/{total}")
            except Exception as e:
                errors.append((label, img_file, str(e)))
                os.unlink(tmp)

    print(f"Submitted {len(pending)} jobs, {len(errors)} errors\n")

    # === Phase 2: Poll for results ===
    print("Polling for results...")
    results_raw = {}  # combo_label -> {matches, total, misses}
    remaining = list(pending)
    poll_round = 0

    while remaining:
        poll_round += 1
        time.sleep(5)
        still_pending = []

        for label, img_file, job_id, tmp in remaining:
            try:
                job = client.get_job(job_id)
                if job.status == "COMPLETED":
                    match = getattr(job, "match", False)
                    if label not in results_raw:
                        results_raw[label] = {"matches": 0, "total": 0, "misses": []}
                    results_raw[label]["total"] += 1
                    if match:
                        results_raw[label]["matches"] += 1
                    else:
                        results_raw[label]["misses"].append(img_file)
                    os.unlink(tmp)
                elif job.status == "FAILED":
                    if label not in results_raw:
                        results_raw[label] = {"matches": 0, "total": 0, "misses": []}
                    results_raw[label]["total"] += 1
                    results_raw[label]["misses"].append(img_file)
                    os.unlink(tmp)
                else:
                    still_pending.append((label, img_file, job_id, tmp))
            except Exception:
                still_pending.append((label, img_file, job_id, tmp))

        remaining = still_pending
        done = sum(r["total"] for r in results_raw.values())
        if poll_round % 3 == 0 or not remaining:
            print(f"  Round {poll_round}: {done}/{total} done, {len(remaining)} pending")

    # === Phase 3: Report ===
    print(f"\n{'=' * 75}")
    print(f"{'Combo':<40s} {'Match':>6s} {'Total':>6s} {'Rate':>6s}  Failed images")
    print("-" * 75)
    for label, r in sorted(results_raw.items(), key=lambda x: (len(x[0].split("+")), -x[1]["matches"] / max(x[1]["total"], 1))):
        rate = r["matches"] / r["total"] * 100 if r["total"] > 0 else 0
        misses = ", ".join(r["misses"][:3]) + ("..." if len(r["misses"]) > 3 else "") if r["misses"] else ""
        marker = " !!!" if rate < 80 else " !" if rate < 100 else ""
        print(f"  {label:<38s} {r['matches']:>6d} {r['total']:>6d} {rate:>5.0f}%  {misses}{marker}")

    # Save
    save_data = {}
    for k, v in results_raw.items():
        save_data[k] = {
            "matches": v["matches"],
            "total": v["total"],
            "rate": round(v["matches"] / v["total"] * 100, 1) if v["total"] > 0 else 0,
            "misses": v["misses"],
        }
    out = IMAGES_DIR / "combo-test-results.json"
    with open(out, "w") as f:
        json.dump(save_data, f, indent=2)
    print(f"\nSaved to {out}")

    # Failures summary
    failures = {k: v for k, v in save_data.items() if v["rate"] < 100}
    if failures:
        print(f"\n{'=' * 75}")
        print(f"FAILURES (< 100%)")
        print(f"{'=' * 75}")
        for k, v in sorted(failures.items(), key=lambda x: x[1]["rate"]):
            print(f"  {k:<38s} {v['matches']}/{v['total']}  {v['rate']}%")


if __name__ == "__main__":
    main()
