/* ------------------------------------------------------------------
 *  src/services/api.ts  (public endpoints fixed)
 * ----------------------------------------------------------------- */

"use client";

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

/* ---------- shared types ---------- */
export interface User {
  id: string;
  username: string;
  profilePicture?: string;
  email: string;
  joinDate: string;
  referralCode?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
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

export interface WalletResponse {
  success: boolean;
  message: string;
  data: { balance: number; transactions?: Transaction[] };
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
  recentlyPlayed?: boolean;
}

export interface RawGamesResponse {
  success?: boolean;
  message?: string;
  data?: {
    games?: Game[];
    [key: string]: unknown; // ← no `any`
  };
  games?: Game[];
}

/* ---------- helpers ---------- */
function getAccess() {
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;
}
function getRefresh() {
  return typeof window !== "undefined"
    ? localStorage.getItem("refreshToken")
    : null;
}
function saveTokens(d: { accessToken?: string; refreshToken?: string }) {
  if (d.accessToken) localStorage.setItem("accessToken", d.accessToken);
  if (d.refreshToken) localStorage.setItem("refreshToken", d.refreshToken);
}
function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/** Endpoints that must stay public (no auth header, no cookies). */
const PUBLIC_PATHS = [
  "/seamless/games",
  "/games", // listing endpoints under /games...
];

/* ---------- client ---------- */
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };
type TwoFAError = Error & {
  __twoFARequired?: boolean;
  userId?: string | number | null;
  twoFactorMethod?: string;
  response?: { data?: unknown };
};

class TwinaceApi {
  private c: AxiosInstance;
  private refreshClient: AxiosInstance;

  private isRefreshing = false;
  private pendingQueue: Array<(token: string | null) => void> = [];

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

    // DEFAULT CLIENT: no credentials; public endpoints won’t be blocked by CORS.
    this.c = axios.create({
      baseURL,
      timeout: 10_000,
      headers: { "Content-Type": "application/json" },
    });

    // Refresh client (no cookies needed).
    this.refreshClient = axios.create({
      baseURL,
      timeout: 10_000,
      headers: { "Content-Type": "application/json" },
    });

    this.c.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
      const url = (cfg.url || "").toString();
      const isPublic = PUBLIC_PATHS.some((p) => url.startsWith(p));

