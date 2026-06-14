import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.verda.ai/api/v2/enterprise";
const API_KEY = process.env.VERDA_API_KEY || "";

async function apiGet(path: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
}

async function apiPost(path: string, body: Record<string, string>) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
}

/**
 * POST /api/decode
 * Accepts a manipulated image as form data, runs it through Verda decode.
 * Returns { match, confidence, watermark_ref, traced_to }
 */
export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "VERDA_API_KEY not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name || "image.jpg";
    const fmt = filename.split(".").pop()?.toLowerCase() || "jpg";

    // Step 1: Get presigned upload URL
    const uploadResp = await apiGet(
      `/watermark/upload-url?filename=${encodeURIComponent(filename)}&content_type=image&file_format=${fmt}`
    );
    const { upload_url, content_id } = uploadResp.data;

    // Step 2: Upload file to presigned URL
    const fileBuffer = await file.arrayBuffer();
    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      body: fileBuffer,
      headers: { "Content-Type": file.type || "image/jpeg" },
    });
    if (!uploadRes.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Step 3: Start decode job
    const decodeResp = await apiPost("/watermark/decode", {
      content_id,
      content_type: "image",
      file_format: fmt,
    });
    const jobId = decodeResp.data.job_id;

    // Step 4: Poll for result (max 90 seconds)
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const jobResp = await apiGet(`/watermark/jobs/${jobId}`);
      const job = jobResp.data.job || jobResp.data;
      const status = job.status;

      if (status === 3 || status === "COMPLETED") {
        // Decode response shape:
        // { match: bool, provenance: { watermark_ref, owner_id, status } }
        // No confidence field from API — match is boolean
        const prov = job.provenance || {};
        const isMatch = job.match === true;
        return NextResponse.json({
          match: isMatch,
          watermark_ref: isMatch ? (prov.watermark_ref || "") : null,
          traced_to: isMatch ? (prov.owner_id || "") : null,
          job_id: jobId,
        });
      }

      if (status === 4 || status === "FAILED") {
        return NextResponse.json({
          match: false,
          watermark_ref: null,
          traced_to: null,
          job_id: jobId,
        });
      }
    }

    return NextResponse.json({ error: "Decode timed out" }, { status: 504 });
  } catch (err) {
    console.error("Decode error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
