"use client";
import { useEffect, useState } from "react";
import { apiClient, Transaction } from "@/services/api";

export default function TransactionHistory() {
  const [list, setList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchTx = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getTransactions(100, 0);
      setList(res.transactions ?? []);
    } catch (e: unknown) {
      const err = e as Error;
      setErr(err.message || "Unable to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
  }, []);

  if (loading)
    return <div className="h-32 animate-pulse rounded-xl bg-white/10" />;

  if (err)
    return (
      <div className="rounded-xl bg-red-500/20 p-4 text-red-200">{err}</div>
    );

  if (!list.length)
    return (
      <div className="rounded-xl bg-white/10 p-6 text-center text-white/60">
        No transactions yet
      </div>
    );

  const icon = (t: string) =>
    ((
      {
        DEPOSIT: "💰",
        WITHDRAW: "💸",
        BET: "🎮",
        WIN: "🎉",
      } as Record<string, string>
    )[t] ?? "💳");

  return (
    <div className="space-y-3 overflow-y-auto rounded-xl bg-white/5 p-4 max-h-[420px]">
      {list.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-lg bg-white/5 p-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon(tx.type)}</span>
            <div>
              <p className="text-white">{tx.description}</p>
              <p className="text-xs text-white/60">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={
                tx.type === "WITHDRAW" || tx.type === "BET"
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              {(tx.type === "WITHDRAW" || tx.type === "BET" ? "-" : "+") +
                `$${Math.abs(tx.amount).toFixed(2)}`}
            </p>
            <p className="text-xs text-white/50">
              ${tx.balanceAfter.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
