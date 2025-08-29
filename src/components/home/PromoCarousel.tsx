"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export type PromoItem = {
  src: string;
  alt: string;
  onClick?: () => void;
};

type Props = {
  items: PromoItem[];
  className?: string;
  /** min height in px (defaults to 200 = 12.5rem) */
  minHeight?: number;
  /** aspect ratio as [w, h] (defaults to 16/9) */
  aspect?: [number, number];
  /** gap between slides in px (defaults to 16) */
  gapPx?: number;
  /** MAX width per card (defaults to 369px) */
  maxCardWidth?: number;
};

export default function PromoCarousel({
  items,
  className,
  minHeight = 200,
  aspect = [16, 9],
  gapPx = 16,
  maxCardWidth = 369, // hard cap as requested
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // min width derived from minHeight * aspect (≈356 for 200 @ 16:9)
  const MIN_CARD_W = Math.ceil(minHeight * (aspect[0] / aspect[1]));

  const [{ cardW, vpW }, setLayout] = useState(() => ({
    cardW: MIN_CARD_W,
    vpW: 0,
  }));

  // Measure container and decide layout:
  // - If we can fit 3 × maxCardWidth + gaps → 3-up grid.
  // - Else → carousel with cardW clamped to maxCardWidth (~88% viewport peeking).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth;

      const threeMax = maxCardWidth * 3 + gapPx * 2;
      if (w >= threeMax) {
        setLayout({
          cardW: Math.min((w - gapPx * 2) / 3, maxCardWidth),
          vpW: w,
        });
      } else {
        const cw = Math.min(
          maxCardWidth,
          Math.max(w * 0.88, Math.min(w, MIN_CARD_W))
        );
        setLayout({ cardW: cw, vpW: w });
      }
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gapPx, maxCardWidth, MIN_CARD_W, aspect[0], aspect[1], minHeight]);

  /* ────────────────────── CAROUSEL STATE (CLAMPED PIXELS) ────────────────────── */
  const [offset, setOffset] = useState(0); // pixel offset (not index)
  const [anim, setAnim] = useState(false);

  const STEP = cardW + gapPx;
  const trackW = items.length * cardW + Math.max(items.length - 1, 0) * gapPx;
  const maxOffsetPx = Math.max(trackW - vpW, 0);

  const canNext = offset < maxOffsetPx - 0.5;
  const canPrev = offset > 0.5;

  const next = () => {
    if (!canNext || anim) return;
    setAnim(true);
    setOffset((o) => Math.min(o + STEP, maxOffsetPx));
  };

  const prev = () => {
    if (!canPrev || anim) return;
    setAnim(true);
    setOffset((o) => Math.max(o - STEP, 0));
  };

  // Keep offset valid if layout changes
  useEffect(() => {
    setOffset((o) => Math.min(o, maxOffsetPx));
  }, [maxOffsetPx]);

  const onEnd = () => setAnim(false);

  // Touch swipe
  const startX = useRef(0);
  const deltaX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    const THRESH = 40;
    if (Math.abs(deltaX.current) > THRESH) {
      deltaX.current < 0 ? next() : prev();
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx("relative w-full overflow-hidden rounded-xl", className)}
      aria-roledescription="carousel"
    >
      {/* track */}
      <div
        className="flex"
        style={{
          columnGap: gapPx,
          transform: `translateX(-${offset}px)`, // ← clamped pixel offset
          transition: anim ? "transform 300ms ease" : "none",
          touchAction: "pan-y",
        }}
        onTransitionEnd={onEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={it.onClick}
            className="relative flex-none rounded-xl overflow-hidden bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            style={{
              width: cardW, // capped by maxCardWidth
              minHeight, // 200px
              aspectRatio: `${aspect[0]} / ${aspect[1]}`, // 16/9
            }}
            aria-label={it.alt}
          >
            <Image
              src={it.src}
              alt={it.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(min-width: 1200px) 33vw, (min-width: 768px) 45vw, 85vw"
            />
          </button>
        ))}
      </div>

      {/* controls (only if we actually overflow) */}
      {(canPrev || canNext) && (
        <>
          {canPrev && (
            <button
              aria-label="Previous"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-[var(--sidenav-background)] hover:bg-white/5"
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
          )}
          {canNext && (
            <button
              aria-label="Next"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-[var(--sidenav-background)] hover:bg-white/5"
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
          )}

          {/* edge fades */}
          {canPrev && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/90 to-transparent rounded-l-xl" />
          )}
          {canNext && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/90 to-transparent rounded-r-xl" />
          )}
        </>
      )}
    </div>
  );
}
