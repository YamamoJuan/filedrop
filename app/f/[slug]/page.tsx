import { createServerClient } from "@/lib/supabase-server";
import { FileInfo } from "@/components/FileInfo";
import { notFound } from "next/navigation";
import { DownloadButton } from "./DownloadButton";

export default async function DownloadPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();
  const { data: share, error } = await supabase.from("file_shares").select("*").eq("share_slug", params.slug).single();
  if (error || !share) notFound();

  const isExpired = new Date(share.expires_at) < new Date();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <header className="fixed top-0 left-0 right-0 border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="flex items-center gap-2 font-bold text-lg text-white w-fit">
            <span className="text-2xl">⚡</span>FileDrop
          </a>
        </div>
      </header>

      <div className="w-full max-w-md space-y-4 mt-8">
        {isExpired ? (
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <div className="text-5xl">⏰</div>
            <h1 className="text-xl font-bold text-white">File Sudah Expired</h1>
            <p className="text-slate-400 text-sm">File ini sudah tidak tersedia karena waktu berbaginya sudah habis.</p>
            <a href="/" className="inline-block mt-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl text-sm font-semibold text-white">Upload file baru →</a>
          </div>
        ) : (
          <>
            <div className="glass rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center text-3xl shrink-0">📄</div>
                <div className="min-w-0">
                  <h1 className="text-base font-semibold text-white truncate">{share.original_filename}</h1>
                </div>
              </div>
              <hr className="border-white/10" />
              <FileInfo share={share} />
            </div>
            <DownloadButton slug={params.slug} />
            <p className="text-center text-xs text-slate-700">Pengguna bertanggung jawab atas konten yang didownload.</p>
          </>
        )}
      </div>
    </main>
  );
}
