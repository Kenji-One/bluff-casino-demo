// src/components/ListHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ListHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="mb-6 flex items-center gap-4">
      <button
        onClick={() => router.back()}
        className="p-2 rounded-full bg-[var(--sidenav-background)] hover:bg-white/5 cursor-pointer"
        aria-label="Go back"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="stroke-white stroke-1"
        >
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  );
}
