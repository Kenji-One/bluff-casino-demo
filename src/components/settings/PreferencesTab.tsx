"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Header, Toggle } from "./shared";
import CustomSelect, { SelectOption } from "./shared/CustomSelect";
import PrefRow from "./shared/PrefRow";
import PrefRowSkeleton from "./shared/PrefRowSkeleton";
import { CurrencyIcon } from "./shared";

import userSettingsApi from "@/services/userSettings";

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

/* ─────────────────────────────────────────
   Component
   ───────────────────────────────────────── */
export default function PreferencesTab() {
  const qc = useQueryClient();
  const [currency, setCurrency] = useState("USD"); // UI-only value

  /* ---------- Fetch preferences (cached 5 min) ---------- */
  const { data: opts, isLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => userSettingsApi.getPreferences().then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /* ---------- Update preferences (optimistic) ---------- */
  const { mutate } = useMutation({
    mutationFn: userSettingsApi.updatePreferences,
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["preferences"] });
      const prev = qc.getQueryData<BackendPrefs>(["preferences"]);
      qc.setQueryData(["preferences"], { ...prev, ...patch });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["preferences"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });

  /* ---------- Helpers ---------- */
  const toggle = (k: keyof BackendPrefs) =>
    mutate({ ...opts!, [k]: !opts![k] });

  const changeSelect = (v: "Decimal" | "Fractional") =>
    mutate({ ...opts!, oddPreference: v });

  /* ---------- UI ---------- */
  if (isLoading) {
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

  return (
    <section className="space-y-2">
      <Header title="Preferences" subtitle="Manage your account preferences" />

      <PrefRow
        label="Flat View"
        sub="Balances will be displayed in your selected currency"
        layout="toggle+select"
      >
        <Toggle checked={opts!.flatView} onChange={() => toggle("flatView")} />
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
          value={opts!.oddPreference}
          onChange={(v) => changeSelect(v as any)}
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
          <Toggle checked={opts![k]} onChange={() => toggle(k)} />
        </PrefRow>
      ))}
    </section>
  );
}
