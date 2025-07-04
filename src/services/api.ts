/* ------------------------------------------------------------------
 *  TwinaceApi – merged version
 *  – Keeps your original login / register handlers
 *  – Adds: deposit / withdraw, transactions, advanced launch fallback,
 *          username helper, generic HTTP helpers, etc.
 * ----------------------------------------------------------------- */

"use client";

import axios, { AxiosInstance } from "axios";

/* ---------- shared types ---------- */
export interface User {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  referralCode?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  provider?: string;
  providerCode: string;
  status: "ACTIVE" | "INACTIVE";
  img?: string;
  imageUrl?: string;
  description?: string;
  minBet?: number;
  maxBet?: number;
  rtp?: number;
  features?: string[];
  rank?: number;
  providerId?: string;
  providerName?: string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data: { balance: number; transactions?: Transaction[] };
}

export interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "BET" | "WIN";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

/* ---------- client ---------- */
class TwinaceApi {
  private c: AxiosInstance;

  constructor() {
    this.c = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      timeout: 10_000,
      headers: { "Content-Type": "application/json" },
    });

    /* attach access token */
    this.c.interceptors.request.use((cfg) => {
      const t =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (t) cfg.headers.Authorization = `Bearer ${t}`;
      return cfg;
    });

    /* refresh token on 401 */
    this.c.interceptors.response.use(
      (r) => r,
      async (err) => {
        const orig = err.config;
        if (err.response?.status === 401 && !orig._retry) {
          orig._retry = true;
          const rt = localStorage.getItem("refreshToken");
          if (rt) {
            const { data } = await this.c.post("/auth/refresh", {
              refreshToken: rt,
            });
            this.writeTokens(data.data);
            return this.c(orig);
          }
        }
        return Promise.reject(err);
      }
    );
  }

  /* ---------- generic http helpers (type-safe, no 'any') ---------- */
  async get<T = unknown>(url: string): Promise<T> {
    const { data } = await this.c.get<T>(url);
    return data;
  }

  async post<T = unknown, B = unknown>(url: string, body?: B): Promise<T> {
    const { data } = await this.c.post<T>(url, body);
    return data;
  }

  async put<T = unknown, B = unknown>(url: string, body?: B): Promise<T> {
    const { data } = await this.c.put<T>(url, body);
    return data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const { data } = await this.c.delete<T>(url);
    return data;
  }

  /* ---------- auth (unchanged from your version) ---------- */
  async login(usernameOrEmail: string, password: string) {
    const { data } = await this.c.post("/auth/login", {
      usernameOrEmail,
      password,
    });
    this.writeTokens(data.data);
    return data.data.user as User;
  }
  async register(
    username: string,
    email: string,
    password: string,
    agreedToTerms: boolean,
    referralCode?: string
  ) {
    const payload: Record<string, unknown> = {
      username,
      email,
      password,
      agreedToTerms,
    };
    if (referralCode?.trim()) payload.referralCode = referralCode.trim();

    const { data } = await this.c.post("/auth/register", payload);
    this.writeTokens(data.data);
    return data.data.user as User;
  }
  logout() {
    localStorage.clear();
  }

  /* ---------- profile / wallet ---------- */
  async myProfile() {
    const { data } = await this.c.get("/users/profile");
    return data.data as User;
  }
  async balance() {
    const profile = await this.myProfile();
    return { balance: profile.balance };
  }

  async deposit(amount: number): Promise<WalletResponse> {
    const { data } = await this.c.post("/wallet/deposit", { amount });
    return data;
  }

  async getBalance() {
    /* components call apiClient.getBalance() */
    return this.balance();
  }

  async getTransactions(limit = 50, offset = 0) {
    /* components call apiClient.getTransactions() */
    return this.transactions(limit, offset);
  }

  async withdraw(amount: number): Promise<WalletResponse> {
    const { data } = await this.c.post("/wallet/withdraw", { amount });
    return data;
  }

  async transactions(limit = 50, offset = 0): Promise<WalletResponse> {
    const { data } = await this.c.get(
      `/wallet/transactions?limit=${limit}&offset=${offset}`
    );
    return data;
  }

  /* ---------- games ---------- */
  async listGames(filters?: {
    type?: string;
    category?: string;
    providerId?: string; // ← renamed; old “provider” no longer used
    search?: string;
    limit?: number;
  }) {
    const productId = filters?.providerId ?? "JOKER";

    /* 1️⃣  call the endpoint */
    const { data } = await this.c.get(`/seamless/games?productId=${productId}`);

    /* 2️⃣  normalise the many response shapes we’ve seen */
    let games: Game[] = [];
    if (Array.isArray(data?.data)) games = data.data;
    else if (Array.isArray(data?.data?.games)) games = data.data.games;
    else if (Array.isArray(data?.games)) games = data.games;
    else games = []; // fallback

    /* 3️⃣  optional filters */
    if (filters?.type) games = games.filter((g) => g.type === filters.type);
    if (filters?.category)
      games = games.filter((g) => g.category === filters.category);
    if (filters?.search)
      games = games.filter((g) =>
        g.name.toLowerCase().includes(filters.search!.toLowerCase())
      );

    /* 4️⃣  cap for carousels */
    if (filters?.limit) games = games.slice(0, filters.limit);

    /* 5️⃣  quick debug (DEV only) */
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[listGames] providerId=${productId} → ${games.length} games`
      );
    }

    return games;
  }

  /** header data for the single-slot page */
  async getGameMeta(gameCode: string, providerId: string) {
    const games = await this.listGames({ providerId });
    return games.find((g) => g.code === gameCode) ?? null;
  }

  async launchGame(gameCode: string, providerId: string) {
    const isMobile = /Mobile|Android/i.test(navigator.userAgent);

    /* 1) unified endpoint */
    try {
      const { data } = await this.c.post(`/games/${providerId}/launch`, {
        gameCode,
        currency: "THB",
        language: "en",
        isMobileLogin: isMobile,
      });
      if (data.success && (data.data?.gameUrl || data.data?.url))
        return (data.data.gameUrl || data.data.url) as string;
    } catch {
      console.log("Unified launch failed, fallback to seamless…");
    }

    /* 2) seamless fallback */
    const sessionToken = this.generateSessionToken();
    try {
      const { data } = await this.c.post("/seamless/logIn", {
        username: this.getCurrentUsername(),
        productId: providerId,
        gameCode,
        isMobileLogin: isMobile,
        sessionToken,
        language: "en",
        callbackUrl: window.location.origin,
      });

      if (data.code === 0 && data.data?.url) return data.data.url as string;
      if (data.success && (data.data?.gameUrl || data.data?.url))
        return (data.data.gameUrl || data.data.url) as string;
    } catch (e) {
      console.error("Seamless launch failed:", e);
    }

    /* 3) as a last resort return an internal demo url */
    const demo = `${
      window.location.origin
    }/game-demo?game=${gameCode}&provider=${providerId}&username=${this.getCurrentUsername()}&session=${sessionToken}`;
    return demo;
  }

  /* ---------- helpers ---------- */
  private writeTokens(d: { accessToken: string; refreshToken: string }) {
    localStorage.setItem("accessToken", d.accessToken);
    localStorage.setItem("refreshToken", d.refreshToken);
  }
  private generateSessionToken() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
  private getCurrentUsername() {
    const userStr = localStorage.getItem("user");
    if (userStr)
      try {
        return JSON.parse(userStr).username;
      } catch {}
    const profileStr = localStorage.getItem("profile");
    if (profileStr)
      try {
        return JSON.parse(profileStr).username;
      } catch {}
    const access = localStorage.getItem("accessToken");
    if (access) {
      try {
        return JSON.parse(atob(access.split(".")[1])).username;
      } catch {}
    }
    return `guest_${Date.now()}`;
  }
}

export const apiClient = new TwinaceApi();
