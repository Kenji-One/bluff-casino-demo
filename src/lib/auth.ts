// src/lib/auth.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// keep the keys consistent everywhere
export const ACCESS_KEY = "accessToken";
export const REFRESH_KEY = "refreshToken";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
  referralCode?: string;
}
interface LoginData {
  usernameOrEmail: string;
  password: string;
  twoFactorCode?: string; // ← added
}

/* ---- Types for responses + error we throw on 2FA requirement ---- */
type Tokens = { accessToken?: string; refreshToken?: string };

interface LoginResponse {
  message?: string;
  data?: Tokens & Record<string, unknown>;
  requiresTwoFactor?: boolean;
  twoFactorRequired?: boolean;
  userId?: string | number | null;
  twoFactorMethod?: string;
}

interface TwoFAError extends Error {
  response?: { data: LoginResponse };
  __twoFARequired?: boolean;
  userId?: string | number | null;
  twoFactorMethod?: string;
}

export async function register(data: RegisterData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json: { message?: string } = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← ensure temp cookie/2FA challenge cookie is sent
    body: JSON.stringify(data), // contains twoFactorCode when present
  });
  const json: LoginResponse = await res.json();

  if (json?.requiresTwoFactor || json?.twoFactorRequired) {
    const err: TwoFAError = Object.assign(
      new Error(json.message || "2FA code required"),
      {
        response: { data: json },
        __twoFARequired: true,
        userId: json.userId ?? null,
        twoFactorMethod: json.twoFactorMethod ?? "authenticator",
      }
    );
    throw err;
  }

  if (!res.ok) throw new Error(json.message || "Login failed");

  const { accessToken, refreshToken } = (json.data ?? {}) as Tokens;
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  return json;
}

// Kept name for compatibility; during "login 2FA (email)" older flows may call this
export async function verifyTwoFactorLogin(userId: string, code: string) {
  // Verify email 2FA (primary path)
  let res = await fetch(`${API_URL}/user-settings/security/2fa/email/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    credentials: "include",
  });

  if (!res.ok) {
    // try authenticator style as a fallback (if backend uses it)
    res = await fetch(`${API_URL}/user-settings/security/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId }),
      credentials: "include",
    });
  }

  const json: { message?: string; data?: Tokens } = await res.json();
  if (!res.ok) throw new Error(json.message || "2FA verification failed");

  const { accessToken, refreshToken } = json.data || {};
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  return json;
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const json: { message?: string } = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch profile");
  return json;
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("user");
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  const json: { message?: string; data?: Tokens & { refreshToken?: string } } =
    await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to refresh token");

  const { accessToken, refreshToken: newRefresh } = json.data || {};
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh);

  return accessToken as string;
}
