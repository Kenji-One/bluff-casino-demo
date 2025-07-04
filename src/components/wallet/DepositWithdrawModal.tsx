"use client";
import { useState } from "react";
import { apiClient } from "@/services/api";

type Mode = "deposit" | "withdraw";

interface Props {
  mode: Mode;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  maxAmount?: number; // pass user.balance for withdraw
}

export default function DepositWithdrawModal({
  mode,
  isOpen,
  onClose,
  onSuccess,
  maxAmount,
}: Props) {
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const title = mode === "deposit" ? "Deposit Funds" : "Withdraw Funds";
  const actionLabel = mode === "deposit" ? "Deposit" : "Withdraw";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n < 10) return setErr("Minimum amount is $10");
    if (mode === "withdraw" && maxAmount && n > maxAmount)
      return setErr("Insufficient balance");

    setLoading(true);
    setErr("");

    try {
      if (mode === "deposit") await apiClient.deposit(n);
      else await apiClient.withdraw(n);

      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      const err = e as Error;
      setErr(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white/10 p-6 backdrop-blur"
      >
        <h2 className="text-2xl font-bold text-white">{title}</h2>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-3 text-gray-400">
            $
          </span>
          <input
            type="number"
            className="w-full rounded-lg bg-white/20 px-8 py-3 text-white focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={10}
            max={mode === "withdraw" ? maxAmount : 10000}
            step="0.01"
            required
          />
        </div>

        {err && <p className="text-sm text-red-300">{err}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Processing…" : actionLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
