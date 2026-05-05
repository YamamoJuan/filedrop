"use client";

import { useState } from "react";

export function DownloadButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/download/${slug}`);
      if (!res.ok) { const { error } = await res.json(); throw new Error(error || "Gagal memulai download."); }
      const { downloadUrl } = await res.json();
      window.location.href = downloadUrl;
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-2">
      <button onClick={handleDownload} disabled={loading}
        className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:cursor-not-allowed transition-colors rounded-2xl text-base font-semibold text-white">
        {loading ? "Menyiapkan..." : "⬇️  Download File"}
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
