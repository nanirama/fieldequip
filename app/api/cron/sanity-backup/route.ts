import { NextRequest, NextResponse } from "next/server";
import { runSanityBackup } from "@/src/lib/sanity-backup";

export const maxDuration = 300; // 5 min — Vercel Pro; use 60 for Hobby plan

export async function GET(req: NextRequest) {
  // Vercel injects Authorization: Bearer <CRON_SECRET> automatically.
  // This guard also blocks direct browser/curl hits.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[sanity-backup] Starting monthly backup…");

  try {
    const result = await runSanityBackup();

    if (!result.success) {
      console.error("[sanity-backup] Failed:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    console.log(
      `[sanity-backup] Done — ${result.filename} | ` +
      `docs: ${result.documentCount} | assets: ${result.assetCount} | ` +
      `images: ${result.imageCount} | ${result.sizeKB} KB | ${result.duration} ms`,
    );

    return NextResponse.json({
      success: true,
      filename: result.filename,
      location: result.location,
      documentCount: result.documentCount,
      assetCount: result.assetCount,
      imageCount: result.imageCount,
      sizeKB: result.sizeKB,
      durationMs: result.duration,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sanity-backup] Unhandled error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
