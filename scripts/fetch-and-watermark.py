"""Fetch 20 diverse images from Unsplash (no API key needed for source URLs),
then watermark each via the Verda enterprise API.

Uses Unsplash Source URLs which are free and don't require API keys.
Images are downloaded at 800px width for reasonable file sizes.
"""

import json
import os
import shutil
import time
from pathlib import Path

import requests

API_KEY = "vk_a2ef9406b5d75bdd7c5fcc09a7ad1c1a"
API_BASE = "https://api.verda.ai/api/v2/enterprise"
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "content" / "images"

HEADERS = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

# Diverse search terms for variety
CATEGORIES = [
    "nature landscape",
    "city street night",
    "portrait woman",
    "food photography",
    "ocean waves",
    "mountain hiking",
    "coffee shop",
    "sunset sky",
    "architecture building",
    "flowers garden",
    "dog pet",
    "concert music",
    "rain city",
    "desert sand",
    "snow winter",
    "graffiti street art",
    "bicycle urban",
    "cat animal",
    "market fruit",
    "forest trees",
]

CREATORS = [
    {"handle": "@aria.lens", "name": "Aria Nguyen"},
    {"handle": "@maxshot", "name": "Max Bergström"},
    {"handle": "@priya.captures", "name": "Priya Sharma"},
    {"handle": "@tomaso.photo", "name": "Tomaso Ricci"},
    {"handle": "@zuri.frames", "name": "Zuri Okonkwo"},
    {"handle": "@kai.visual", "name": "Kai Tanaka"},
    {"handle": "@elena.pix", "name": "Elena Petrova"},
    {"handle": "@diego.snap", "name": "Diego Morales"},
    {"handle": "@lina.shoot", "name": "Lina Johansson"},
    {"handle": "@omar.click", "name": "Omar Al-Rashid"},
    {"handle": "@sofia.gram", "name": "Sofia Costa"},
    {"handle": "@yuki.raw", "name": "Yuki Watanabe"},
    {"handle": "@amara.eye", "name": "Amara Diallo"},
    {"handle": "@leo.studio", "name": "Leo Fischer"},
    {"handle": "@mei.daily", "name": "Mei-Lin Wong"},
    {"handle": "@sven.wild", "name": "Sven Larsson"},
    {"handle": "@nadia.art", "name": "Nadia Khoury"},
    {"handle": "@ravi.pics", "name": "Ravi Patel"},
    {"handle": "@clara.view", "name": "Clara Müller"},
    {"handle": "@jada.mood", "name": "Jada Williams"},
]


def api_get(path):
    r = requests.get(f"{API_BASE}{path}", headers=HEADERS)
    r.raise_for_status()
    return r.json()


def api_post(path, data):
    r = requests.post(f"{API_BASE}{path}", headers=HEADERS, json=data)
    r.raise_for_status()
    return r.json()


def download_image(idx: int, dest: Path) -> bool:
    """Download a random image from Picsum (Lorem Picsum).
    Uses sequential IDs to get diverse, high-quality stock photos.
    """
    # Use specific photo IDs for diversity (curated good-looking photos)
    # Picsum IDs that are known to be diverse and high quality
    photo_ids = [
        10, 11, 15, 17, 20, 22, 24, 26, 27, 28,
        29, 36, 37, 39, 40, 42, 43, 48, 49, 54,
        56, 58, 59, 60, 64, 65, 69, 74, 76, 82,
    ]
    pid = photo_ids[idx % len(photo_ids)]
    url = f"https://picsum.photos/id/{pid}/800/1067"  # 3:4 aspect
    try:
        r = requests.get(url, timeout=20, allow_redirects=True)
        if r.status_code == 200 and len(r.content) > 10000:
            with open(dest, "wb") as f:
                f.write(r.content)
            return True
        print(f"    HTTP {r.status_code}, {len(r.content)} bytes")
    except Exception as e:
        print(f"    Download failed: {e}")
    return False


def encode_image(file_path: Path) -> dict:
    """Watermark via enterprise API 3-step flow."""
    filename = file_path.name
    fmt = file_path.suffix.lstrip(".").lower()

    resp = api_get(f"/watermark/upload-url?filename={filename}&content_type=image&file_format={fmt}")
    upload_url = resp["data"]["upload_url"]
    content_id = resp["data"]["content_id"]

    with open(file_path, "rb") as f:
        file_bytes = f.read()
    requests.put(upload_url, data=file_bytes, headers={"Content-Type": "image/jpeg"})

    resp = api_post("/watermark/encode", {
        "content_id": content_id,
        "content_type": "image",
        "file_format": fmt,
    })
    job_id = resp["data"]["job_id"]

    for attempt in range(60):
        time.sleep(3)
        resp = api_get(f"/watermark/jobs/{job_id}")
        job = resp["data"].get("job", resp["data"])
        status = job.get("status")
        if status == 3:
            prov = job.get("provenance", {})
            return {
                "content_id": content_id,
                "watermark_ref": prov.get("watermark_ref", ""),
                "download_url": job.get("download_url", ""),
            }
        elif status == 4:
            raise Exception(f"Encode failed: {job}")

    raise Exception("Encode timed out")


def main():
    # Check credits
    resp = api_get("/credits")
    balance = resp["data"]["credits"]["balance_microdollars"] / 1_000_000
    print(f"Credits: ${balance:.2f}\n")

    # Load existing manifest
    manifest_path = IMAGES_DIR / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
    else:
        manifest = {"images": []}

    existing_count = len(manifest["images"])
    start_idx = existing_count + 1  # demo-11, demo-12, etc.

    for i, (category, creator) in enumerate(zip(CATEGORIES, CREATORS)):
        idx = start_idx + i
        filename = f"demo-{idx:02d}.jpg"
        filepath = IMAGES_DIR / filename

        print(f"=== [{i+1}/20] {filename} — {category} → {creator['handle']} ===")

        # Download from Unsplash
        print(f"  1. Downloading from Unsplash ({category})...")
        if not download_image(i, filepath):
            print(f"  SKIP: download failed")
            continue
        size_kb = os.path.getsize(filepath) / 1024
        print(f"     {size_kb:.0f} KB")

        # Watermark
        print(f"  2. Watermarking...")
        try:
            result = encode_image(filepath)
            print(f"     ref: {result['watermark_ref']}")

            # Download watermarked version
            if result["download_url"]:
                print(f"  3. Downloading watermarked file...")
                r = requests.get(result["download_url"])
                r.raise_for_status()
                with open(filepath, "wb") as f:
                    f.write(r.content)
                print(f"     saved")

            manifest["images"].append({
                "id": f"demo-{idx:02d}",
                "filename": filename,
                "src": f"/content/images/{filename}",
                "watermark_ref": result.get("watermark_ref"),
                "content_id": result.get("content_id"),
                "creator": {**creator, "caption": category.replace("_", " ").title()},
            })

        except Exception as e:
            print(f"  ERROR: {e}")
            # Remove failed download
            if filepath.exists():
                filepath.unlink()

        print()

    # Save manifest
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    total = len(manifest["images"])
    new = total - existing_count
    print(f"Done. Added {new} new images. Total: {total}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
