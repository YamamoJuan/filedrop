"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import { formatBytes } from "@/lib/crypto";
import { ExpiryOption, ToastMessage } from "@/lib/types";

const MAX_MB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50", 10);
const BLOCKED_EXT = [".exe",".bat",".cmd",".scr",".ps1",".sh",".apk",".com",".vbs",".msi",".dll",".pif"];

interface Props {
  onSuccess: (shareUrl: string, deleteToken: string, slug: string) => void;
  onAddToast: (msg: Omit<ToastMessage, "id">) => void;
}

export function UploadZone({ onSuccess, onAddToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [expiry, setExpiry] = useState<ExpiryOption>("24h");
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<"idle" | "uploading">("idle");

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_MB * 1024 * 1024) return `File terlalu besar. Maksimal ${MAX_MB}MB.`;
    const ext = ("." + f.name.split(".").pop()).toLowerCase();
    if (BLOCKED_EXT.includes(ext)) return `Tipe file ${ext} tidak diizinkan.`;
    return null;
  };

  const handleFilePick = (f: File) => {
    const err = validateFile(f);
    if (err) { onAddToast({ type: "error", message: err }); return; }
    setFile(f);
  };

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFilePick(f);
  }, []);

  const onDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFilePick(f); };

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading"); setProgress(0);
    try {
      const initRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size, expiry }),
      });
      if (!initRes.ok) { const { error } = await initRes.json(); throw new Error(error || "Gagal menginisialisasi upload."); }
      const { signedUploadUrl, shareSlug, token } = await initRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload  = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload gagal: status ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error saat upload."));
        xhr.send(file);
      });

      setProgress(100);
      const shareUrl = `${window.location.origin}/f/${shareSlug}`;
      onSuccess(shareUrl, token, shareSlug);
      onAddToast({ type: "success", message: "File berhasil diupload!" });
    } catch (err: any) {
      onAddToast({ type: "error", message: err.message || "Upload gagal." });
      setState("idle");
    }
  };

  const expiryLabels: Record<ExpiryOption, string> = { "1h": "1 Jam", "24h": "24 Jam", "7d": "7 Hari" };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 p-10 min-h-[220px] ${
          isDragging ? "border-sky-400 bg-sky-500/10"
          : file      ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
          :              "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
        }`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={onInputChange} />
        {!file ? (
          <>
            <div className="text-4xl">📂</div>
            <div className="text-center">
              <p className="text-base font-medium text-slate-200">Drag & drop file di sini</p>
              <p className="text-sm text-slate-500 mt-1">atau klik untuk memilih file</p>
            </div>
            <span className="text-xs text-slate-600 mt-1">Maks. {MAX_MB}MB · Semua tipe kecuali .exe, .bat, dll.</span>
          </>
        ) : (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-xl shrink-0">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
              </div>
              {state === "idle" && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); if (inputRef.current) inputRef.current.value = ""; }}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-300 shrink-0"
                >✕</button>
              )}
            </div>
            {state === "uploading" && (
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 text-right">{progress}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {state === "idle" && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <span className="text-sm text-slate-400 shrink-0">⏱ Kadaluarsa:</span>
          <div className="flex gap-2">
            {(["1h","24h","7d"] as ExpiryOption[]).map((opt) => (
              <button key={opt} onClick={() => setExpiry(opt)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${expiry === opt ? "bg-sky-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                {expiryLabels[opt]}
              </button>
            ))}
          </div>
        </div>
      )}

      {file && state === "idle" && (
        <button onClick={handleUpload} className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-colors rounded-2xl text-base font-semibold text-white">
          Upload & Buat Link →
        </button>
      )}
      {state === "uploading" && (
        <div className="w-full py-3.5 glass rounded-2xl text-base font-semibold text-slate-400 text-center cursor-not-allowed">Mengupload...</div>
      )}
    </div>
  );
}
