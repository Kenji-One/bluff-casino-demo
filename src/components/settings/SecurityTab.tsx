"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Header } from "./shared";
import Button from "../form/Button";
import ChangePasswordModal from "./security/ChangePasswordModal";
import Enable2FAModal from "./security/Enable2FAModal";
import userSettingsApi from "@/services/userSettings";

/** Shape returned by /security/2fa/status */
interface TwoFAStatus {
  enabled: boolean;
  enabledAt: string | null;
}

export default function SecurityTab() {
  /* ---------- 2FA status query ---------- */
  const {
    data: twoFA,
    refetch,
    isLoading,
    isFetching,
  } = useQuery<TwoFAStatus>({
    queryKey: ["2fa-status"],
    queryFn: async () => {
      const res = (await userSettingsApi.get2FAStatus()) as {
        success: boolean;
        data: TwoFAStatus;
      };
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  /* ---------- local modal state ---------- */
  const [showPw, setShowPw] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const enabled = !!twoFA?.enabled;
  const enabledAtLabel = twoFA?.enabledAt
    ? new Date(twoFA.enabledAt).toLocaleString()
    : null;

  return (
    <section className="space-y-2">
      <Header title="Security" subtitle="Manage your account security" />

      <div className="grid md:grid-cols-2 gap-2">
        {/* ── Change-Password card ─────────────────────── */}
        <Card className="flex items-center justify-between gap-4 lg:gap-6 flex-wrap">
          <div>
            <p className="font-medium">Change Password</p>
            <p className="text-xs text-[var(--secondary-text)]">
              Last changed: —
            </p>
          </div>

          <Button
            label="Change password"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7.5 4.16732L13.3333 10.0007L7.5 15.834"
                  stroke="white"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            variant="login"
            padding="px-3 py-[6px]"
            onClick={() => setShowPw(true)}
          />
        </Card>

        {/* ── 2FA card ─────────────────────────────────── */}
        <Card className="flex items-center gap-4 lg:gap-6 flex-wrap justify-between">
          <div className="w-full max-w-[380px]">
            <div className="flex items-center gap-2">
              <p className="font-medium mb-1">Two-Factor Authentication</p>
              {/* Small live status badge */}
              {!isLoading && (
                <span
                  className={`mb-1 inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                    enabled
                      ? "bg-green-500/15 text-green-400"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--secondary-text)]">
              Enhance your security by using 2-factor verification via an
              authenticator app for all future logins, withdrawals and tipping.
            </p>

            {/* Show when it was enabled, if applicable */}
            {enabledAtLabel && (
              <p className="mt-1 text-[11px] text-[var(--secondary-text)]">
                Enabled on: {enabledAtLabel}
              </p>
            )}
          </div>

          <Button
            label={
              isLoading || isFetching
                ? "Loading..."
                : enabled
                ? "Disable"
                : "Enable"
            }
            padding="px-4 py-3"
            disabled={isLoading || isFetching}
            variant={enabled ? undefined : "signup"}
            className={
              enabled ? "bg-[var(--color-error)] hover:bg-red-700" : ""
            }
            onClick={() => setShow2FA(true)}
          />
        </Card>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      <ChangePasswordModal open={showPw} onClose={() => setShowPw(false)} />

      <Enable2FAModal
        open={show2FA}
        enabled={enabled}
        onClose={() => {
          setShow2FA(false);
          refetch(); // refresh status after modal closes
        }}
      />
    </section>
  );
}
