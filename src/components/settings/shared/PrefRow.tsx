"use client";

import React from "react";
import { Card } from "../shared";

type PrefRowProps = {
  label: string;
  sub?: string;
  children: React.ReactNode;
  layout?: "default" | "toggle" | "toggle+select";
};

export default function PrefRow({
  label,
  sub,
  children,
  layout = "default",
}: PrefRowProps) {
  if (layout === "toggle") {
    return (
      <Card className="flex items-center gap-4 flex-wrap">
        {children}
        <div>
          <p className="font-medium leading-none">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
        </div>
      </Card>
    );
  }

  if (layout === "toggle+select") {
    const [toggleEl, selectEl] = React.Children.toArray(children);
    return (
      <Card className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {toggleEl}
          <div className="flex-1">
            <p className="font-medium leading-none">{label}</p>
            {sub && <p className="text-xs text-gray-400 mt-2 ">{sub}</p>}
          </div>
        </div>
        {selectEl}
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="font-medium leading-none">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-2 ">{sub}</p>}
      </div>
      {children}
    </Card>
  );
}
