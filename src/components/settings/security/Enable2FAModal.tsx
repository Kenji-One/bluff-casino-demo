// src/components/settings/security/Enable2FAModal.tsx
"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import InputField from "../../form/InputField";
import Button from "../../form/Button";
import toast from "react-hot-toast";
import userSettingsApi from "@/services/userSettings";
import { Eye, EyeOff, Copy, Info } from "lucide-react";

type Props = { open: boolean; onClose: () => void; enabled?: boolean };

interface Generate2FAResponse {
  success: true;
  data: {
    secret: string;
    /** New backend shape: a ready PNG as data URI */
    qrCode?: string;
    /** Legacy/alt shape: an otpauth:// URL to render as a QR */
    qrCodeUrl?: string;
  };
}

export default function Enable2FAModal({ open, onClose, enabled }: Props) {
  const [secret, setSecret] = useState("");
  const [qrImage, setQrImage] = useState(""); // data:image/png;base64,...
  const [otpAuthUrl, setOtpAuthUrl] = useState(""); // otpauth://...
  const [showSecret, setShowSecret] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Reset state whenever the modal opens/closes
  useEffect(() => {
    if (!open) return;
    setSecret("");
    setQrImage("");
    setOtpAuthUrl("");
    setShowSecret(false);
    setCode("");
    setLoading(false);
  }, [open]);

  // 1) Fetch secret & QR when opening (if not already enabled)
  useEffect(() => {
    if (!open || enabled) return;
    (async () => {
      try {
        const res =
          (await userSettingsApi.generate2FASecret()) as Generate2FAResponse;
        const data = res?.data;
        if (!data?.secret) throw new Error("Missing secret from server");

        setSecret(data.secret);
        // Prefer the ready-made PNG if present; otherwise use otpauth URL
        if (data.qrCode) setQrImage(data.qrCode);
        if (data.qrCodeUrl) setOtpAuthUrl(data.qrCodeUrl);
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to load 2FA setup.");
      }
    })();
  }, [open, enabled]);

  // 2) Render QR via qr-code-styling only if we have an otpauth URL (no PNG provided)
  useEffect(() => {
    if (!otpAuthUrl || !qrRef.current) return;
    try {
      qrRef.current.innerHTML = "";
      new QRCodeStyling({
        width: 200,
        height: 200,
        data: otpAuthUrl,
        dotsOptions: { color: "#ffffff" },
        backgroundOptions: { color: "transparent" },
      }).append(qrRef.current);
    } catch (e) {
      console.error(e);
    }
  }, [otpAuthUrl]);

  const copySecretToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Secret key copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  // 3) Enable / disable handler
  const handleAction = async () => {
    if (!code && !enabled) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }

    setLoading(true);
    try {
      if (enabled) {
        await userSettingsApi.disable2FA({ verificationCode: code });
        toast.success("2FA disabled");
      } else {
        await userSettingsApi.enable2FA(code);
        toast.success("2FA enabled");
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <DialogPanel className="w-full max-w-lg rounded-2xl bg-[var(--color-black)] p-8 space-y-6">
              <DialogTitle className="text-2xl font-bold text-white text-center">
                Two-Factor Authentication
              </DialogTitle>

              <p className="text-sm text-[var(--secondary-text)] text-center">
                To enable two-factor authentication (2FA), scan this QR code
                with an app like Authy or Google Authenticator. You will be
                required to use 2FA for all future logins, tips/rains and
                withdrawals.
              </p>

              {!enabled && (
                <>
                  {/* QR Container */}
                  <div className="mx-auto mb-6 flex items-center justify-center">
                    {!qrImage && !otpAuthUrl ? (
                      <div className="w-48 h-48 flex items-center justify-center bg-[var(--surface-l3)] rounded">
                        <span className="text-[var(--secondary-text)] text-sm">
                          Loading QR…
                        </span>
                      </div>
                    ) : qrImage ? (
                      // New API: render the data-URI PNG directly
                      <img
                        src={qrImage}
                        alt="2FA QR code"
                        className="h-48 w-48"
                        draggable={false}
                      />
                    ) : (
                      // Legacy API: render via qr-code-styling from otpauth URL
                      <div ref={qrRef} />
                    )}
                  </div>

                  {/* Secret Key Input + Info */}
                  <div className="space-y-2">
                    <div className="relative">
                      <InputField
                        label="Your secret key"
                        type={showSecret ? "text" : "password"}
                        value={secret}
                        readOnly
                        onFocus={(e) => e.target.select()}
                        className="w-full pr-16"
                      />

                      {/* icon container */}
                      <div className="absolute right-4 bottom-3 flex items-center space-x-3">
                        <button
                          type="button"
                          aria-label={
                            showSecret ? "Hide secret" : "Show secret"
                          }
                          className="text-white/60 hover:text-white"
                          onClick={() => setShowSecret((s) => !s)}
                        >
                          {showSecret ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        <button
                          type="button"
                          aria-label="Copy secret"
                          className="text-white/60 hover:text-white"
                          onClick={copySecretToClipboard}
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>

                    <p className="flex items-start gap-2 text-xs text-[var(--secondary-text)]">
                      <Info size={16} />
                      Write down this code, never reveal it to others. You can
                      use it to regain access to your account if there is no
                      access to the authenticator app.
                    </p>
                  </div>
                </>
              )}

              {/* Auth code input */}
              <InputField
                label="Authentication code*"
                placeholder="Enter code"
                inputMode="numeric"
                value={code}
                maxLength={6}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                }}
                className="mb-6"
              />

              {/* Action button */}
              <Button
                fullWidth
                loading={loading}
                label={enabled ? "Disable" : "Enable"}
                variant={enabled ? undefined : "signup"}
                className={enabled ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={handleAction}
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
