/**
 * Sanity monthly backup — exact Sanity CLI export format.
 *
 * Output structure (inside tar.gz or local folder):
 *   sanity-backup-YYYY-MM-DD/
 *     data.ndjson    — all Sanity documents
 *     assets.json    — sanity.imageAsset + sanity.fileAsset records
 *     images/        — image files downloaded from Sanity CDN
 *
 * Storage strategy:
 *   Production (BLOB_READ_WRITE_TOKEN set) → Vercel Blob, single tar.gz (private)
 *   Development / self-hosted              → src/backups/sanity-backup-YYYY-MM-DD/
 *
 * Required env vars:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   SANITY_API_READ_TOKEN
 *   BLOB_READ_WRITE_TOKEN  (production — Vercel Dashboard → Storage → Blob)
 *
 * Optional:
 *   NEXT_PUBLIC_SANITY_DATASET  (default: "production")
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { create as tarCreate } from "tar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackupResult {
  success: boolean;
  filename?: string;
  /** Local folder path or Vercel Blob URL */
  location?: string;
  documentCount?: number;
  assetCount?: number;
  imageCount?: number;
  sizeKB?: number;
  duration?: number;
  error?: string;
}

interface SanityAssetDoc {
  _id: string;
  _type: string;
  url?: string;
  path?: string;
  originalFilename?: string;
  size?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const IMAGE_CONCURRENCY = 10;          // parallel image downloads
const EXPORT_TIMEOUT_MS = 3 * 60_000; // 3 min for NDJSON stream
const IMAGE_TIMEOUT_MS = 60_000;       // 1 min per image

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function runSanityBackup(): Promise<BackupResult> {
  const start = Date.now();

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production").trim();
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (!projectId || !token) {
    return {
      success: false,
      error: "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_READ_TOKEN",
    };
  }

  // Format: YYYY-MM-DD-HH-MM — allows multiple manual runs per day
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}-${pad(now.getUTCHours())}-${pad(now.getUTCMinutes())}`;
  const folderName = `sanity-backup-${stamp}`;
  const tarName = `${folderName}.tar.gz`;

  // ── Idempotency check before doing any work ───────────────────────────────
  if (blobToken) {
    const { list } = await import("@vercel/blob");
    const { blobs: existing } = await list({ prefix: `sanity-backups/${tarName}`, token: blobToken });
    if (existing.length > 0) {
      return {
        success: true,
        filename: tarName,
        location: existing[0].url,
        sizeKB: Math.round(existing[0].size / 1024),
        duration: Date.now() - start,
      };
    }
  } else {
    if (process.env.VERCEL === "1") {
      return {
        success: false,
        error: "BLOB_READ_WRITE_TOKEN is required on Vercel. Add it in Project → Settings → Environment Variables.",
      };
    }
    const localFolder = path.join(process.cwd(), "src", "backups", folderName);
    if (fs.existsSync(localFolder)) {
      return { success: true, filename: folderName, location: localFolder, duration: Date.now() - start };
    }
  }

  // ── Stage everything in /tmp ──────────────────────────────────────────────
  const tmpBase = "/tmp/sanity-backups";
  const tmpFolder = path.join(tmpBase, folderName);
  const tmpImagesDir = path.join(tmpFolder, "images");
  const tmpDataPath = path.join(tmpFolder, "data.ndjson");
  const tmpAssetsPath = path.join(tmpFolder, "assets.json");
  const tmpTarPath = path.join(tmpBase, tarName);

  // Clean any leftover from a previous failed run
  safeRmDir(tmpFolder);
  safeUnlink(tmpTarPath);

  try {
    fs.mkdirSync(tmpImagesDir, { recursive: true });

    // ── Step 1: Stream NDJSON, write data.ndjson, collect asset docs ─────────
    const { documentCount, allAssets, imageAssets } = await streamExport(
      projectId, dataset, token, tmpDataPath,
    );

    // ── Step 2: Write assets.json ─────────────────────────────────────────────
    fs.writeFileSync(tmpAssetsPath, JSON.stringify(allAssets, null, 2), "utf8");

    // ── Step 3: Download images in parallel ───────────────────────────────────
    const imageCount = await downloadImages(imageAssets, tmpImagesDir, token);

    // ── Step 4: Package as tar.gz ─────────────────────────────────────────────
    await createTarGz(tmpFolder, tmpTarPath);
    const sizeKB = Math.round(fs.statSync(tmpTarPath).size / 1024);

    // ── Step 5: Persist ───────────────────────────────────────────────────────
    let location: string;

    if (blobToken) {
      const { put, list, del } = await import("@vercel/blob");
      const webStream = Readable.toWeb(fs.createReadStream(tmpTarPath)) as ReadableStream;
      const blob = await put(`sanity-backups/${tarName}`, webStream, {
        access: "private",
        contentType: "application/gzip",
        token: blobToken,
      });
      location = blob.url;
      await cleanOldBlobBackups({ list, del, token: blobToken, keepCount: 6 });
    } else {
      const localBase = path.join(process.cwd(), "src", "backups");
      const localFolder = path.join(localBase, folderName);
      fs.mkdirSync(localBase, { recursive: true });
      copyDirSync(tmpFolder, localFolder);
      location = localFolder;
      cleanOldLocalFolders(localBase, 6);
    }

    return {
      success: true,
      filename: blobToken ? tarName : folderName,
      location,
      documentCount,
      assetCount: allAssets.length,
      imageCount,
      sizeKB,
      duration: Date.now() - start,
    };
  } catch (err) {
    return { success: false, error: toMessage(err) };
  } finally {
    // Always clean up /tmp staging — even on success
    safeRmDir(tmpFolder);
    safeUnlink(tmpTarPath);
  }
}

// ─── NDJSON stream ────────────────────────────────────────────────────────────

async function streamExport(
  projectId: string,
  dataset: string,
  token: string,
  dataPath: string,
): Promise<{ documentCount: number; allAssets: SanityAssetDoc[]; imageAssets: SanityAssetDoc[] }> {
  const url = `https://${projectId}.api.sanity.io/v2021-06-07/data/export/${dataset}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(EXPORT_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`Sanity Export API ${res.status}: ${text}`);
  }
  if (!res.body) throw new Error("Sanity Export API returned empty body");

  const nodeStream = Readable.fromWeb(
    res.body as import("stream/web").ReadableStream<Uint8Array>,
  );
  const rl = readline.createInterface({ input: nodeStream, crlfDelay: Infinity });
  const dataStream = createWriteStream(dataPath);

  const allAssets: SanityAssetDoc[] = [];
  const imageAssets: SanityAssetDoc[] = [];
  let documentCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    dataStream.write(line + "\n");
    documentCount++;
    try {
      const doc = JSON.parse(line) as SanityAssetDoc;
      if (doc._type === "sanity.imageAsset") {
        allAssets.push(doc);
        if (doc.url && doc.path) imageAssets.push(doc);
      } else if (doc._type === "sanity.fileAsset") {
        allAssets.push(doc);
      }
    } catch {
      // Malformed line — written to data.ndjson as-is, skipped for assets
    }
  }

  await closeWriteStream(dataStream);
  return { documentCount, allAssets, imageAssets };
}

