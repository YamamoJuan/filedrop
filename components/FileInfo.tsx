import { FileShare } from "@/lib/types";
import { formatBytes, formatExpiry } from "@/lib/crypto";

export function FileInfo({ share }: { share: FileShare }) {
  const isExpired = new Date(share.expires_at) < new Date();
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {[
        { label: "📄 Nama File",    value: share.original_filename,                               mono: true },
        { label: "📦 Ukuran",       value: formatBytes(share.size_bytes) },
        { label: "⏱ Kadaluarsa",   value: isExpired ? "Sudah expired" : formatExpiry(share.expires_at), red: isExpired },
        { label: "⬇️ Didownload",  value: `${share.download_count}×` },
      ].map(({ label, value, mono, red }) => (
        <div key={label} className="glass rounded-xl p-3 space-y-1">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`font-medium truncate ${red ? "text-red-400" : mono ? "text-slate-200 font-mono text-xs" : "text-slate-100"}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
