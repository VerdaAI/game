"""Quick test: worst-case compress combos at q55 on all 30 images."""

import os
import sys
import time
import tempfile
from pathlib import Path
from io import BytesIO

from PIL import Image, ImageEnhance, ImageFilter

SDK_PATH = Path(__file__).resolve().parent.parent.parent / "sdk-python"
sys.path.insert(0, str(SDK_PATH))
from verda import VerdaClient

API_KEY = os.environ.get("VERDA_API_KEY", "")
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "content" / "images"

def blur_region(img):
    w, h = img.size
    cw, ch = int(w * 0.35), int(h * 0.12)
    box = (0, h - ch, cw, h)
    region = img.crop(box).filter(ImageFilter.GaussianBlur(20))
    out = img.copy(); out.paste(region, box); return out

def apply_filter(img):
    return ImageEnhance.Color(ImageEnhance.Contrast(ImageEnhance.Brightness(img).enhance(1.12)).enhance(1.1)).enhance(0.8)

def compress_55(img):
    buf = BytesIO(); img.save(buf, format="JPEG", quality=55); buf.seek(0)
    return Image.open(buf).copy()

def crop_upscale(img):
    w, h = img.size; px = int(min(w, h) * 0.08)
    return img.crop((px, px, w - px, h - px)).resize((w, h), Image.BILINEAR)

def add_border(img):
    w, h = img.size; out = Image.new("RGB", (w, h), (0, 0, 0))
    out.paste(img.resize((w - 40, h - 40)), (20, 20)); return out

def resize_down_up(img):
    w, h = img.size
    return img.resize((int(w * 0.45), int(h * 0.45)), Image.BILINEAR).resize((w, h), Image.BILINEAR)

# Worst-case combos from previous test
COMBOS = {
    "compress_q55": [compress_55],
    "border+compress": [add_border, compress_55],
    "filter+compress": [apply_filter, compress_55],
    "filter+compress+resize": [apply_filter, compress_55, resize_down_up],
    "crop+compress+border": [crop_upscale, compress_55, add_border],
    "crop+compress+filter": [crop_upscale, compress_55, apply_filter],
    "remove_wm+crop+compress": [blur_region, crop_upscale, compress_55],
    "remove_wm+filter+compress": [blur_region, apply_filter, compress_55],
}

def save_temp(img):
    f = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    img.save(f, format="JPEG", quality=85); f.close(); return f.name

def main():
    client = VerdaClient(api_key=API_KEY)
    print(f"Credits: ${client.credits().balance_dollars:.2f}")

    test_images = sorted([f.name for f in IMAGES_DIR.glob("demo-*.jpg") if "original" not in str(f)])
    print(f"Images: {len(test_images)}, Combos: {len(COMBOS)}, Total: {len(COMBOS) * len(test_images)}\n")

    # Submit all — persist to file for crash recovery
    jobs_file = IMAGES_DIR / "compress55-jobs.json"
    if jobs_file.exists():
        print(f"Resuming from {jobs_file}")
        import json
        saved = json.load(open(jobs_file))
        pending = [(j["label"], j["img"], j["job_id"], None) for j in saved]
    else:
        pending = []
        saved_jobs = []
        for label, funcs in COMBOS.items():
            for img_file in test_images:
                img = Image.open(IMAGES_DIR / img_file).convert("RGB")
                for fn in funcs:
                    img = fn(img)
                tmp = save_temp(img)
                job_id = client.decode(file=tmp, wait=False)
                pending.append((label, img_file, job_id, tmp))
                saved_jobs.append({"label": label, "img": img_file, "job_id": job_id})
                os.unlink(tmp)
        import json
        with open(jobs_file, "w") as f:
            json.dump(saved_jobs, f, indent=2)
        print(f"Saved {len(saved_jobs)} job IDs to {jobs_file}")

    print(f"{len(pending)} jobs to poll\nPolling...")

    # Poll
    results = {}
    remaining = [(l, i, j) for l, i, j, _ in pending]
    poll_round = 0
    while remaining:
        poll_round += 1
        time.sleep(5)
        still = []
        for label, img_file, job_id in remaining:
            try:
                job = client.get_job(job_id)
                if job.status in ("COMPLETED", "FAILED"):
                    match = getattr(job, "match", False) if job.status == "COMPLETED" else False
                    results.setdefault(label, {"m": 0, "t": 0, "miss": []})
                    results[label]["t"] += 1
                    if match: results[label]["m"] += 1
                    else: results[label]["miss"].append(img_file)
                else:
                    still.append((label, img_file, job_id))
            except Exception:
                still.append((label, img_file, job_id))
        done = sum(r["t"] for r in results.values())
        remaining = still
        print(f"  Round {poll_round}: {done}/{len(pending)} done, {len(remaining)} pending")

    # Report
    print(f"\n{'Combo':<35s} {'Match':>6s} {'Total':>6s} {'Rate':>6s}")
    print("-" * 55)
    for label, r in sorted(results.items(), key=lambda x: -x[1]["m"] / max(x[1]["t"], 1)):
        rate = r["m"] / r["t"] * 100
        misses = ", ".join(r["miss"][:3]) + ("..." if len(r["miss"]) > 3 else "")
        print(f"  {label:<33s} {r['m']:>6d} {r['t']:>6d} {rate:>5.0f}%  {misses}")

if __name__ == "__main__":
    main()
