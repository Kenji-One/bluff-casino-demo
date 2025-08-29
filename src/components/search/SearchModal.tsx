// src/components/search/SearchModal.tsx
"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { apiClient, Game } from "@/services/api";

type Props = { open: boolean; onClose: () => void };

type Provider =
  | "ALL"
  | "PGSOFT"
  | "JOKER"
  | "SLOTXO"
  | "SEXY"
  | "SIMPLEPLAY"
  | "AGGAME";

const PROVIDERS: Provider[] = [
  "ALL",
  "PGSOFT",
  "JOKER",
  "SLOTXO",
  "SEXY",
  "SIMPLEPLAY",
  "AGGAME",
];

const FALLBACK_IMG = "/images/placeholder-game.png";
const PAGE_SIZE = 30;

type GameCard = Game & { imageUrl: string };

/** Normalise API responses from:
 *  - /games/all            -> { data: Game[], meta: { pagination: { hasMore } } }
 *  - /games?productId=XXX  -> { games: Game[] }  (or axios wrapper .data.games)
 */
function normaliseResponse(res: unknown): { list: Game[]; hasMore: boolean } {
  const payload: any = (res as any)?.data ?? res;

  let list: Game[] = [];
  if (Array.isArray(payload?.data)) list = payload.data as Game[];
  else if (Array.isArray(payload?.games)) list = payload.games as Game[];
  else if (Array.isArray(payload)) list = payload as Game[];

  const hasMore =
    Boolean(payload?.meta?.pagination?.hasMore) ||
    (Array.isArray(list) && list.length >= PAGE_SIZE);

  return { list, hasMore };
}

export default function SearchModal({ open, onClose }: Props) {
  const [provider, setProvider] = useState<Provider>("ALL");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allGames, setAllGames] = useState<GameCard[]>([]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // --- Chips scroller UI helpers (arrows + fades) ---
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateChipEdges = () => {
    const el = chipsRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setAtStart(start);
    setAtEnd(end);
  };
  const scrollChips = (dir: -1 | 1) => {
    const el = chipsRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    updateChipEdges();
    const onScroll = () => updateChipEdges();
    const onResize = () => updateChipEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Reset when the modal opens OR provider changes
  useEffect(() => {
    if (!open) return;
    controllerRef.current?.abort();
    setOffset(0);
    setHasMore(true);
    setAllGames([]);
    setLoading(false);
  }, [open, provider]);

  // Build URL per page
  const buildUrl = (prov: Provider, off: number) =>
    prov === "ALL"
      ? `/games/all?limit=${PAGE_SIZE}&offset=${off}`
      : `/games?productId=${encodeURIComponent(
          prov
        )}&limit=${PAGE_SIZE}&offset=${off}`;

  // Fetch a page
  useEffect(() => {
    if (!open || !hasMore || loading) return;

    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(buildUrl(provider, offset), {
          signal: ctrl.signal,
        } as any);
        const { list, hasMore: apiHasMore } = normaliseResponse(res);

        const page: GameCard[] = (list || []).map((g: any) => ({
          ...g,
          imageUrl: g?.imageUrl ?? g?.img ?? FALLBACK_IMG,
        }));

        if (ctrl.signal.aborted) return;
        setAllGames((prev) => (offset === 0 ? page : prev.concat(page)));
        setHasMore(Boolean(apiHasMore));
      } catch {
        if (ctrl.signal.aborted) return;
        setHasMore(false);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      ctrl.abort();
      setLoading(false);
    };
  }, [open, provider, offset, hasMore]);

  // Infinite scroll
  useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setOffset((o) => o + PAGE_SIZE);
        }
      },
      { root: null, rootMargin: "600px 0px 0px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [open, loading, hasMore]);

  // Client-side search only
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allGames;
    return allGames.filter((g) => g.name.toLowerCase().includes(q));
  }, [allGames, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center p-4">
      <div className="w-full max-w-6xl bg-[var(--sidenav-background)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-b-color)]">
          <input
            type="text"
            placeholder="Search games"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-black/40 text-white py-3 px-4 rounded-full outline-none"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10"
            aria-label="Close search"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Provider chips (scrollable with custom arrows & fades) */}
        <div className="relative">
          {/* gradient fades behind buttons */}
          {!atStart && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black/70 to-transparent" />
          )}
          {!atEnd && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black/70 to-transparent" />
          )}

          {/* LEFT brand arrow */}
          {!atStart && (
            <button
              onClick={() => scrollChips(-1)}
              aria-label="Scroll providers left"
              className="
              md:hidden
        group absolute -left-5 top-[45%] -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-gradient-to-br from-[var(--color-brand)] via-[var(--color-blue)] to-[var(--color-brand)]
        ring-1 ring-white/10 shadow-[0_6px_18px_rgba(66,100,255,0.45)]
        flex items-center justify-center
        hover:scale-[1.03] transition
      "
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="rotate-180 ml-3"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* RIGHT brand arrow */}
          {!atEnd && (
            <button
              onClick={() => scrollChips(1)}
              aria-label="Scroll providers right"
              className="
              md:hidden
        group absolute -right-5 top-[45%] -translate-y-1/2 z-20
        w-10 h-10 rounded-full
        bg-gradient-to-br from-[var(--color-brand)] via-[var(--color-blue)] to-[var(--color-brand)]
        ring-1 ring-white/10 shadow-[0_6px_18px_rgba(66,100,255,0.45)]
        flex items-center justify-center
        hover:scale-[1.03] transition
      "
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="mr-3"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          <div
            ref={chipsRef}
            className="
      scroll-chips
      flex gap-2 p-4 overflow-x-auto overflow-y-hidden text-sm
      [-webkit-overflow-scrolling:touch]
    "
          >
            {PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={clsx(
                  "px-4 py-2 rounded-full whitespace-nowrap transition",
                  provider === p
                    ? "bg-[var(--color-blue)] text-white"
                    : "bg-[var(--burger-btn-bg)] text-white hover:bg-[var(--burger-btn-bg-hover)]"
                )}
              >
                {p === "ALL" ? "All Providers" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 && !loading ? (
            <p className="text-center text-white py-16">No games found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {filtered.map((g, i) => (
                <GameTile key={`${g.code || g.id || i}`} game={g} />
              ))}
              {/* sentinel for infinite scroll */}
              <div ref={sentinelRef} className="col-span-full h-1" />
            </div>
          )}

          {loading && <SkeletonGrid />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiles & Skeletons ---------- */

function GameTile({ game }: { game: GameCard }) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(game.imageUrl || FALLBACK_IMG);

  return (
    <div className="rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition">
      <div className="relative w-full" style={{ aspectRatio: "3 / 4" }}>
        <div
          className={clsx(
            "absolute inset-0 bg-white/10 animate-pulse",
            loaded && "hidden"
          )}
        />
        <Image
          src={src}
          alt={game.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
          onLoadingComplete={() => setLoaded(true)}
          onError={() => {
            if (src !== FALLBACK_IMG) setSrc(FALLBACK_IMG);
            setLoaded(true);
          }}
        />
      </div>
      <div className="p-2 text-center text-white text-sm font-medium truncate">
        {game.name}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <div
            className="w-full bg-white/10 animate-pulse"
            style={{ aspectRatio: "3 / 4" }}
          />
          <div className="h-5 mt-2 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
