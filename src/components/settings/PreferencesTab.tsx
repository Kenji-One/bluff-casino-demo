// src/components/settings/PreferencesTab.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header, Toggle } from "./shared";
import CustomSelect, { SelectOption } from "./shared/CustomSelect";
import PrefRow from "./shared/PrefRow";
import PrefRowSkeleton from "./shared/PrefRowSkeleton";
import { CurrencyIcon } from "./shared";

import userSettingsApi from "@/services/userSettings";
import { useAuth } from "@/context/AuthContext";

/* ─────────────────────────────────────────
   Select options
   ───────────────────────────────────────── */
const currencyOptions: SelectOption[] = [
  { value: "USD", label: "USD", icon: <CurrencyIcon symbol="$" /> },
  { value: "EUR", label: "EUR", icon: <CurrencyIcon symbol="€" /> },
  { value: "GBP", label: "GBP", icon: <CurrencyIcon symbol="£" /> },
];

const oddsOptions: SelectOption[] = [
  { value: "Decimal", label: "Decimal" },
  { value: "Fractional", label: "Fractional" },
];

/* ─────────────────────────────────────────
   Types
   ───────────────────────────────────────── */
type BackendPrefs = Awaited<
  ReturnType<typeof userSettingsApi.getPreferences>
>["data"];

type OddPreference = "Decimal" | "Fractional";

/* Narrow unknown to axios-like errors safely (no any) */
const getHttpStatus = (err: unknown): number | undefined => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as Record<string, unknown>).response === "object" &&
    (err as { response?: { status?: unknown } }).response?.status &&
    typeof (err as { response: { status: unknown } }).response.status ===
      "number"
  ) {
    return (err as { response: { status: number } }).response.status;
  }
  return undefined;
};

const isOddValue = (v: unknown): v is OddPreference =>
  v === "Decimal" || v === "Fractional";

/* ─────────────────────────────────────────
   Component
   ───────────────────────────────────────── */
