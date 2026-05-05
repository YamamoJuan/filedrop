"use client";

import { useEffect } from "react";
import { ToastMessage } from "@/lib/types";

interface Props { toasts: ToastMessage[]; onRemove: (id: string) => void; }

const icons  = { success: "✅", error: "❌", info: "ℹ️" };
const colors = {
  success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  error:   "bg-red-500/20 border-red-500/40 text-red-300",
  info:    "bg-sky-500/20 border-sky-500/40 text-sky-300",
};

export function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border glass cursor-pointer ${colors[toast.type]}`}
      onClick={() => onRemove(toast.id)}
    >
      <span className="text-lg leading-none mt-0.5">{icons[toast.type]}</span>
      <p className="text-sm font-medium leading-snug">{toast.message}</p>
    </div>
  );
}
