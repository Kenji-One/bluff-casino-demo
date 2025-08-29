// ./src/components/settings/verification/EmailVerifyModal.tsx
"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InputField from "../../form/InputField";
import Button from "../../form/Button";
import { apiClient } from "@/services/api";
import userSettingsApi from "@/services/userSettings";
import { parseApiError } from "@/utils/parseApiError";

/* ── tiny helpers to avoid `any` and safely read backend errors ─────────── */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function pickBackendMessage(err: unknown): string | undefined {
  if (!isRecord(err)) return undefined;
  const resp = err["response"];
  if (!isRecord(resp)) return undefined;
  const data = resp["data"];
  if (!isRecord(data)) return undefined;
  const message = data["message"];
  const hint = data["hint"];
  if (typeof message === "string") return message;
  if (typeof hint === "string") return hint;
  return undefined;
}
function toErrorMessage(err: unknown, fallback: string): string {
  return (
    pickBackendMessage(err) ||
    parseApiError(err).message ||
    undefined ||
    (err instanceof Error ? err.message : undefined) ||
    fallback
  );
}

export default function EmailVerifyModal({
  open,
  onClose,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
}) {
  // Primary flow: 6-digit code
  const [code, setCode] = useState("");
  // Optional legacy fallback (hidden unless URL contains ?token=)
  const [mode, setMode] = useState<"code" | "token">("code");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // If open via a legacy email link with ?token=..., reveal the token field
  useEffect(() => {
    if (!open) return;
    const t =
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("token")) ||
      "";
    if (t) {
      setMode("token");
      setToken(t);
    } else {
      setMode("code");
      setToken("");
    }
    setErr(null);
    setCode("");
  }, [open]);

  const verify = useMutation({
    mutationFn: async () => {
      setErr(null);
      if (mode === "code") {
        const clean = code.replace(/\D/g, "").slice(0, 6);
        if (clean.length !== 6) {
          throw new Error("Enter the 6-digit code.");
        }
        try {
          await apiClient.verifyEmailCode(clean);
        } catch (e: unknown) {
          throw new Error(toErrorMessage(e, "Verification failed."));
        }
      } else {
        // Legacy fallback – if backend rejects as deprecated, show helpful hint
        try {
          await apiClient.verifyEmail(token.trim());
        } catch (e: unknown) {
          throw new Error(
            toErrorMessage(
              e,
              "Token verification is deprecated. Please enter the 6-digit code."
            )
          );
        }
      }
    },
    onSuccess: () => onVerified?.(),
    onError: (e: unknown) => {
      setErr(
        pickBackendMessage(e) ||
          parseApiError(e).message ||
          (e instanceof Error ? e.message : "Verification failed.")
      );
    },
  });

  const close = () => {
    setErr(null);
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={close}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <DialogPanel className="w-full max-w-[520px] rounded-2xl bg-[var(--color-popup-background)] border border-white/10 p-6 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold">
                    Verify your email
                  </DialogTitle>
                  <button
                    className="rounded-lg p-2 text-white/60 hover:text-white"
                    onClick={close}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {mode === "code" ? (
                  <>
                    <p className="mb-6 text-sm text-[var(--secondary-text)]">
                      Enter the <b>6-digit verification code</b> we sent to your
                      email.
                    </p>

                    <div className="mb-4">
                      <InputField
                        label="6-digit code"
                        placeholder="123456"
                        inputMode="numeric"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                      />
                    </div>

                    <p className="mb-4 text-xs text-white/50">
                      Have an old verification link?{" "}
                      <button
                        className="underline hover:text-white"
                        onClick={() => setMode("token")}
                      >
                        Use legacy token
                      </button>
                      .
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-6 text-sm text-[var(--secondary-text)]">
                      Token-based verification is being phased out. If this
                      doesn’t work, please use the 6-digit code instead.
                    </p>

                    <div className="mb-4">
                      <InputField
                        label="Verification token"
                        placeholder="verification_token_here"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                      />
                    </div>

                    <p className="mb-4 text-xs text-white/50">
                      Prefer the current method?{" "}
                      <button
                        className="underline hover:text-white"
                        onClick={() => setMode("code")}
                      >
                        Enter 6-digit code
                      </button>
                      .
                    </p>
                  </>
                )}

                {err ? (
                  <div className="mb-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
                    {err}
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <Button
                    label="Cancel"
                    padding="px-4 py-3"
                    variant="login"
                    onClick={close}
                  />
                  <Button
                    label={verify.isPending ? "Verifying..." : "Verify"}
                    padding="px-4 py-3"
                    onClick={() => verify.mutate()}
                    disabled={
                      verify.isPending ||
                      (mode === "code"
                        ? code.replace(/\D/g, "").length !== 6
                        : token.trim().length === 0)
                    }
                  />
                </div>

                {/* (Optional) quick helpers */}
                <div className="mt-4 text-xs text-white/50">
                  Didn’t get a code?{" "}
                  <button
                    className="underline hover:text-white"
                    onClick={async () => {
                      try {
                        await userSettingsApi.startEmailVerification();
                        setErr("We’ve sent a new code to your email.");
                      } catch (e: unknown) {
                        setErr(toErrorMessage(e, "Could not resend code."));
                      }
                    }}
                  >
                    Send a new code
                  </button>
                  .
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