export default function PreferencesTab() {
  const qc = useQueryClient();
  const { user } = useAuth();

  // UI-only currency select (doesn't hit backend in this tab)
  const [currency, setCurrency] = useState("USD");

  const isAuthed = Boolean(user);

  /* ---------- Fetch preferences (cached 5 min) ---------- */
  const {
    data: opts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["preferences"],
    // Only fetch when we have a user (prevents 401 spam and renders nicer UI)
    enabled: isAuthed,
    queryFn: () => userSettingsApi.getPreferences().then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, err) => {
      // Avoid hammering if unauthorized
      const status = getHttpStatus(err);
      if (status === 401) return false;
      return failureCount < 2;
    },
  });

  const unauthorized = useMemo(
    () => isError && getHttpStatus(error) === 401,
    [isError, error]
  );

  /* ---------- Update preferences (optimistic) ---------- */
  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (patch: Partial<BackendPrefs>) =>
      userSettingsApi.updatePreferences(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["preferences"] });
      const prev = qc.getQueryData<BackendPrefs>(["preferences"]);
      // merge optimistically if we have previous data
      if (prev) {
        qc.setQueryData<BackendPrefs>(["preferences"], { ...prev, ...patch });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["preferences"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });

  /* ---------- Helpers ---------- */
  const toggle = (k: keyof BackendPrefs) => {
    if (!opts) return; // guard when data missing (e.g., logout)
    const next = !opts[k];
    mutate({ [k]: next } as Partial<BackendPrefs>);
  };

  const changeSelect = (v: OddPreference) => {
    if (!opts) return;
    mutate({ oddPreference: v });
  };

  /* ---------- Loading UI ---------- */
  if (isAuthed && isLoading) {
    return (
      <section className="space-y-2">
        <PrefRowSkeleton layout="toggle+select" />
        <PrefRowSkeleton layout="toggle+select" />
        {Array.from({ length: 4 }).map((_, i) => (
          <PrefRowSkeleton key={i} layout="toggle" />
        ))}
      </section>
    );
  }

  /* ---------- Logged out / unauthorized graceful UI ---------- */
  if (!isAuthed || unauthorized || !opts) {
    return (
      <section className="space-y-4">
        <Header
          title="Preferences"
          subtitle="Manage your account preferences"
        />
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 text-white/80">
          <h3 className="text-base font-semibold mb-2">You’re signed out</h3>
          <p className="text-sm text-white/60">
            Log in to view and change your preference settings. If your session
            expired in the background, logging in again will restore access.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="/?auth=login"
              className="rounded-full px-4 py-2 bg-[var(--color-blue)] text-white text-sm hover:bg-[var(--color-blue)]/90"
            >
              Log in
            </a>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full px-4 py-2 bg-white/10 text-white text-sm hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        </div>

        {/* Read-only placeholders so the page doesn't look empty */}
        <div className="opacity-60 pointer-events-none">
          <PrefRow
            label="Flat View"
            sub="Balances will be displayed in your selected currency"
            layout="toggle+select"
          >
            <Toggle checked={false} onChange={() => {}} />
            <CustomSelect
              value={currency}
              onChange={setCurrency}
              options={currencyOptions}
            />
          </PrefRow>

          <PrefRow
            label="Odd Preference"
            sub="Odds will be displayed in this format"
          >
            <CustomSelect
              value={"Decimal"}
              onChange={() => {}}
              options={oddsOptions}
            />
          </PrefRow>

          {(
            [
              [
                "privateMode",
                "Private Mode",
                "Other users won't be able to view your wins, losses and wagered statistics",
              ],
              [
                "emailMarketing",
                "Email Marketing",
                "Receive notifications for offers and promotions. Critical information regarding your account will always be sent",
              ],
              [
                "streamerMode",
                "Streamer Mode",
                "Sensitive information will not be displayed",
              ],
              [
                "hideZeroBalances",
                "Hide Zero Balances",
                "Wallets with zero balance are hidden from view",
              ],
            ] as const
          ).map(([k, label, sub]) => (
            <PrefRow key={k} label={label} sub={sub} layout="toggle">
              <Toggle checked={false} onChange={() => {}} />
            </PrefRow>
          ))}
        </div>
      </section>
    );
  }

  /* ---------- Normal UI (authorized, data present) ---------- */
  return (
    <section className="space-y-2">
      <Header title="Preferences" subtitle="Manage your account preferences" />

      <PrefRow
        label="Flat View"
        sub="Balances will be displayed in your selected currency"
        layout="toggle+select"
      >
        <Toggle
          checked={Boolean(opts.flatView)}
          onChange={() => toggle("flatView")}
          disabled={isSaving}
        />
        <CustomSelect
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
        />
      </PrefRow>

      <PrefRow
        label="Odd Preference"
        sub="Odds will be displayed in this format"
      >
        <CustomSelect
          value={opts.oddPreference as OddPreference}
          onChange={(v) => {
            // Fixes "any": narrow at runtime before calling
            if (isOddValue(v)) changeSelect(v);
          }}
          options={oddsOptions}
        />
      </PrefRow>

      {(
        [
          [
            "privateMode",
            "Private Mode",
            "Other users won't be able to view your wins, losses and wagered statistics",
          ],
          [
            "emailMarketing",
            "Email Marketing",
            "Receive notifications for offers and promotions. Critical information regarding your account will always be sent",
          ],
          [
            "streamerMode",
            "Streamer Mode",
            "Sensitive information will not be displayed",
          ],
          [
            "hideZeroBalances",
            "Hide Zero Balances",
            "Wallets with zero balance are hidden from view",
          ],
        ] as const
      ).map(([k, label, sub]) => (
        <PrefRow key={k} label={label} sub={sub} layout="toggle">
          <Toggle
            checked={Boolean(opts[k as keyof BackendPrefs])}
            onChange={() => toggle(k as keyof BackendPrefs)}
            disabled={isSaving}
          />
        </PrefRow>
      ))}
    </section>
  );
}
