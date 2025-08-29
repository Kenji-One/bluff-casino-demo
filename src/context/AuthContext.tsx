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

function normalizeUser(incoming: any, prev?: User | null): User {
  const joinDate =
    incoming?.joinDate ??
    incoming?.joinedAt ??
    incoming?.createdAt ??
    incoming?.created_at ??
    prev?.joinDate ??
    null;

  const normalized: User = {
    ...(prev ?? ({} as User)),
    ...(incoming ?? {}),
    joinDate,
    profilePicture:
      incoming?.profilePicture !== undefined
        ? incoming.profilePicture
        : prev?.profilePicture,
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
    } catch (e: any) {
      const payload = e?.response?.data || {};
      const needs2FA =
        e?.__twoFARequired ||
        payload?.requiresTwoFactor ||
        payload?.twoFactorRequired;

      if (needs2FA) {
        const special: any = new Error(
          payload?.message || e?.message || "2FA code required"
        );
        special.__twoFARequired = true;
        special.userId = e?.userId ?? payload?.userId ?? null;
        special.twoFactorMethod =
          e?.twoFactorMethod ?? payload?.twoFactorMethod ?? "authenticator";
        // don't set global error; let UI switch to 2FA
        throw special;
      }

      const msg = axios.isAxiosError(e)
        ? e.response?.data?.message || e.message
        : e?.message || "Login failed";
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
