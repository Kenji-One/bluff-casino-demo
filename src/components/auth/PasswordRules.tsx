"use client";

import { Check, X } from "lucide-react";

type Rule = { ok: boolean; label: string };

export default function PasswordRules({ value }: { value: string }) {
  const rules: Rule[] = [
    { ok: value.length >= 8 && value.length <= 24, label: "8-24 characters" },
    { ok: /[A-Za-z]/.test(value), label: "1 uppercase letter" },
    { ok: /[0-9]/.test(value), label: "1 number" },
  ];

  return (
    <div
      className={`
        mt-2 w-full text-sm text-white
        lg:absolute lg:left-0 lg:-translate-x-[calc(100%+12px)] lg:top-0 lg:z-50 lg:w-56 
        lg:rounded-xl lg:bg-white lg:p-4 lg:shadow-xl lg:text-black lg:mt-0
      `}
    >
      {/* only show header + arrow in tooltip mode (lg and up) */}
      <h3 className="hidden lg:block mb-3 text-base font-semibold">
        Password must have
      </h3>

      <ul className="space-y-2">
        {rules.map(({ ok, label }) => (
          <li key={label} className="flex items-center gap-2">
            {ok ? (
              <Check size={16} className="text-green-600 shrink-0" />
            ) : (
              <X size={16} className="text-red-600 shrink-0" />
            )}
            <span className={ok ? "text-green-500" : "text-red-500"}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      <div className="hidden lg:block absolute right-[-6px] top-8 h-4 w-4 rotate-45 bg-white shadow-xl" />
    </div>
  );
}
