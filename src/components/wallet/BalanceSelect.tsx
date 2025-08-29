// src/components/wallet/BalanceSelect.tsx
"use client";

import { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import clsx from "clsx";

export type Token = {
  symbol: string; // e.g., "ETH"
  label?: string; // e.g., "Ethereum"
  icon?: ReactNode; // optional custom icon
};

type AnyAnchorRef =
  | React.MutableRefObject<HTMLDivElement | null>
  | React.RefObject<HTMLDivElement | null>;

type Props = {
  tokens: Token[];
  value: string; // selected symbol
  onChange: (symbol: string) => void;
  balances?: Record<string, number>; // token balances by symbol
  className?: string; // wrapper
  pillClassName?: string; // button
  /** element whose width the dropdown should match (wallet & deposit block) */
  anchorRef?: AnyAnchorRef;
};

/* ---------- tiny placeholder coin icon (swap with real SVGs later) ---------- */
function CoinIcon({ symbol }: { symbol: string }) {
  const palette: Record<string, string> = {
    BTC: "bg-[#F7931A]",
    ETH: "bg-[#627EEA]",
    USDT: "bg-[#26A17B]",
    USDC: "bg-[#2775CA]",
    SHFL: "bg-[#A855F7]",
    SOL: "bg-[#14F195]",
    LTC: "bg-[#345D9D]",
    XRP: "bg-[#23292F]",
    DEFAULT: "bg-white/20",
  };
  const cls = palette[symbol as keyof typeof palette] || palette.DEFAULT;
  return (
    <span
      className={clsx(
        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0",
        cls
      )}
      aria-hidden
    >
      {symbol.slice(0, 2)}
    </span>
  );
}

/* ---------- helpers ---------- */
const fmtToken = (n: number | undefined) =>
  (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  });

const fmtFiat = (n: number | undefined) =>
  (n ?? 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function BalanceSelect({
  tokens,
  value,
  onChange,
  balances = {},
  className,
  pillClassName,
  anchorRef,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showFiat, setShowFiat] = useState(false);

  /* persist fiat toggle (optional) */
  useEffect(() => {
    const saved = localStorage.getItem("wallet:display_fiat");
    if (saved) setShowFiat(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("wallet:display_fiat", showFiat ? "1" : "0");
  }, [showFiat]);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* outside click / esc close */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const current = useMemo(
    () => tokens.find((t) => t.symbol === value) ?? tokens[0],
    [tokens, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        (t.label ?? "").toLowerCase().includes(q)
    );
  }, [tokens, query]);

  /* ---- measure & position the dropdown to match the wallet block width ---- */
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    width: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
  });

  const computeCoords = () => {
    const anchorEl =
      (anchorRef?.current as HTMLDivElement | null) ??
      rootRef.current?.parentElement ??
      rootRef.current;

    if (!anchorEl) return;

    const r = anchorEl.getBoundingClientRect();
    const margin = 8; // gap under the pill (like mt-2)
    const maxWidth = Math.max(0, window.innerWidth - 16); // keep 8px margins
    const width = Math.min(r.width, maxWidth);

    let left = r.left;
    if (left + width > window.innerWidth - 8) {
      left = window.innerWidth - 8 - width;
    }
    if (left < 8) left = 8;

    setCoords({
      left,
      top: r.bottom + margin,
      width,
    });
  };

  useEffect(() => {
    if (!open) return;
    computeCoords();
    const onWin = () => computeCoords();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={clsx("relative", className)} ref={rootRef}>
      {/* pill button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "h-full flex items-center gap-2 rounded-[14px] bg-[var(--surface-l3)] pl-2 sm:pl-3 pr-2 sm:pr-4 py-[6px]",
          "shadow-sm hover:bg-white/[0.06] transition",
          pillClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {current.icon ?? <CoinIcon symbol={current.symbol} />}
          <span className="text-[13px] sm:text-sm font-semibold tabular-nums">
            {fmtToken(balances[current.symbol])}
          </span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={clsx(
            "transition",
            open ? "rotate-180 opacity-100" : "opacity-80"
          )}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* dropdown (fixed, anchored to wallet block, width = wallet block) */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "fixed",
            left: `${coords.left}px`,
            top: `${coords.top}px`,
            width: `${coords.width}px`,
          }}
          className={clsx(
            "z-50 rounded-2xl border border-[var(--border-b-color)] bg-[var(--profile-img-modal-bg)]"
          )}
        >
          {/* search */}
          <div className="p-3">
            <div className="rounded-xl bg-[var(--burger-btn-bg)] px-3 py-2.5 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
                className="shrink-0 opacity-80"
              >
                <path
                  d="M12.9866 12.69L15.2966 15M14.5669 8.625C14.5669 10.1168 13.9743 11.5476 12.9194 12.6025C11.8645 13.6574 10.4337 14.25 8.94189 14.25C7.45005 14.25 6.01931 13.6574 4.96442 12.6025C3.90953 11.5476 3.31689 10.1168 3.31689 8.625C3.31689 7.13316 3.90953 5.70242 4.96442 4.64752C6.01931 3.59263 7.45005 3 8.94189 3C10.4337 3 11.8645 3.59263 12.9194 4.64752C13.9743 5.70242 14.5669 7.13316 14.5669 8.625Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/50 outline-none"
              />
            </div>
          </div>

          {/* list */}
          <ul className="max-h-80 overflow-y-auto px-2 pb-2 custom-scrollbar">
            {filtered.map((t) => {
              const isActive = t.symbol === value;
              const right = showFiat
                ? fmtFiat(balances[t.symbol])
                : fmtToken(balances[t.symbol]);
              return (
                <li key={t.symbol}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(t.symbol);
                      setOpen(false);
                    }}
                    className={clsx(
                      "w-full rounded-lg p-2 sm:px-4 sm:py-3 flex items-center justify-between",
                      isActive ? "bg-white/8" : "hover:bg-white/5"
                    )}
                  >
                    <span className="flex items-center gap-2 sm:gap-3">
                      {t.icon ?? <CoinIcon symbol={t.symbol} />}
                      <span className="text-xs sm:text-sm font-medium">
                        {t.symbol}
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm tabular-nums text-white/80">
                      {right}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* footer row */}
          <div className="flex items-center justify-between border-t border-[var(--border-b-color)] px-4 py-3">
            <span className="text-xs sm:text-sm text-white/80">
              Display in Fiat
            </span>
            <button
              type="button"
              onClick={() => setShowFiat((v) => !v)}
              aria-pressed={showFiat}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                showFiat ? "bg-[var(--color-blue)]" : "bg-white/15"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition",
                  showFiat ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
