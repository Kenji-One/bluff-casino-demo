// src/context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient, User } from "@/services/api";
import axios from "axios";

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    usernameOrEmail: string,
    password: string,
    twoFactorCode?: string
  ) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string,
    agreedToTerms: boolean,
    referralCode?: string
  ) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextShape>({} as AuthContextShape);

/* ── small helpers ──────────────────────────────────────────────────────── */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readStoredUser(): User | null {
  try {
    const s =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    return s ? (JSON.parse(s) as User) : null;
  } catch {
    return null;
  }
}
function writeStoredUser(u: User | null) {
  if (typeof window === "undefined") return;
  if (!u) localStorage.removeItem("user");
  else localStorage.setItem("user", JSON.stringify(u));
}

type TwoFAError = Error & {
  __twoFARequired?: boolean;
  userId?: string | number | null;
  twoFactorMethod?: string;
};

function normalizeUser(incoming: unknown, prev?: User | null): User {
  const src = isRecord(incoming) ? incoming : {};

  const joinDate =
    (src["joinDate"] as User["joinDate"] | undefined) ??
    (src["joinedAt"] as unknown as User["joinDate"] | undefined) ??
    (src["createdAt"] as unknown as User["joinDate"] | undefined) ??
    (src["created_at"] as unknown as User["joinDate"] | undefined) ??
    prev?.joinDate ??
    null;

  const profilePicture =
    "profilePicture" in src
      ? (src["profilePicture"] as User["profilePicture"])
      : prev?.profilePicture;

  const normalized: User = {
    ...(prev ?? ({} as User)),
    ...(isRecord(incoming) ? (incoming as Partial<User>) : {}),
    joinDate,
    profilePicture,
  };

  return normalized;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const storedRaw = readStoredUser();

    if (accessToken && storedRaw) {
      const primed = normalizeUser(storedRaw, null);
      setUser(primed);
    }

    if (!accessToken) {
      writeStoredUser(null);
      setUser(null);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const fresh = await apiClient.myProfile();
        setUser((prev) => {
          const merged = normalizeUser(fresh, prev);
          writeStoredUser(merged);
          return merged;
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        writeStoredUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (
    usernameOrEmail: string,
    password: string,
    twoFactorCode?: string
  ): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiClient.login(
        usernameOrEmail,
        password,
        twoFactorCode
      );
      const u = normalizeUser(raw, null);
      setUser(u);
      writeStoredUser(u);
      return u;
    } catch (e: unknown) {
      const payload = axios.isAxiosError(e)
        ? (e.response?.data as Record<string, unknown> | undefined) ?? {}
        : {};

      const needs2FA =
        (isRecord(e) &&
          typeof e["__twoFARequired"] === "boolean" &&
          e["__twoFARequired"]) ||
        Boolean(payload["requiresTwoFactor"]) ||
        Boolean(payload["twoFactorRequired"]);

      if (needs2FA) {
        const msg =
          (isRecord(payload) &&
            typeof payload["message"] === "string" &&
            payload["message"]) ||
          (e instanceof Error ? e.message : "2FA code required");

        const special: TwoFAError = Object.assign(new Error(msg), {
          __twoFARequired: true,
          userId:
            (isRecord(e) &&
              (e["userId"] as string | number | null | undefined)) ??
            (isRecord(payload)
              ? (payload["userId"] as string | number | null | undefined)
              : null) ??
            null,
          twoFactorMethod:
            (isRecord(e) && (e["twoFactorMethod"] as string | undefined)) ??
            (isRecord(payload)
              ? (payload["twoFactorMethod"] as string | undefined)
              : undefined) ??
            "authenticator",
        });
        // don't set global error; let UI switch to 2FA
        throw special;
      }

      const msg = axios.isAxiosError(e)
        ? (e.response?.data as { message?: string } | undefined)?.message ||
          e.message
        : e instanceof Error
        ? e.message
        : "Login failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    agreedToTerms: boolean,
    referralCode?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiClient.register(
        username,
        email,
        password,
        agreedToTerms,
        referralCode
      );
      const u = normalizeUser(raw, null);
      setUser(u);
      writeStoredUser(u);
      return u;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message ?? err.message);
      } else {
        setError((err as Error).message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    writeStoredUser(null);
  };

  async function refreshUser() {
    try {
      const fresh = await apiClient.myProfile();
      setUser((prev) => {
        const merged = normalizeUser(fresh, prev);
        writeStoredUser(merged);
        return merged;
      });
    } catch (err) {
      console.error("🔄 Failed to refresh user", err);
    }
  }

  function updateUser(partial: Partial<User>) {
    setUser((prev) => {
      const next = normalizeUser(partial, prev ?? ({} as User));
      writeStoredUser(next);
      return next;
    });
  }

  const value: AuthContextShape = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
