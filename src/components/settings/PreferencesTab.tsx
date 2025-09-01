// src/components/settings/PreferencesTab.tsx
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header, Toggle } from "./shared";
import CustomSelect, { SelectOption } from "./shared/CustomSelect";
import PrefRow from "./shared/PrefRow";
import PrefRowSkeleton from "./shared/PrefRowSkeleton";
import { CurrencyIcon } from "./shared";

import userSettingsApi, { PreferencesPayload } from "@/services/userSettings";
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
type Prefs = PreferencesPayload;
type OddPreference = Prefs["oddPreference"];

type ToggleableKey =
  | "flatView"
  | "privateMode"
  | "emailMarketing"
  | "streamerMode"
  | "hideZeroBalances";

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
    enabled: isAuthed,
    // unwrap to the actual PreferencesPayload here:
    queryFn: async () => (await userSettingsApi.getPreferences()).data as Prefs,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, err) => {
      const status = getHttpStatus(err);
      if (status === 401) return false;
      return failureCount < 2;
    },
  });

  const unauthorized = useMemo(
    () => isError && getHttpStatus(error) === 401,
    [isError, error]
  );

  type PrefPatch = Parameters<typeof userSettingsApi.updatePreferences>[0];

  /* ---------- Update preferences (optimistic) ---------- */
  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: (patch: PrefPatch) => userSettingsApi.updatePreferences(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["preferences"] });
      const prev = qc.getQueryData<Prefs>(["preferences"]);
      if (prev) {
        qc.setQueryData<Prefs>(["preferences"], { ...prev, ...patch });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["preferences"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });

  /* ---------- Helpers ---------- */
  const toggle = (k: ToggleableKey) => {
    if (!opts) return;
    const next = !opts[k];
    mutate({ [k]: next } as PrefPatch);
  };

  const changeSelect = (v: OddPreference) => {
    if (!opts) return;
    mutate({ oddPreference: v } as PrefPatch);
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
            <Link
              href="/?auth=login"
              className="rounded-full px-4 py-2 bg-[var(--color-blue)] text-white text-sm hover:bg-[var(--color-blue)]/90"
            >
              Log in
            </Link>
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
            ] as const satisfies ReadonlyArray<[ToggleableKey, string, string]>
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
  const rows = [
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
  ] as const satisfies ReadonlyArray<[ToggleableKey, string, string]>;

  return (
    <section className="space-y-2">
      <Header title="Preferences" subtitle="Manage your account preferences" />

      <PrefRow
        label="Flat View"
        sub="Balances will be displayed in your selected currency"
        layout="toggle+select"
      >
        <Toggle
          checked={opts.flatView}
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
          value={opts.oddPreference}
          onChange={(v) => {
            if (isOddValue(v)) changeSelect(v);
          }}
          options={oddsOptions}
        />
      </PrefRow>

      {rows.map(([k, label, sub]) => (
        <PrefRow key={k} label={label} sub={sub} layout="toggle">
          <Toggle
            checked={opts[k]}
            onChange={() => toggle(k)}
            disabled={isSaving}
          />
        </PrefRow>
      ))}
    </section>
  );
}
