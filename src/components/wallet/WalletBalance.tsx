"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function WalletBalance() {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await apiClient.balance();
      setBalance(res.balance);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Unable to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBalance();
    // eslint-disable-next-line
  }, [user]);

  if (loading)
    return <div className="h-24 animate-pulse rounded-xl bg-white/10" />;

  if (error)
    return (
      <div className="rounded-xl bg-red-500/20 p-4 text-red-200">{error}</div>
    );

  return (
    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-4">
      <div>
        <p className="text-sm opacity-80">Balance</p>
        <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
      </div>

      <button
        onClick={async () => {
          await fetchBalance();
          await refreshUser();
        }}
        className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30"
        title="Refresh"
      >
        ⟳
      </button>
    </div>
  );
}
