// src/lib/auth.ts

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
}

export async function register(data: RegisterData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Registration failed");
  }

  return json;
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Login failed");
  }

  return json;
}

export async function getProfile(token: string) {
  console.log("Fetching user profile with token:", token);
  const res = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch profile");
  }

  return json;
}

export function logout() {
  // Clear tokens from localStorage (we'll store it in next steps)
  localStorage.removeItem("token");
}

// 👉 add at the bottom of auth.ts
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
