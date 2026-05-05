import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { hashToken } from "@/lib/crypto";

const BUCKET = process.env.SUPABASE_BUCKET_NAME || "filedrop";

export async function POST(req: NextRequest) {
  let body: { slug: string; token: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Request tidak valid." }, { status: 400 }); }

  const { slug, token } = body;
  if (!slug || !token) return NextResponse.json({ error: "Slug dan token diperlukan." }, { status: 400 });

  const supabase = createServerClient();
  const { data: share, error } = await supabase.from("file_shares").select("*")
    .eq("share_slug", slug).eq("delete_token_hash", hashToken(token)).single();

  if (error || !share) return NextResponse.json({ error: "Token tidak valid atau file tidak ditemukan." }, { status: 403 });

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([share.storage_path]);
  if (storageError) console.error("Storage delete error:", storageError);

  await supabase.from("file_shares").delete().eq("share_slug", slug);
  return NextResponse.json({ success: true, message: "File berhasil dihapus." });
}
