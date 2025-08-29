"use client";

import { useUI } from "@/context/UIContext";

export default function GlobalLoader() {
  const { isBusy } = useUI();
  if (!isBusy) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        <p className="text-sm text-white/80">Loading…</p>
      </div>
    </div>
  );
}
