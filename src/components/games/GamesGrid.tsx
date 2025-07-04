"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { apiClient, Game, ProductsResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import GameCard from "./GameCard";
import GameFilters from "./GameFilters";

const GAMES_PER_PAGE = 50;

export default function GameGrid() {
  const router = useRouter();
  const { user } = useAuth();

  const [providers, setProviders] = useState<string[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    provider: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get<ProductsResponse>("/games/products");
        if (res.success) {
          const list = res.data.products;
          setProviders(list);
          if (!filters.provider && list.length) {
            setFilters((f) => ({ ...f, provider: list[0] }));
          }
        } else {
          setError(res.message || "Failed to load providers");
        }
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || "Failed to load providers");
      }
    })();
  }, []);
  useEffect(() => {
    if (!filters.provider) return;
    fetchGames(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.provider]);

  const fetchGames = async (p = 1, replace = false) => {
    try {
      setLoading(true);
      setError("");

      const res = await apiClient.get(
        `/seamless/games?productId=${filters.provider}&page=${p}&size=${GAMES_PER_PAGE}`
      );

      const list = Array.isArray(res?.data?.games)
        ? res.data.games
        : Array.isArray(res?.games)
        ? res.games
        : [];

      const normalized: Game[] = list.map((g: Game) => ({
        ...g,
        imageUrl: g.imageUrl ?? g.img ?? "",
      }));

      setGames((prev) => (replace ? normalized : [...prev, ...normalized]));
      setHasMore(normalized.length === GAMES_PER_PAGE);
      setPage(p);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.name?.toLowerCase().includes(q));
  }, [games, filters.search]);

  const handlePlay = async (g: Game) => {
    if (!user) {
      alert("Please log in to play games.");
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post(`/games/${filters.provider}/launch`, {
        gameCode: g.code,
        currency: "THB",
        language: "en",
        isMobileLogin: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
      });

      const gameUrl = res?.data?.gameUrl || res?.data?.url;
      if (res.success && gameUrl) {
        router.push(
          `/play/${filters.provider}/${g.code}?url=${encodeURIComponent(
            gameUrl
          )}&name=${encodeURIComponent(g.name)}`
        );
      } else {
        alert(res.message || "Failed to launch game");
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert(err.message || "Failed to launch game");
    } finally {
      setLoading(false);
    }
  };

  if (loading && games.length === 0)
    return (
      <div className="flex h-64 items-center justify-center">
        <span>Loading…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div>
      <GameFilters
        filters={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        providers={providers}
      />

      <div
        className={clsx(
          "grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
          filters.provider !== "JOKER" && "gap-[14px]"
        )}
      >
        {filteredGames.map((g) => (
          <GameCard key={g.id || g.code} game={g} onPlay={handlePlay} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchGames(page + 1)}
            className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading…" : "Load More Games"}
          </button>
        </div>
      )}
    </div>
  );
}
