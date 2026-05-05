"use client";

import { useState, useCallback } from "react";
import { UploadZone } from "@/components/UploadZone";
import { UploadResult } from "@/components/UploadResult";
import { Toast } from "@/components/Toast";
import { ToastMessage } from "@/lib/types";

let toastCounter = 0;

export default function HomePage() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [result, setResult] = useState<{
    shareUrl: string;
    deleteToken: string;
    slug: string;
  } | null>(null);

  const addToast = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = String(++toastCounter);
    setToasts((prev) => [...prev, { ...msg, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSuccess = (shareUrl: string, deleteToken: string, slug: string) => {
    setResult({ shareUrl, deleteToken, slug });
  };

  const handleReset = () => setResult(null);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="text-2xl">⚡</span>FileDrop
          </a>
          <span className="text-xs text-slate-600 hidden sm:block">Gratis · Tanpa login · Direct upload</span>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {!result ? (
          <div className="w-full max-w-xl space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Share files{" "}
                <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  instantly
                </span>
              </h1>
              <p className="text-slate-400 text-base">Upload sekali, bagikan linknya. Tidak perlu akun.</p>
            </div>
            <UploadZone onSuccess={handleSuccess} onAddToast={addToast} />
            <p className="text-center text-xs text-slate-700 px-4">
              Pengguna bertanggung jawab penuh atas file yang dibagikan. Jangan upload konten ilegal.
            </p>
          </div>
        ) : (
          <UploadResult
            shareUrl={result.shareUrl}
            deleteToken={result.deleteToken}
            shareSlug={result.slug}
            onAddToast={addToast}
            onReset={handleReset}
          />
        )}
      </section>

      <footer className="border-t border-white/5 px-6 py-4 text-center">
        <p className="text-xs text-slate-700">FileDrop MVP · Powered by Supabase & Next.js</p>
      </footer>

      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
