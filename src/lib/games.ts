// src/lib/games.ts
import { getAccessToken } from "@/lib/auth"; // already exists in your project

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL; // e.g. "https://api.yourcasino.com"

export interface Game {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  providerCode: string;
  img: string;
  rank: number;
  status: "active" | "inactive";
  locale: Record<string, string>;
}

// GET /legacy-games
export async function fetchGames(productId?: string): Promise<Game[]> {
  const qs = productId ? `?productId=${productId}` : "";
  const res = await fetch(`${BASE}/legacy-games${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch games");
  const json = await res.json();
  return json.data.games as Game[];
}

interface JoinGameBody {
  username: string;
  productId: string;
  gameCode: string;
  isMobileLogin: boolean;
  limit: number;
  betLimit: number;
  currency: string;
  language: string;
}

interface JoinGameResponse {
  gameUrl: string;
  sessionToken: string;
  gameInfo: { name: string; provider: string };
}

// POST /legacy-games/join
export async function joinGame(body: JoinGameBody): Promise<JoinGameResponse> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/legacy-games/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Unable to create game session");
  const json = await res.json();
  return json.data as JoinGameResponse;
}