// ─── Image download ───────────────────────────────────────────────────────────

async function downloadImages(
  assets: SanityAssetDoc[],
  imagesDir: string,
  token: string,
): Promise<number> {
  if (assets.length === 0) return 0;

  let downloaded = 0;
  const queue = [...assets];

  const worker = async () => {
    while (queue.length > 0) {
      const asset = queue.shift()!;
      if (!asset.url || !asset.path) continue;

      // asset.path = "images/hash-WxH.ext" — take the basename
      const filename = path.basename(asset.path);
      const filePath = path.join(imagesDir, filename);
      if (fs.existsSync(filePath)) { downloaded++; continue; }

      try {
        const res = await fetch(asset.url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
        });
        if (!res.ok || !res.body) {
          console.warn(`[sanity-backup] Image ${filename}: HTTP ${res.status} — skipped`);
          continue;
        }
        const stream = Readable.fromWeb(res.body as import("stream/web").ReadableStream<Uint8Array>);
        await pipeline(stream, createWriteStream(filePath));
        downloaded++;
      } catch (err) {
        console.warn(`[sanity-backup] Image ${filename} failed: ${toMessage(err)} — skipped`);
        safeUnlink(filePath);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(IMAGE_CONCURRENCY, assets.length) }, worker),
  );

  return downloaded;
}

// ─── Tar.gz packaging ─────────────────────────────────────────────────────────

async function createTarGz(sourceDir: string, outputPath: string): Promise<void> {
  await tarCreate(
    { gzip: true, file: outputPath, cwd: path.dirname(sourceDir), portable: true },
    [path.basename(sourceDir)],
  );
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

function cleanOldLocalFolders(dir: string, keepCount: number): void {
  try {
    const folders = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith("sanity-backup-"))
      .map((e) => ({ name: e.name, mtime: fs.statSync(path.join(dir, e.name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const { name } of folders.slice(keepCount)) {
      safeRmDir(path.join(dir, name));
      console.log(`[sanity-backup] Deleted old folder: ${name}`);
    }
  } catch (err) {
    console.warn("[sanity-backup] Local cleanup warning:", err);
  }
}

async function cleanOldBlobBackups({
  list,
  del,
  token,
  keepCount,
}: {
  list: typeof import("@vercel/blob").list;
  del: typeof import("@vercel/blob").del;
  token: string;
  keepCount: number;
}): Promise<void> {
  try {
    const { blobs } = await list({ prefix: "sanity-backups/sanity-backup-", token });
    const sorted = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
    for (const blob of sorted.slice(keepCount)) {
      await del(blob.url, { token });
      console.log(`[sanity-backup] Deleted old blob: ${blob.pathname}`);
    }
  } catch (err) {
    console.warn("[sanity-backup] Blob cleanup warning:", err);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

function closeWriteStream(stream: fs.WriteStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function safeUnlink(filepath: string): void {
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch {}
}

function safeRmDir(dirpath: string): void {
  try {
    if (fs.existsSync(dirpath)) fs.rmSync(dirpath, { recursive: true, force: true });
  } catch {}
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
