import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const BUCKET = process.env.SUPABASE_BUCKET_NAME || "filedrop";

async function runCleanup() {
  const supabase = createServerClient();
  const { data: expiredFiles, error } = await supabase.from("file_shares")
    .select("id, storage_path").lt("expires_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: "Gagal mengambil data expired." }, { status: 500 });
  if (!expiredFiles || expiredFiles.length === 0) return NextResponse.json({ deleted: 0, message: "Tidak ada file expired." });

  await supabase.storage.from(BUCKET).remove(expiredFiles.map((f) => f.storage_path));
  await supabase.from("file_shares").delete().in("id", expiredFiles.map((f) => f.id));

  return NextResponse.json({ deleted: expiredFiles.length, message: `Berhasil menghapus ${expiredFiles.length} file expired.` });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return runCleanup();
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return runCleanup();
}
