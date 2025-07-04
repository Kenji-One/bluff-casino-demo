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

/* ---------- types exposed to components ---------- */
interface AuthContextShape {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    agreedToTerms: boolean,
    referralCode?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/* ---------- create context ---------- */
const AuthContext = createContext<AuthContextShape>({} as AuthContextShape);

/* ---------- provider implementation ---------- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // page-level spinner
  const [error, setError] = useState<string | null>(null);

  /* ----- hydrate session on first load ----- */
  useEffect(() => {
    // if there is a token in localStorage, try to fetch the profile
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .myProfile()
      .then(setUser)
      .catch(() => {
        // token invalid → clear storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ----- helpers ----- */
  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await apiClient.login(usernameOrEmail, password);
      setUser(u);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Login failed");
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
      const u = await apiClient.register(
        username,
        email,
        password,
        agreedToTerms,
        referralCode
      );
      setUser(u);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout(); // clears tokens
    setUser(null);
  };

  async function refreshUser() {
    try {
      const updated = await apiClient.myProfile(); // <- already returns balance
      setUser(updated);
    } catch (err) {
      console.error("🔄 Failed to refresh user", err);
    }
  }

  /* ----- value provided to consumers ----- */
  const value: AuthContextShape = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ---------- easy hook ---------- */
export function useAuth() {
  return useContext(AuthContext);
}
