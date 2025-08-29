// src/components/settings/shared/PrefRowSkeleton.tsx
"use client";

import { Card } from "../shared";

type Layout = "default" | "toggle" | "toggle+select";

export default function PrefRowSkeleton({ layout }: { layout: Layout }) {
  /* საერთო ტექსტური ბლოკი */
  const Text = (
    <div className="space-y-1">
      <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
      <div className="h-3 w-64 rounded bg-white/10 animate-pulse" />
    </div>
  );

  if (layout === "toggle") {
    return (
      <Card className="flex items-center gap-4">
        {/* fake toggle */}
        <div className="w-11 h-6 rounded-full bg-white/10 animate-pulse" />
        {Text}
      </Card>
    );
  }

  if (layout === "toggle+select") {
    return (
      <Card className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-6 rounded-full bg-white/10 animate-pulse" />
          {Text}
        </div>
        {/* fake select */}
        <div className="h-10 w-[128px] rounded-lg bg-white/10 animate-pulse" />
      </Card>
    );
  }

  // default = right-side control
  return (
    <Card className="flex items-center justify-between gap-4">
      {Text}
      <div className="h-10 w-[128px] rounded-lg bg-white/10 animate-pulse" />
    </Card>
  );
}
