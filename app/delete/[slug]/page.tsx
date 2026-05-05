"use client";

import { useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

type State = "confirm" | "deleting" | "success" | "error";

export default function DeletePage() {
  const params      = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const token       = searchParams.get("token");

  const [state,   setState]   = useState<State>("confirm");
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!token) { setMessage("Token tidak ditemukan di URL."); setState("error"); return; }
    setState("deleting");
    try {
      const res = await fetch("/api/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: params.slug, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus file.");
      setState("success"); setMessage(data.message);
    } catch (err: any) { setState("error"); setMessage(err.message); }
  };

  const cfg = {
    confirm:  { icon: "🗑️", title: "Hapus File?",            color: "text-white" },
    deleting: { icon: "⏳", title: "Menghapus...",            color: "text-slate-400" },
    success:  { icon: "✅", title: "File Berhasil Dihapus",   color: "text-emerald-400" },
    error:    { icon: "❌", title: "Gagal Menghapus",         color: "text-red-400" },
  }[state];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="glass rounded-2xl p-8 text-center space-y-5 max-w-sm w-full">
        <div className="text-5xl">{cfg.icon}</div>
        <div>
          <h1 className={`text-xl font-bold ${cfg.color}`}>{cfg.title}</h1>
          {message && <p className="text-slate-400 text-sm mt-2">{message}</p>}
          {state === "confirm" && <p className="text-slate-400 text-sm mt-2">Tindakan ini tidak bisa dibatalkan. File akan dihapus permanen.</p>}
        </div>
        {state === "confirm" && (
          <div className="flex flex-col gap-3">
            <button onClick={handleDelete} className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors rounded-xl font-semibold text-white">Ya, Hapus File</button>
            <a href="/" className="w-full py-3 glass rounded-xl font-medium text-slate-300 hover:bg-white/10 transition-colors block">Batal</a>
          </div>
        )}
        {(state === "success" || state === "error") && (
          <a href="/" className="inline-block px-6 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl text-sm font-semibold text-white">Kembali ke Home</a>
        )}
      </div>
    </main>
  );
}
