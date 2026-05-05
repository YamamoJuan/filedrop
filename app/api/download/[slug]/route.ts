import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const BUCKET = process.env.SUPABASE_BUCKET_NAME || "filedrop";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerClient();
  const { data: share, error } = await supabase.from("file_shares").select("*").eq("share_slug", params.slug).single();

  if (error || !share) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  if (new Date(share.expires_at) < new Date()) return NextResponse.json({ error: "File sudah expired." }, { status: 410 });

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET).createSignedUrl(share.storage_path, 60, { download: share.original_filename });

  if (signedError || !signedData) return NextResponse.json({ error: "Gagal membuat download URL." }, { status: 500 });

  supabase.from("file_shares").update({ download_count: share.download_count + 1 }).eq("share_slug", params.slug).then(() => {});

  return NextResponse.json({ downloadUrl: signedData.signedUrl });
}
