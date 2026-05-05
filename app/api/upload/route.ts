import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateSlug, hashToken, expiryToMs } from "@/lib/crypto";

const BLOCKED_EXTENSIONS = [".exe",".bat",".cmd",".scr",".ps1",".sh",".apk",".com",".vbs",".msi",".dll",".pif"];
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10);
const BUCKET = process.env.SUPABASE_BUCKET_NAME || "filedrop";

const uploadMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = uploadMap.get(ip);
  if (!entry || now > entry.resetAt) { uploadMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); return true; }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi dalam 10 menit." }, { status: 429 });

  let body: { filename: string; mimeType: string; sizeBytes: number; expiry: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Request tidak valid." }, { status: 400 }); }

  const { filename, mimeType, sizeBytes, expiry } = body;

  if (!sizeBytes || sizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024)
    return NextResponse.json({ error: `Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB.` }, { status: 413 });

  const ext = ("." + filename.split(".").pop()).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext))
    return NextResponse.json({ error: `Tipe file ${ext} tidak diizinkan.` }, { status: 400 });

  if (!mimeType || mimeType.length > 100)
    return NextResponse.json({ error: "MIME type tidak valid." }, { status: 400 });

  const shareSlug       = generateSlug(12);
  const deleteToken     = generateSlug(24);
  const deleteTokenHash = hashToken(deleteToken);
  const storagePath     = `uploads/${shareSlug}/${filename}`;
  const expiresAt       = new Date(Date.now() + expiryToMs(expiry)).toISOString();

  const supabase = createServerClient();

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET).createSignedUploadUrl(storagePath);

  if (signedError || !signedData) {
    console.error("Signed URL error:", signedError);
    return NextResponse.json({ error: "Gagal membuat upload URL." }, { status: 500 });
  }

  const { error: dbError } = await supabase.from("file_shares").insert({
    original_filename: filename, storage_path: storagePath, mime_type: mimeType,
    size_bytes: sizeBytes, share_slug: shareSlug, delete_token_hash: deleteTokenHash,
    expires_at: expiresAt, download_count: 0,
  });

  if (dbError) { console.error("DB insert error:", dbError); return NextResponse.json({ error: "Gagal menyimpan metadata." }, { status: 500 }); }

  return NextResponse.json({ signedUploadUrl: signedData.signedUrl, storagePath, shareSlug, token: deleteToken });
}
