import { getAccessToken } from "@/lib/auth";

/* ---------- Types ---------- */
export interface FTGameInfo {
  name: string;
  gameCode: string;
  provider: string;
  minBet: number;
  maxBet: number;
  currency: string;
}

export interface FTSessionResponse {
  session: { gameUrl: string; sessionId: string };
  game: { name: string };
  player: { balance: number };
}

/* ---------- Calls ---------- */
const BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/games/fortune-tiger`;

export async function fetchFTInfo(): Promise<FTGameInfo> {
  const r = await fetch(`${BASE}/info`, { cache: "no-store" });
  const j = await r.json();
  if (!j.success) throw new Error(j.message);
  return j.data.game;
}

export async function enterFT(username: string): Promise<FTSessionResponse> {
  const token = getAccessToken();
  const r = await fetch(`${BASE}/enter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      username,
      sessionToken: token,
      isMobileLogin: window.innerWidth < 640,
      language: "en",
    }),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.message);
  return j.data as FTSessionResponse;
}
