// src/components/games/GameCarouselSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import CarouselCard from "./CarouselCard";
import { Game } from "@/services/api";

interface Props {
  title: string;
  icon: React.ReactNode;
  games: Game[];
  onPlay?: (g: Game) => void;
  viewAllHref?: string;
}

/* ─────────────── configuration ─────────────── */
const GAP_PX = 14; // 14-px gap everywhere
const H_RATIO = 200.535 / 150; // keep original aspect
const CARD_SIZES = [150, 130, 110] as const;
const MAX_VISIBLE = 6; // never render more than 6 slots
const SIDE_MARGIN = 64; // safety padding for layout calc

/* pick best (cardW, visible) so row fits incl. View-All card */
function calcLayout(winW: number, withViewAll: boolean) {
  for (const cw of CARD_SIZES) {
    // usable width after margins and the View-All card (if any)
    const safe = winW - SIDE_MARGIN - (withViewAll ? cw + GAP_PX : 0);
    const vis = Math.floor((safe + GAP_PX) / (cw + GAP_PX));
    if (vis >= 2) {
      return { cardW: cw, visible: Math.min(vis, MAX_VISIBLE) };
    }
  }
  // ultra-narrow fallback
  const cw = CARD_SIZES.at(-1)!;
  return { cardW: cw, visible: 1 };
}

/* timings */
const TRANSITION_MS = 300;
const AUTOPLAY_MS = 4000;

export default function GameCarouselSection({
  title,
  icon,
  games,
  onPlay,
  viewAllHref,
}: Props) {
  /* responsive layout */
  const withViewAll = !!viewAllHref;
  const [{ cardW, visible }, setLayout] = useState(() =>
    typeof window === "undefined"
      ? { cardW: 150, visible: MAX_VISIBLE } // SSR
      : calcLayout(window.innerWidth, withViewAll)
  );

  const cardH = Math.round(cardW * H_RATIO);
  const STEP = cardW + GAP_PX;
  const viewportW = visible * cardW + (visible - 1) * GAP_PX;

  /* update on resize */
  useEffect(() => {
    const onResize = () =>
      setLayout(calcLayout(window.innerWidth, withViewAll));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [withViewAll]);

  /* carousel state */
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [paused, setPause] = useState(false);

  /* clamp idx when layout changes */
  useEffect(() => {
    const max = Math.max(games.length - visible, 0);
    setIdx((i) => (i > max ? max : i));
  }, [visible, games.length]);

  const maxIdx = Math.max(games.length - visible, 0);
  const canLeft = idx < maxIdx;
  const canRight = idx > 0;

  const shiftLeft = () =>
    canLeft && !anim && (setAnim(true), setIdx((i) => i + 1));
  const shiftRight = () =>
    canRight && !anim && (setAnim(true), setIdx((i) => i - 1));
  const onEnd = () => setAnim(false);

  /* autoplay */
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused || !canLeft) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return; // returns undefined, which React accepts
    }
    timer.current = setInterval(shiftLeft, AUTOPLAY_MS);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [idx, paused, canLeft, shiftLeft]);

  /* ─────────────── render ─────────────── */
  return (
    <section className="mb-6">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1 text-lg font-extrabold text-white tracking-[-0.36px]">
          {icon}
          {title}
        </h3>

        {/* desktop arrows */}
        <div className="hidden md:flex gap-2">
          {/* ← */}
          <button
            onClick={shiftRight}
            disabled={!canRight}
            className={clsx(
              "rounded-full p-3 bg-[var(--sidenav-background)] hover:bg-white/5",
              !canRight &&
                "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 12H4L10 6M4 12L10 18"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* → */}
          <button
            onClick={shiftLeft}
            disabled={!canLeft}
            className={clsx(
              "rounded-full p-3 bg-[var(--sidenav-background)] hover:bg-white/5",
              !canLeft &&
                "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12H20L14 18M20 12L14 6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* row */}
      <div className="flex flex-nowrap items-start gap-[14px]">
        {/* viewport */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ width: viewportW }}
          onMouseEnter={() => setPause(true)}
          onMouseLeave={() => setPause(false)}
        >
          <div
            onTransitionEnd={onEnd}
            className="flex"
            style={{
              columnGap: GAP_PX,
              transform: `translateX(-${idx * STEP}px)`,
              transition: anim ? `transform ${TRANSITION_MS}ms ease` : "none",
            }}
          >
            {games.map((g, i) => (
              <div
                key={g.id ?? `${g.providerId}-${g.code}` ?? i}
                style={{ width: cardW, height: cardH }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => onPlay?.(g)}
              >
                <CarouselCard game={g} />
              </div>
            ))}
          </div>

          {/* mobile arrows */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-2 md:hidden">
            <button
              onClick={shiftRight}
              disabled={!canRight}
              className={clsx(
                "pointer-events-auto rounded-full p-3 bg-[var(--sidenav-background)] hover:bg-white/5",
                !canRight &&
                  "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 12H4L10 6M4 12L10 18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={shiftLeft}
              disabled={!canLeft}
              className={clsx(
                "pointer-events-auto rounded-full p-3 bg-[var(--sidenav-background)] hover:bg-white/5",
                !canLeft &&
                  "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12H20L14 18M20 12L14 6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* View-All */}
        {withViewAll && (
          <div
            style={{ width: cardW, height: cardH }}
            className="flex-shrink-0 bg-[url('/images/view-all-bg.svg')] bg-cover bg-center"
          >
            <a
              href={viewAllHref!}
              className="flex h-full w-full items-center justify-center rounded-xl text-lg font-semibold text-white hover:bg-white/5"
            >
              View All
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
