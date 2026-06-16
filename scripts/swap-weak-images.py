"""Replace weak/small images with higher-res ones from Picsum, watermark, verify."""

import os
import sys
import time
import tempfile
import json
from pathlib import Path

import requests

SDK_PATH = Path(__file__).resolve().parent.parent.parent / "sdk-python"
sys.path.insert(0, str(SDK_PATH))
from verda import VerdaClient

API_KEY = os.environ.get("VERDA_API_KEY", "")
IMAGES_DIR = Path(__file__).resolve().parent.parent / "public" / "content" / "images"

# All images under 200KB or that failed in tests
# Using diverse Picsum IDs at 1200x1600 for good watermark resilience
REPLACEMENTS = {
    "demo-03.jpg": 101,
    "demo-05.jpg": 102,
    "demo-12.jpg": 119,
    "demo-15.jpg": 120,
    "demo-23.jpg": 129,
    "demo-24.jpg": 133,
    "demo-28.jpg": 137,
    "demo-29.jpg": 139,
}

JOBS_FILE = IMAGES_DIR / "swap-jobs.json"

def main():
    client = VerdaClient(api_key=API_KEY)
    print(f"Credits: ${client.credits().balance_dollars:.2f}")

    manifest_path = IMAGES_DIR / "manifest.json"
    manifest = json.load(open(manifest_path))

    # Phase 1: Download + encode all
    if JOBS_FILE.exists():
        print(f"Resuming from {JOBS_FILE}")
        saved = json.load(open(JOBS_FILE))
    else:
        saved = {}
        for filename, picsum_id in REPLACEMENTS.items():
            filepath = IMAGES_DIR / filename
            print(f"\n=== {filename} (picsum id={picsum_id}) ===")

            # Download
            url = f"https://picsum.photos/id/{picsum_id}/1200/1600"
            print(f"  Downloading...")
            r = requests.get(url, timeout=20, allow_redirects=True)
            if r.status_code != 200 or len(r.content) < 10000:
                print(f"  SKIP: HTTP {r.status_code}")
                continue
            print(f"  {len(r.content) / 1024:.0f} KB")

            # Save temp + encode
            tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
            tmp.write(r.content)
            tmp.close()

            print(f"  Encoding (wait=False)...")
            job_id = client.encode(file=tmp.name, content_type="image", wait=False)
            saved[filename] = {"job_id": job_id, "tmp": tmp.name}
            print(f"  job_id: {job_id}")

        with open(JOBS_FILE, "w") as f:
            json.dump(saved, f, indent=2)
        print(f"\nSaved {len(saved)} jobs to {JOBS_FILE}")

    # Phase 2: Poll for encode completion + download watermarked files
    print(f"\nPolling {len(saved)} encode jobs...")
    remaining = dict(saved)
    while remaining:
        time.sleep(5)
        done_keys = []
        for filename, info in remaining.items():
            try:
                job = client.get_job(info["job_id"])
                if job.status == "COMPLETED":
                    filepath = IMAGES_DIR / filename
                    if job.download_url:
                        wr = requests.get(job.download_url)
                        with open(filepath, "wb") as f:
                            f.write(wr.content)
                        print(f"  {filename}: {len(wr.content) / 1024:.0f} KB, ref={getattr(job, 'watermark_ref', '') or (job.provenance or {}).get('watermark_ref', '')}")

                        # Update manifest
                        wref = getattr(job, 'watermark_ref', '') or (job.provenance or {}).get('watermark_ref', '')
                        for entry in manifest["images"]:
                            if entry["filename"] == filename:
                                entry["watermark_ref"] = wref
                                break
                    done_keys.append(filename)
                    # Clean up temp
                    if info.get("tmp") and os.path.exists(info["tmp"]):
                        os.unlink(info["tmp"])
                elif job.status == "FAILED":
                    print(f"  {filename}: FAILED")
                    done_keys.append(filename)
            except Exception as e:
                pass  # retry next round
        for k in done_keys:
            del remaining[k]
        print(f"  {len(saved) - len(remaining)}/{len(saved)} done, {len(remaining)} pending")

    # Save manifest
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # Clean up jobs file
    os.unlink(JOBS_FILE)

    print(f"\nDone. New sizes:")
    for filename in REPLACEMENTS:
        size = os.path.getsize(IMAGES_DIR / filename) / 1024
        print(f"  {filename}: {size:.0f} KB")

if __name__ == "__main__":
    main()
