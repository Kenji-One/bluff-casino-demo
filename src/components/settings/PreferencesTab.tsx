"use client";

import { useState } from "react";
import { Header, Toggle } from "./shared";
import CustomSelect, { SelectOption } from "./shared/CustomSelect";
import PrefRow from "./shared/PrefRow";
import { CurrencyIcon } from "./shared";

const currencyOptions: SelectOption[] = [
  {
    value: "USD",
    label: "USD",
    icon: <CurrencyIcon symbol="$" />,
  },
  {
    value: "EUR",
    label: "EUR",
    icon: <CurrencyIcon symbol="€" />,
  },
  {
    value: "GBP",
    label: "GBP",
    icon: <CurrencyIcon symbol="£" />,
  },
];

const oddsOptions: SelectOption[] = [
  { value: "Decimal", label: "Decimal" },
  { value: "Fractional", label: "Fractional" },
  { value: "American", label: "American" },
];

export default function PreferencesTab() {
  const [opts, setOpts] = useState({
    currency: "USD",
    odds: "Decimal",
    privateMode: false,
    emailMarketing: true,
    streamerMode: false,
    hideZero: false,
    flatView: false,
  });
  const toggle = (k: keyof typeof opts) =>
    setOpts((s) => ({ ...s, [k]: !s[k] }));

  return (
    <section className="space-y-6">
      <Header title="Preferences" subtitle="Manage your account preferences" />

      <PrefRow
        label="Flat View"
        sub="Balances will be displayed in your selected currency"
        layout="toggle+select"
      >
        <Toggle checked={opts.flatView} onChange={() => toggle("flatView")} />
        <CustomSelect
          value={opts.currency}
          onChange={(v) => setOpts({ ...opts, currency: v })}
          options={currencyOptions}
        />
      </PrefRow>

      <PrefRow
        label="Odd Preference"
        sub="Odds will be displayed in this format"
      >
        <CustomSelect
          value={opts.odds}
          onChange={(v) => setOpts({ ...opts, odds: v })}
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
            "hideZero",
            "Hide Zero Balances",
            "Wallets with zero balance are hidden from view",
          ],
        ] as const
      ).map(([key, label, sub]) => (
        <PrefRow key={key} label={label} sub={sub} layout="toggle">
          <Toggle checked={opts[key]} onChange={() => toggle(key)} />
        </PrefRow>
      ))}
    </section>
  );
}
