"""Test decode on all images with various manipulations.

Uses Pillow to apply manipulations locally (same logic as the Canvas API),
then sends each to the Verda decode endpoint to see what survives.
"""

import json
import time
from pathlib import Path
from io import BytesIO

import requests
from PIL import Image, ImageFilter, ImageEnhance

API_KEY = os.environ.get("VERDA_API_KEY", "")
API_BASE = "https://api.verda.ai/api/v2/enterprise"
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "content" / "images"

HEADERS = {"X-API-Key": API_KEY, "Content-Type": "application/json"}


def api_get(path):
    r = requests.get(f"{API_BASE}{path}", headers=HEADERS)
    r.raise_for_status()
    return r.json()


def api_post(path, data):
    r = requests.post(f"{API_BASE}{path}", headers=HEADERS, json=data)
    r.raise_for_status()
    return r.json()


def decode_bytes(img_bytes: bytes, filename="test.jpg") -> dict:
    """Upload image bytes and run decode, return result."""
    fmt = filename.split(".")[-1]

    # Step 1: upload URL
    resp = api_get(f"/watermark/upload-url?filename={filename}&content_type=image&file_format={fmt}")
    upload_url = resp["data"]["upload_url"]
    content_id = resp["data"]["content_id"]

    # Step 2: upload
    requests.put(upload_url, data=img_bytes, headers={"Content-Type": "image/jpeg"})

    # Step 3: decode
    resp = api_post("/watermark/decode", {"content_id": content_id, "content_type": "image", "file_format": fmt})
    job_id = resp["data"]["job_id"]

    # Step 4: poll
    for _ in range(40):
        time.sleep(3)
        resp = api_get(f"/watermark/jobs/{job_id}")
        job = resp["data"]["job"]
        if job["status"] == 3:
            return {"match": job.get("match", False), "watermark_ref": job.get("provenance", {}).get("watermark_ref", "")}
        if job["status"] == 4:
            return {"match": False, "watermark_ref": ""}

    return {"match": False, "watermark_ref": "", "error": "timeout"}


def img_to_bytes(img: Image.Image, quality=92) -> bytes:
    buf = BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    return buf.getvalue()


# Manipulation functions (matching the Canvas API logic)
def manip_none(img):
    return img_to_bytes(img)

def manip_compress_40(img):
    return img_to_bytes(img, quality=40)

def manip_compress_20(img):
    return img_to_bytes(img, quality=20)

def manip_compress_8(img):
    return img_to_bytes(img, quality=8)

def manip_compress_5(img):
    return img_to_bytes(img, quality=5)

def manip_filter_light(img):
    img = ImageEnhance.Brightness(img).enhance(1.1)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    return img_to_bytes(img)

def manip_filter_heavy(img):
    img = ImageEnhance.Brightness(img).enhance(1.25)
    img = ImageEnhance.Contrast(img).enhance(1.3)
    img = ImageEnhance.Color(img).enhance(0.3)
    return img_to_bytes(img)

def manip_crop_5(img):
    w, h = img.size
    px = int(min(w, h) * 0.05)
    return img_to_bytes(img.crop((px, px, w - px, h - px)))

def manip_crop_10(img):
    w, h = img.size
    px = int(min(w, h) * 0.10)
    return img_to_bytes(img.crop((px, px, w - px, h - px)))

def manip_crop_15(img):
    w, h = img.size
    px = int(min(w, h) * 0.15)
    return img_to_bytes(img.crop((px, px, w - px, h - px)))

def manip_mirror(img):
    return img_to_bytes(img.transpose(Image.FLIP_LEFT_RIGHT))

def manip_resize_down_up(img):
    w, h = img.size
    small = img.resize((w // 3, h // 3), Image.BILINEAR)
    big = small.resize((w, h), Image.BILINEAR)
    return img_to_bytes(big)

def manip_screenshot_55(img):
    return img_to_bytes(img, quality=55)

def manip_border(img):
    from PIL import ImageOps
    return img_to_bytes(ImageOps.expand(img, border=30, fill="black"))


MANIPULATIONS = [
    ("original", manip_none),
    ("compress_q40", manip_compress_40),
    ("compress_q20", manip_compress_20),
    ("compress_q8", manip_compress_8),
    ("compress_q5", manip_compress_5),
    ("filter_light", manip_filter_light),
    ("filter_heavy", manip_filter_heavy),
    ("crop_5%", manip_crop_5),
    ("crop_10%", manip_crop_10),
    ("crop_15%", manip_crop_15),
    ("mirror", manip_mirror),
    ("resize_33%_up", manip_resize_down_up),
    ("screenshot_q55", manip_screenshot_55),
    ("border_30px", manip_border),
]


def main():
    # Test on 3 images to save credits
    test_images = ["demo-01.jpg", "demo-05.jpg", "demo-08.jpg"]
    results = []

    for img_file in test_images:
        path = IMAGES_DIR / img_file
        if not path.exists():
            continue

        img = Image.open(path).convert("RGB")
        print(f"\n{'='*60}")
        print(f"Image: {img_file} ({img.size[0]}x{img.size[1]})")
        print(f"{'='*60}")

        for name, func in MANIPULATIONS:
            manip_bytes = func(img)
            size_kb = len(manip_bytes) / 1024
            print(f"  {name:20s} ({size_kb:6.1f} KB) ... ", end="", flush=True)

            result = decode_bytes(manip_bytes)
            status = "MATCH" if result["match"] else "MISS"
            print(f"{status}")

            results.append({
                "image": img_file,
                "manipulation": name,
                "size_kb": round(size_kb, 1),
                "match": result["match"],
            })

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"{'Manipulation':20s} {'Matches':>8s} {'Total':>6s} {'Rate':>6s}")
    print("-" * 44)

    manip_names = [m[0] for m in MANIPULATIONS]
    for name in manip_names:
        rows = [r for r in results if r["manipulation"] == name]
        matches = sum(1 for r in rows if r["match"])
        total = len(rows)
        rate = f"{matches}/{total}"
        pct = f"{matches/total*100:.0f}%" if total else "—"
        print(f"  {name:20s} {rate:>8s} {pct:>6s}")

    # Save results
    out = IMAGES_DIR / "decode-test-results.json"
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {out}")


if __name__ == "__main__":
    main()
