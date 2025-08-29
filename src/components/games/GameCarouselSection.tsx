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

const GAP_PX = 14;
const H_RATIO = 200.535 / 150;
const CARD_SIZES = [150, 130, 110] as const;

function calcLayout(containerW: number) {
  for (const cw of CARD_SIZES) {
    const vis = Math.floor((containerW + GAP_PX) / (cw + GAP_PX));
    if (vis >= 2) return { cardW: cw, visible: vis, vpW: containerW };
  }
  const cw = CARD_SIZES.at(-1)!;
  return { cardW: cw, visible: 1, vpW: containerW };
}

const TRANSITION_MS = 300;
// const AUTOPLAY_MS = 4000; // ← disabled for now

export default function GameCarouselSection({
  title,
  icon,
  games,
  onPlay,
  viewAllHref,
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const [{ cardW, visible, vpW }, setLayout] = useState(() => ({
    cardW: 150,
    visible: 6,
    vpW: 0,
  }));

  const cardH = Math.round(cardW * H_RATIO);
  const STEP = cardW + GAP_PX;

  // observe container width so viewport always equals container (allows partial cards)
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setLayout(calcLayout(w));
    };
    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* carousel state */
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [paused, setPause] = useState(false);

  // derive max index from track width and viewport width (allows partial end)
  const trackW = games.length * cardW + Math.max(games.length - 1, 0) * GAP_PX;
  const maxOffsetPx = Math.max(trackW - vpW, 0);
  const maxIdx = Math.ceil(maxOffsetPx / STEP);
  const canLeft = idx < maxIdx; // move right visually
  const canRight = idx > 0; // move left visually

  // adjust index if layout changes
  useEffect(() => {
    setIdx((i) => (i > maxIdx ? maxIdx : i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIdx, cardW, vpW, games.length]);

  const shiftLeft = () =>
    canLeft && !anim && (setAnim(true), setIdx((i) => i + 1));
  const shiftRight = () =>
    canRight && !anim && (setAnim(true), setIdx((i) => i - 1));
  const onEnd = () => setAnim(false);

  // ── autoplay disabled ─────────────────────────────────────
  /*
  useEffect(() => {
    if (paused || !canLeft) return;
    const t = setInterval(shiftLeft, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, canLeft]);
  */

  return (
    <section className="mb-6">
      {/* header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1 text-lg font-extrabold text-white tracking-[-0.36px]">
          {icon}
          {title}
        </h3>

        {/* right controls: View all + arrows */}
        <div className="hidden md:flex items-strech gap-2">
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="group relative flex items-center rounded-full px-4 py-2 
             bg-[var(--sidenav-background)] text-sm font-semibold text-white 
             overflow-hidden"
            >
              <span className="relative z-10">View all</span>
              <span
                className="absolute inset-0 z-0 bg-[url('/images/view-all-bg.svg')] bg-cover bg-center 
               opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </a>
          )}

          <button
            onClick={shiftRight}
            disabled={!canRight}
            className={clsx(
              "rounded-full p-2 bg-[var(--sidenav-background)] hover:bg-white/5 transition-colors duration-200 cursor-pointer",
              !canRight &&
                "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
            )}
            aria-label="Previous"
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
              "rounded-full p-2 bg-[var(--sidenav-background)] hover:bg-white/5 transition-colors duration-200 cursor-pointer",
              !canLeft &&
                "opacity-30 cursor-default hover:bg-[var(--sidenav-background)]"
            )}
            aria-label="Next"
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

      {/* row (measured + clipped to container width) */}
      <div ref={rowRef} className="relative w-full min-w-0">
        {/* viewport = full container width */}
        <div
          className="relative overflow-hidden"
          style={{ width: "100%" }}
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
            {games.map((g, i) => {
              // Safe, deterministic key (fixes TS2881 warning)
              const key =
                g.id ??
                (g.providerId && g.code
                  ? `${g.providerId}-${g.code}`
                  : `i-${i}`);
              return (
                <div
                  key={key}
                  style={{ width: cardW, height: cardH }}
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => onPlay?.(g)}
                >
                  <CarouselCard game={g} />
                </div>
              );
            })}
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
              aria-label="Previous"
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
              aria-label="Next"
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

          {/* edge fades (darker) */}
          {canRight && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/90 to-transparent" />
          )}
          {canLeft && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/90 to-transparent" />
          )}
        </div>
      </div>
    </section>
  );
}
