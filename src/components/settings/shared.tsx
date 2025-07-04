"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
/** Shared UI helpers for Settings tabs  */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--button-background-primary-default)] rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8">
      <h2 className="text-xl text-white font-bold leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-sm text-[var(--secondary-text)] max-w-md mt-[7px]">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[var(--secondary-text)] text-sm leading-none mb-1">
        {label}
      </p>
      <p className="text-white">{value}</p>
    </div>
  );
}

export function ButtonSecondary({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 text-sm rounded-full bg-[var(--button-background-primary-default)] hover:bg-[#2A2A30] transition-colors ${className} cursor-pointer`}
    >
      {children}
    </button>
  );
}

/** Toggle switch */
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
        checked ? "bg-[var(--color-brand)]" : "bg-[var(--tab-btn-bg)]"
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full bg-white absolute top-0.5 translate-y-0.5 transition-transform ${
          checked ? "translate-x-5" : "translate-x-[4px]"
        }`}
      />
    </button>
  );
}

export function Select({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative inline-block">
      {/* native control */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // 4 px left + 10 px right padding (40-4-10 = 26 => 16 px
        // space between text and the custom arrow)
        className={`appearance-none bg-[#2A2A30] text-sm rounded-full pl-4 pr-10 py-[6px] focus:outline-none ${className}`}
      >
        {children}
      </select>

      {/* custom arrow positioned 16 px from the right border */}
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
      />
    </div>
  );
}

export function CurrencyIcon({ symbol }: { symbol: string }) {
  return (
    <div className="w-5 h-5 rounded-full bg-[#6CDE07] text-xs text-white flex items-center justify-center">
      {symbol}
    </div>
  );
}
