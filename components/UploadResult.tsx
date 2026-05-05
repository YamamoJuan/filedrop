"use client";

import { ToastMessage } from "@/lib/types";

interface Props {
  shareUrl: string;
  deleteToken: string;
  shareSlug: string;
  onAddToast: (msg: Omit<ToastMessage, "id">) => void;
  onReset: () => void;
}

export function UploadResult({ shareUrl, deleteToken, shareSlug, onAddToast, onReset }: Props) {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const deleteUrl = `${appUrl}/delete/${shareSlug}?token=${deleteToken}`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onAddToast({ type: "success", message: `${label} berhasil disalin!` });
    } catch {
      onAddToast({ type: "error", message: "Gagal menyalin ke clipboard." });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl">✅</div>
          <div>
            <h2 className="text-lg font-semibold text-white">Upload Berhasil!</h2>
            <p className="text-sm text-slate-400">File siap untuk dibagikan.</p>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">🔗 Share Link</label>
          <div className="flex gap-2">
            <input readOnly value={shareUrl} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none font-mono truncate" />
            <button onClick={() => copy(shareUrl, "Share link")} className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl text-sm font-semibold text-white shrink-0">Salin</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">🗑️ Delete Link (simpan baik-baik!)</label>
          <div className="flex gap-2">
            <input readOnly value={deleteUrl} className="flex-1 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5 text-sm text-amber-200/80 focus:outline-none font-mono truncate" />
            <button onClick={() => copy(deleteUrl, "Delete link")} className="px-4 py-2.5 bg-amber-600/60 hover:bg-amber-500/60 transition-colors rounded-xl text-sm font-semibold text-amber-100 shrink-0">Salin</button>
          </div>
          <p className="text-xs text-amber-400/60">⚠️ Simpan link ini. Setelah keluar halaman, token tidak bisa dipulihkan.</p>
        </div>
      </div>

      <button onClick={onReset} className="w-full py-3 glass rounded-2xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
        + Upload file lain
      </button>
    </div>
  );
}
