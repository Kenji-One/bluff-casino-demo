/* ------------------------------------------------------------------
 *  Ultra-light dropdown <CustomSelect>
 *  • Optional ‟icon-only”, ‟arrow-only”, or normal display.
 *  • Outside-click to close.
 * -----------------------------------------------------------------*/
"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/* ---------- option shape ---------- */
export type SelectOption<T = string> = {
  value: T; // internal value
  label?: string; // visible label – falls back to `value`
  icon?: React.ReactNode;
};

/* ---------- props ---------- */
type Props<T> = {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];

  /* extra classes */
  className?: string; // trigger button
  boxClassName?: string; // outer wrapper

  /* trigger-only hiding options */
  hideSelectedLabel?: boolean;
  hideSelectedIcon?: boolean;
};

export default function CustomSelect<T>({
  value,
  onChange,
  options,
  className = "",
  boxClassName = "",
  hideSelectedLabel = false,
  hideSelectedIcon = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* selected option ------------------------------------------------ */
  const selected = options.find((o) => o.value === value);

  /* close on outside-click ---------------------------------------- */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ---------- render ---------- */
  return (
    <div
      ref={ref}
      className={clsx(
        "relative inline-block",
        boxClassName || "min-w-[44px]" /* enough for arrow */
      )}
    >
      {/* trigger ---------------------------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "flex w-full items-center gap-2 rounded-full bg-[var(--tab-btn-bg)]",
          "pl-3 pr-9 py-[6px] text-sm focus:outline-none",
          className
        )}
      >
        {!hideSelectedIcon && selected?.icon}
        {!hideSelectedLabel && (
          <span>{selected?.label ?? String(selected?.value ?? "")}</span>
        )}

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {/* caret */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M15.8333 7.5L10 13.3333L4.16667 7.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* dropdown --------------------------------------------------- */}
      {open && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border border-[#2C2C31] bg-[var(--tab-btn-bg)] text-sm shadow-lg">
          {options.map((opt) => (
            <li
              key={`${opt.value}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={clsx(
                "flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-[#2A2A30]",
                opt.value === value && "bg-[#2A2A30]"
              )}
            >
              {opt.icon}
              {/* always show label inside dropdown */}
              <span>{opt.label ?? String(opt.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
