"""Watermark the demo images using the enterprise API's 3-step flow.

Bypasses the SDK's broken fast-path and uses the same flow as the
enterprise portal: upload-url → PUT file → POST encode → poll job → download.
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
ORIGINALS_DIR = IMAGES_DIR / "originals"

HEADERS = {
    "X-API-Key": API_KEY,
    "User-Agent": "verda-game-pipeline/1.0",
}

CREATORS = [
    {"handle": "@sarahchen", "name": "Sarah Chen", "caption": "Golden hour at the coast"},
    {"handle": "@marcusrivera", "name": "Marcus Rivera", "caption": "Street photography downtown"},
    {"handle": "@aishapatel", "name": "Aisha Patel", "caption": "Morning light in the studio"},
    {"handle": "@jamesokafor", "name": "James Okafor", "caption": "Architecture at dusk"},
    {"handle": "@lena.wilde", "name": "Lena Wilde", "caption": "Portrait session"},
    {"handle": "@kofi.builds", "name": "Kofi Mensah", "caption": "City skyline at night"},
    {"handle": "@rin_makes", "name": "Rin Tanaka", "caption": "Travel photography"},
    {"handle": "@dao.studio", "name": "Dao Studio", "caption": "Creative still life"},
    {"handle": "@nova_grabs", "name": "Nova Chen", "caption": "Festival moments"},
    {"handle": "@jules.frame", "name": "Jules Martin", "caption": "Autumn in the park"},
]


def api_get(path, **kwargs):
    r = requests.get(f"{API_BASE}{path}", headers={**HEADERS, "Content-Type": "application/json"}, **kwargs)
    r.raise_for_status()
    return r.json()


def api_post(path, data):
    r = requests.post(f"{API_BASE}{path}", headers={**HEADERS, "Content-Type": "application/json"}, json=data)
    r.raise_for_status()
    return r.json()


def encode_image(file_path: Path) -> dict:
    """Encode using the enterprise portal's 3-step flow."""
    filename = file_path.name
    fmt = file_path.suffix.lstrip(".").lower()

    # Step 1: Get presigned upload URL
    print(f"  1. Getting upload URL...")
    resp = api_get(f"/watermark/upload-url?filename={filename}&content_type=image&file_format={fmt}")
    upload_url = resp["data"]["upload_url"]
    content_id = resp["data"]["content_id"]
    print(f"     content_id: {content_id}")

    # Step 2: Upload file to presigned URL
    print(f"  2. Uploading file...")
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    r = requests.put(upload_url, data=file_bytes, headers={"Content-Type": "image/jpeg"})
    r.raise_for_status()
    print(f"     uploaded {len(file_bytes)} bytes")

    # Step 3: Start encode job
    print(f"  3. Starting encode...")
    resp = api_post("/watermark/encode", {
        "content_id": content_id,
        "content_type": "image",
        "file_format": fmt,
    })
    job_id = resp["data"]["job_id"]
    print(f"     job_id: {job_id}")

    # Step 4: Poll for completion
    # Status codes: 3 = COMPLETED, 4 = FAILED
    # Response shape: { data: { job: { status, download_url, provenance: { watermark_ref } } } }
    print(f"  4. Polling...")
    for attempt in range(60):
        time.sleep(3)
        resp = api_get(f"/watermark/jobs/{job_id}")
        job = resp["data"].get("job", resp["data"])
        status = job.get("status")
        print(f"     attempt {attempt + 1}: status={status}")
        if status == 3 or status == "COMPLETED":
            download_url = job.get("download_url", "")
            prov = job.get("provenance", {})
            watermark_ref = prov.get("watermark_ref", job.get("watermark_ref", ""))
            return {
                "job_id": job_id,
                "content_id": content_id,
                "watermark_ref": watermark_ref,
                "download_url": download_url,
            }
        elif status == 4 or status == "FAILED":
            raise Exception(f"Encode failed: {job}")

    raise Exception("Encode timed out after 3 minutes")


def download_file(url: str, dest: Path):
    r = requests.get(url, stream=True)
    r.raise_for_status()
    with open(dest, "wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)


def main():
    # Check credits
    resp = api_get("/credits")
    balance = resp["data"]["credits"]["balance_microdollars"] / 1_000_000
    print(f"Credits: ${balance:.2f}\n")

    ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {"images": []}

    for i in range(1, 11):
        filename = f"demo-{i:02d}.jpg"
        src = IMAGES_DIR / filename

        if not src.exists():
            print(f"SKIP {filename} (not found)")
            continue

        # Backup original
        backup = ORIGINALS_DIR / filename
        if not backup.exists():
            shutil.copy2(src, backup)

        creator = CREATORS[i - 1]
        print(f"=== {filename} → {creator['handle']} ===")

        try:
            # Use the original (unwatermarked) version for encoding
            result = encode_image(backup)

            # Download watermarked version, overwrite the demo image
            if result.get("download_url"):
                print(f"  5. Downloading watermarked file...")
                download_file(result["download_url"], src)
                print(f"     saved to {src}")
            else:
                print(f"  WARN: No download URL in result")

            manifest["images"].append({
                "id": f"demo-{i:02d}",
                "filename": filename,
                "src": f"/content/images/{filename}",
                "watermark_ref": result.get("watermark_ref"),
                "content_id": result.get("content_id"),
                "creator": creator,
            })

        except Exception as e:
            print(f"  ERROR: {e}")
            manifest["images"].append({
                "id": f"demo-{i:02d}",
                "filename": filename,
                "src": f"/content/images/{filename}",
                "watermark_ref": None,
                "creator": creator,
            })

        print()

    # Save manifest
    manifest_path = IMAGES_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    ok = sum(1 for img in manifest["images"] if img.get("watermark_ref"))
    print(f"Done. Watermarked {ok}/{len(manifest['images'])} images.")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