      // Only attach Authorization for non-public endpoints.
      if (!isPublic) {
        const t = getAccess();
        if (t) {
          cfg.headers = cfg.headers || {};
          (cfg.headers as Record<string, string>).Authorization = `Bearer ${t}`;
        }
      }
      return cfg;
    });

    this.c.interceptors.response.use(
      (r) => r,
      async (err: unknown) => {
        if (!axios.isAxiosError(err)) {
          return Promise.reject(err);
        }

        const orig = err.config as RetryableConfig | undefined;

        if (!err.response || err.response.status !== 401 || !orig) {
          return Promise.reject(err);
        }

        const url = (orig.url || "").toString();
        // Never try to refresh for public endpoints.
        if (PUBLIC_PATHS.some((p) => url.startsWith(p))) {
          return Promise.reject(err);
        }

        // Don’t loop on refresh endpoints
        if (
          url.includes("/auth/refresh") ||
          url.includes("/auth/refresh-token")
        ) {
          return Promise.reject(err);
        }

        if (orig._retry) return Promise.reject(err);
        orig._retry = true;

        const rt = getRefresh();
        if (!rt) return Promise.reject(err);

        if (this.isRefreshing) {
          const token = await new Promise<string | null>((resolve) => {
            this.pendingQueue.push(resolve);
          });
          if (token) {
            orig.headers = orig.headers || {};
            (
              orig.headers as Record<string, string>
            ).Authorization = `Bearer ${token}`;
          }
          return this.c(orig);
        }

        this.isRefreshing = true;
        try {
          const { data } = await this.refreshClient.post(
            "/auth/refresh-token",
            { refreshToken: rt }
          );

          const newAccess: string | undefined = data?.data?.accessToken;
          const newRefresh: string | undefined = data?.data?.refreshToken;
          if (!newAccess) throw new Error("Invalid refresh response");

          saveTokens({ accessToken: newAccess, refreshToken: newRefresh });

          this.pendingQueue.forEach((fn) => fn(newAccess));
          this.pendingQueue = [];

          orig.headers = orig.headers || {};
          (
            orig.headers as Record<string, string>
          ).Authorization = `Bearer ${newAccess}`;
          return this.c(orig);
        } catch (e) {
          clearTokens();
          this.pendingQueue.forEach((fn) => fn(null));
          this.pendingQueue = [];
          return Promise.reject(e);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  /* ---------- generic http helpers ---------- */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.c.get<T>(url, config);
    return data as T;
  }
  async patch<T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const { data } = await this.c.patch<T>(url, body, config);
    return data as T;
  }
  async post<T = unknown, B = unknown>(url: string, body?: B): Promise<T> {
    const { data } = await this.c.post<T>(url, body);
    return data as T;
  }
  async put<T = unknown, B = unknown>(url: string, body?: B): Promise<T> {
    const { data } = await this.c.put<T>(url, body);
    return data as T;
  }
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const { data } = await this.c.delete<T>(url, config);
    return data as T;
  }
  async download<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const { data } = await this.c.get<T>(url, { ...config });
    return data as T;
  }

  /* ---------- auth ---------- */
  async login(
    usernameOrEmail: string,
    password: string,
    twoFactorCode?: string
  ) {
    const payload: Record<string, unknown> = { usernameOrEmail, password };
    if (twoFactorCode?.trim()) payload.twoFactorCode = twoFactorCode.trim();

    // No credentials globally; 2FA flow works because we re-post /auth/login with the code.
    const { data } = await this.c.post("/auth/login", payload);

    if (data?.requiresTwoFactor || data?.twoFactorRequired) {
      const err: TwoFAError = Object.assign(
        new Error(data?.message || "2FA code required"),
        {
          __twoFARequired: true,
          userId: data?.userId ?? data?.data?.userId ?? null,
          twoFactorMethod: data?.twoFactorMethod ?? "authenticator",
          response: { data },
        }
      );
      throw err;
    }

    saveTokens({
      accessToken: data?.data?.accessToken,
      refreshToken: data?.data?.refreshToken,
    });

    return data.data.user as User;
  }

  /** Email 2FA code (send/resend) – requires temp cookie; send with credentials */
  async sendLoginTwoFactorCode(userId?: string | null) {
    await this.c.post(
      "/user-settings/security/2fa/email/send-code",
      userId ? { userId } : {},
      { withCredentials: true }
    );
  }

  /** Verify 2FA during login (email or authenticator).
   * Email verification needs the temp cookie → withCredentials: true.
   */
  async verifyTwoFactorLogin(
    userId: string | undefined,
    code: string,
    method?: string | null
  ) {
    const m = (method ?? "").toLowerCase();

    if (m === "email") {
      const { data } = await this.c.post(
        "/user-settings/security/2fa/email/verify",
        { code },
        { withCredentials: true }
      );
      saveTokens({
        accessToken: data?.data?.accessToken,
        refreshToken: data?.data?.refreshToken,
      });
      return data.data.user as User;
    }

    const candidates = [
      "/user-settings/security/2fa/authenticator/verify",
      "/user-settings/security/2fa/verify",
    ];

    let lastErr: unknown = null;
    for (const p of candidates) {
      try {
        const { data } = await this.c.post(p, {
          code,
          ...(userId ? { userId } : {}),
        });
        saveTokens({
          accessToken: data?.data?.accessToken,
          refreshToken: data?.data?.refreshToken,
        });
        return data.data.user as User;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error("Failed to verify 2FA code");
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

    saveTokens({
      accessToken: data?.data?.accessToken,
      refreshToken: data?.data?.refreshToken,
    });

    return data.data.user as User;
  }

  logout() {
    clearTokens();
  }

  async forgotPassword(email: string) {
    await this.c.post("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ) {
    await this.c.post("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
  }

  /* ─── email verification ── */
  async startEmailVerification(email?: string) {
    const body = email ? { email } : {};
    await this.c.post("/user-settings/verification/email/start", body);
  }
  async verifyEmailCode(code: string) {
    await this.c.post("/user-settings/verification/email/verify-code", {
      code,
    });
  }
  async verifyEmail(token: string) {
    await this.c.post("/user-settings/verification/email/verify", { token });
  }
  async resendVerification(email?: string) {
    const body = email ? { email } : {};
    await this.c.post("/user-settings/verification/email/resend", body);
  }
  async checkVerificationStatus(): Promise<boolean> {
    const { data } = await this.c.get(
      "/user-settings/verification/email/status"
    );
    const d = data?.data ?? data;
    return Boolean(d?.emailVerified ?? d?.verified ?? false);
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
    return data as WalletResponse;
  }
  async getBalance() {
    return this.balance();
  }
  async getTransactions(limit = 50, offset = 0) {
    return this.transactions(limit, offset);
  }
  async withdraw(amount: number): Promise<WalletResponse> {
    const { data } = await this.c.post("/wallet/withdraw", { amount });
    return data as WalletResponse;
  }
  async transactions(limit = 50, offset = 0): Promise<WalletResponse> {
    const { data } = await this.c.get(
      `/user-settings/transactions?limit=${limit}&offset=${offset}`
    );
    return data as WalletResponse;
  }

  /* ---------- games (PUBLIC) ---------- */
  async listGames(filters?: {
    type?: string;
    category?: string;
    providerId?: string;
    search?: string;
    limit?: number;
  }) {
    const productId = filters?.providerId ?? "JOKER";
    // Public: no auth header, no cookies (interceptor already enforces this).
    const { data } = await this.c.get(`/seamless/games?productId=${productId}`);

    let games: Game[] = [];
    if (Array.isArray(data?.data)) games = data.data;
    else if (Array.isArray(data?.data?.games)) games = data.data.games;
    else if (Array.isArray(data?.games)) games = data.games;
    else games = [];

    if (filters?.type) games = games.filter((g) => g.type === filters.type);
    if (filters?.category)
      games = games.filter((g) => g.category === filters.category);
    if (filters?.search)
      games = games.filter((g) =>
        g.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    if (filters?.limit) games = games.slice(0, filters.limit);

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[listGames] providerId=${productId} → ${games.length} games`
      );
    }

    return games;
  }

  async getGameMeta(gameCode: string, providerId: string) {
    const games = await this.listGames({ providerId });
    return games.find((g) => g.code === gameCode) ?? null;
  }

  async launchGame(gameCode: string, providerId: string) {
    const isMobile = /Mobile|Android/i.test(navigator.userAgent);

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

    const demo = `${
      window.location.origin
    }/game-demo?game=${gameCode}&provider=${providerId}&username=${this.getCurrentUsername()}&session=${this.generateSessionToken()}`;
    return demo;
  }

  /* ---------- misc helpers ---------- */
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
    const access = getAccess();
    if (access) {
      try {
        return JSON.parse(atob(access.split(".")[1])).username;
      } catch {}
    }
    return `guest_${Date.now()}`;
  }
}

export const apiClient = new TwinaceApi();
