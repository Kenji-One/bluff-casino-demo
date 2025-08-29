// src/components/auth/RegisterLoginModal.tsx
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";
import InputField from "../form/InputField";
import Button from "../form/Button";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/api";
import toast from "react-hot-toast";
import clsx from "clsx";
import { parseApiError } from "@/utils/parseApiError";
import PasswordRules from "../auth/PasswordRules";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

type AuthMode = "register" | "login" | "forgot" | "reset" | "twofa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "reset";
}

export default function RegisterLoginModal({
  isOpen,
  onClose,
  initialMode = "register",
}: Props) {
  const { login, register, loading, refreshUser } = useAuth();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // ---------- mode ----------
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const initialToken =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;
  const [resetToken, setResetToken] = useState<string | null>(initialToken);

  useEffect(() => {
    const tokenFromHook =
      searchParams?.get("token") ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null);

    if (tokenFromHook) {
      if (mode !== "reset") setMode("reset");
      setResetToken(tokenFromHook);
    } else if (isOpen) {
      setMode(initialMode);
      setResetToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMode, searchParams]);

  // ---------- errors ----------
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => {
    setFieldErrors({});
    setFormError(null);
  }, [mode]);

  // ---------- fields ----------
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");

  // controlled values for validation/UI; we’ll keep them synced from DOM
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdFocused, setPwdFocused] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  // 🔐 2FA step state
  const [twoFAUserId, setTwoFAUserId] = useState<string | null>(null);
  const [twoFAMethod, setTwoFAMethod] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState("");

  const [resending, setResending] = useState(false);

  useEffect(() => {
    const m = (twoFAMethod ?? "").toLowerCase();
    if (mode === "twofa" && m === "email") {
      apiClient.sendLoginTwoFactorCode(twoFAUserId).catch(() => {});
    }
  }, [mode, twoFAMethod, twoFAUserId]);

  // refs for password inputs
  const loginPwdRef = useRef<HTMLInputElement | null>(null);
  const registerPwdRef = useRef<HTMLInputElement | null>(null);
  const resetPwdRef = useRef<HTMLInputElement | null>(null);
  const resetConfirmRef = useRef<HTMLInputElement | null>(null);

  /** Attach native listeners so password managers & Chrome strong password always sync */
  function useNativeSync(
    ref: React.RefObject<HTMLInputElement | null>,
    setter: (v: string) => void
  ) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const sync = () => setter(el.value);
      el.addEventListener("input", sync);
      el.addEventListener("change", sync);

      // Chrome sometimes applies the generated password on blur without firing input/change
      const blurSync = () => setTimeout(() => setter(el.value), 150);
      el.addEventListener("blur", blurSync);

      return () => {
        el.removeEventListener("input", sync);
        el.removeEventListener("change", sync);
        el.removeEventListener("blur", blurSync);
      };
    }, [ref, setter, mode]);
  }

  // bind sync for current mode’s fields
  useNativeSync(loginPwdRef, setPassword);
  useNativeSync(registerPwdRef, setPassword);
  useNativeSync(resetPwdRef, setPassword);
  useNativeSync(resetConfirmRef, setConfirmPassword);

  // blur handler for rules UI (delayed so Chrome can write)
  const handlePwdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    setTimeout(() => {
      setPwdFocused(false);
      setPwdTouched(true);
      setPassword(el.value);
    }, 150);
  };

  // ---------- show/hide states ----------
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showRegisterPwd, setShowRegisterPwd] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ---------- validation ----------
  const canSubmit = (() => {
    switch (mode) {
      case "login":
        return Boolean(identifier.trim() && password.trim());
      case "register":
        return Boolean(
          username.trim() && email.trim() && password.trim() && agreeTerms
        );
      case "forgot":
        return Boolean(email.trim());
      case "reset":
        return Boolean(
          resetToken &&
            password.trim() &&
            confirmPassword.trim() &&
            password === confirmPassword
        );
      case "twofa":
        // Only need a valid 6-digit code; identifier/password are carried from step 1
        return Boolean(twoFACode.trim().length >= 6);
    }
  })();

  // ---------- submit ----------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    // final read (in case manager filled right before submit)
    if (mode === "login") setPassword(loginPwdRef.current?.value ?? password);
    if (mode === "register")
      setPassword(registerPwdRef.current?.value ?? password);
    if (mode === "reset") {
      setPassword(resetPwdRef.current?.value ?? password);
      setConfirmPassword(resetConfirmRef.current?.value ?? confirmPassword);
    }

    // FORGOT
    if (mode === "forgot") {
      try {
        setForgotLoading(true);
        setForgotMsg(null);
        await apiClient.forgotPassword(email.trim());
        setForgotMsg("We sent a reset link to your e-mail.");
        toast.success("Reset link sent. Check your e-mail.");
      } catch (err: unknown) {
        const { message } = parseApiError(err);
        toast.error(message || "Unable to send reset link");
      } finally {
        setForgotLoading(false);
      }
      return;
    }

    // RESET
    if (mode === "reset") {
      const token = resetToken;
      if (!token) {
        setFormError("Invalid or missing reset token.");
        return;
      }
      try {
        setResetLoading(true);
        await apiClient.resetPassword(
          token,
          resetPwdRef.current?.value || password,
          resetConfirmRef.current?.value || confirmPassword
        );
        toast.success("Password reset! You can now log in.");
        try {
          router.replace("/");
        } catch {}
        setResetToken(null);
        setPassword("");
        setConfirmPassword("");
        setMode("login");
      } catch (err: unknown) {
        const { message, fieldErrors } = parseApiError(err);
        setFieldErrors(fieldErrors ?? {});
        setFormError(message || "Unable to reset password");
      } finally {
        setResetLoading(false);
      }
      return;
    }

    // REGISTER
    if (mode === "register") {
      try {
        await register(
          username,
          email,
          registerPwdRef.current?.value || password,
          agreeTerms,
          referralCode
        );
        toast.success("Account created! You can log in now.");
        setMode("login");
      } catch (err: unknown) {
        const { message, fieldErrors } = parseApiError(err);
        setFieldErrors(fieldErrors ?? {});
        setFormError(message);
      }
      return;
    }

    // 2FA VERIFY – Re-hit /auth/login including twoFactorCode
    if (mode === "twofa") {
      try {
        if (!identifier || !(loginPwdRef.current?.value || password)) {
          setFormError("Missing credentials. Please try again.");
          setMode("login");
          return;
        }

        await login(
          identifier,
          loginPwdRef.current?.value || password,
          twoFACode.trim()
        );

        await refreshUser(); // <- make sure context has the logged-in user
        toast.success("Logged in");
        onClose();
      } catch (err: unknown) {
        const { message } = parseApiError(err);
        setFormError(message || "Invalid 2FA code");
      }
      return;
    }

    // LOGIN
    if (mode === "login") {
      try {
        await login(identifier, loginPwdRef.current?.value || password);
        onClose();
      } catch (err: any) {
        // 👇 special case: backend requires 2FA
        if (err && (err as any).__twoFARequired) {
          setTwoFAUserId((err as any).userId || null);
          setTwoFAMethod((err as any).twoFactorMethod || "authenticator");
          setTwoFACode("");
          setMode("twofa");
          setFormError(null);
          return;
        }
        const { message } = parseApiError(err);
        setFormError(message || "Login failed");
      }
    }
  }

  // ---------- reset everything on close ----------
  const handleClose = () => {
    onClose();
    setForgotLoading(false);
    setResetLoading(false);
    setForgotMsg(null);
    setUsername("");
    setIdentifier("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAgreeTerms(false);
    setReferralCode("");
    setFieldErrors({});
    setFormError(null);
    setTwoFAUserId(null);
    setTwoFAMethod(null);
    setTwoFACode("");
    if (resetToken) {
      setResetToken(null);
      try {
        router.replace(pathname);
      } catch {}
    }
  };

  /* ------------------------------------------------------------------ */
  /*                          OTP DOTS (2FA) UI                         */
  /* ------------------------------------------------------------------ */
  const hiddenOtpRef = useRef<HTMLInputElement | null>(null);

  const focusHiddenOtp = () => {
    hiddenOtpRef.current?.focus();
  };

  const sanitizeDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const handleOtpInput = (val: string) => {
    const clean = sanitizeDigits(val);
    setTwoFACode(clean);
  };

  // ---------- UI ----------
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-[var(--color-popup-background)]"
        aria-hidden="true"
      />
      <DialogPanel
        className={clsx(
          mode === "forgot" || mode === "reset"
            ? "lg:min-h-[674px]"
            : "lg:min-h-[787px]",
          "relative flex w-full max-w-[487px] lg:max-w-[960px] overflow-hidden rounded-2xl bg-black text-white"
        )}
      >
        {/* Left visual */}
        <div className="hidden lg:flex w-1/2 relative">
          <Image
            src="/images/Frame-3.svg"
            alt=""
            fill
            className="object-cover"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/Ua1l7wAAAAASUVORK5CYII="
            priority
          />

          <svg
            className="absolute top-[42px] left-1/2 -translate-x-1/2"
            width="175"
            height="32"
            viewBox="0 0 175 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.8792 31.3005H4.13329L0 0.699452H9.00623L10.442 21.0273L19.0132 0.699452H28.7155L13.8792 31.3005Z"
              fill="white"
            />
            <path
              d="M24.2189 31.3005L29.5704 0.699452H38.2721L32.9205 31.3005H24.2189Z"
              fill="white"
            />
            <path
              d="M47.3235 32C44.0749 32 41.4209 31.3443 39.3615 30.0328C37.3311 28.6922 35.9533 26.7832 35.2282 24.306L42.7551 20.4153C43.6833 22.7468 45.4526 23.9126 48.0631 23.9126C50.1225 23.9126 51.2538 23.3734 51.4568 22.2951C51.5728 21.5956 51.2102 21.0565 50.3691 20.6776C49.905 20.4444 49.4989 20.2696 49.1508 20.153C48.7738 20.0073 47.7151 19.6721 45.9747 19.1475C40.5797 17.2823 38.3028 13.9308 39.1439 9.0929C39.608 6.38251 40.9423 4.18215 43.1467 2.4918C45.3221 0.830601 47.9761 0 51.1087 0C53.7192 0 55.9527 0.612022 57.809 1.83607C59.6654 3.06011 61.0721 4.82331 62.0293 7.12568L54.6764 11.0601C53.9223 9.07832 52.5445 8.08743 50.5431 8.08743C49.0058 8.08743 48.1357 8.61202 47.9326 9.6612C47.7876 10.3315 48.0486 10.8561 48.7158 11.235C49.4699 11.7013 50.7752 12.2404 52.6315 12.8525C55.039 13.6685 56.9098 14.674 58.2441 15.8689C59.9844 17.4135 60.5935 19.7887 60.0714 22.9945C59.5494 25.9381 58.1861 28.1821 55.9817 29.7268C53.7772 31.2423 50.8912 32 47.3235 32Z"
              fill="white"
            />
            <path
              d="M114.597 9.74863C114.075 12.4007 112.697 14.4117 110.463 15.7814C112.755 17.3843 113.668 19.7013 113.204 22.7322C112.827 25.326 111.551 27.4098 109.376 28.9836C107.229 30.5282 104.474 31.3005 101.109 31.3005H88.2305L93.5821 0.699452H105.242C108.549 0.699452 111.058 1.5592 112.769 3.27869C114.452 4.96903 115.061 7.12568 114.597 9.74863ZM103.85 8.21858H100.978L100.239 12.3279L103.589 12.2842C104.865 12.1093 105.605 11.439 105.808 10.2732C105.924 9.57377 105.793 9.06375 105.416 8.74317C105.039 8.39344 104.517 8.21858 103.85 8.21858ZM104.72 21.5956C104.923 20.3424 104.43 19.6284 103.241 19.4536L99.0206 19.4098L98.2375 23.7814H101.892C102.617 23.7814 103.226 23.592 103.72 23.2131C104.242 22.8051 104.575 22.2659 104.72 21.5956Z"
              fill="#4264FF"
            />
            <path
              d="M138.851 0.699452L137.459 8.65574H126.364L125.799 11.9781H135.806L134.413 19.847H124.406L123.797 23.2568H135.109L133.717 31.3005H113.703L119.055 0.699452H138.851Z"
              fill="#4264FF"
            />
            <path
              d="M139.941 0.699452H163L161.521 9.18033H154.342L150.47 31.3005H141.768L145.64 9.18033H138.461L139.941 0.699452Z"
              fill="#4264FF"
            />
            <path
              d="M170 4.80001V1.20001H171.25L172.5 2.40001L173.75 1.20001H175V4.80001H173.75V2.40001L172.5 3.60001L171.25 2.40001V4.80001M166.25 4.80001V2.40001H165V1.20001H168.75V2.40001H167.5V4.80001"
              fill="#4264FF"
            />
          </svg>
          <p className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-[10px] text-center text-white max-w-3xs">
            By accessing the site, I attest that I am at least 18 years old and
            have read the Terms and Conditions
          </p>
        </div>

        {/* Right (forms) */}
        <div
          className={clsx(
            (mode === "forgot" || mode === "reset" || mode === "twofa") &&
              "flex flex-col items-center justify-center",
            "w-full lg:w-1/2 p-6 sm:p-10 bg-[var(--color-black)]"
          )}
        >
          {/* Close */}
          <Button
            type="button"
            btntype="nav"
            onClick={handleClose}
            className="absolute top-0 right-0 p-3 text-white/50 hover:text-white"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="white"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          {/* Tabs for register/login (hide on 2FA/forgot/reset) */}
          {(mode === "register" || mode === "login") && (
            <div className="flex relative mb-10 gap-6">
              <Button
                type="button"
                btntype="nav"
                onClick={() => setMode("register")}
                className={clsx(
                  "flex-1 pb-[20px] text-sm font-medium",
                  mode !== "register" && "text-[var(--color-muted)]"
                )}
                label="Register"
              />
              <Button
                type="button"
                btntype="nav"
                onClick={() => setMode("login")}
                className={clsx(
                  "flex-1 pb-[20px] text-sm font-medium",
                  mode !== "login" && "text-[var(--color-muted)]"
                )}
                label="Login"
              />
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-[var(--surface-l3)]">
                <div
                  className={clsx(
                    "h-full absolute bg-[var(--color-brand)] transition-all duration-300",
                    mode === "register" ? "w-1/2 left-0" : "w-1/2 left-1/2"
                  )}
                />
              </div>
            </div>
          )}

          {/* Headings */}
          {mode === "forgot" && (
            <h2 className="mb-8 text-center text-xl font-medium">
              Forgot Password
            </h2>
          )}
          {mode === "reset" && (
            <h2 className="mb-4 text-center text-xl font-medium">
              Reset Password
            </h2>
          )}
          {mode === "twofa" && (
            <div className="mb-6">
              <h2 className="text-center text-xl font-medium">
                Two-Factor Authentication
              </h2>
              <p className="mt-2 text-center text-xs text-[var(--secondary-text)]">
                {(twoFAMethod ?? "").toLowerCase() === "email"
                  ? "Enter the 6-digit code we sent to your email to complete login."
                  : "Enter the 6-digit code from your authenticator app to complete login."}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 w-full"
            autoComplete="on"
          >
            {mode === "register" && (
              <InputField
                name="username"
                autoComplete="username"
                label="Username*"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={fieldErrors.username}
              />
            )}

            {mode === "login" && (
              <InputField
                name="identifier"
                autoComplete="username"
                label="Username or Email*"
                type="text"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={fieldErrors.username || fieldErrors.email}
              />
            )}

            {(mode === "register" || mode === "forgot") && (
              <InputField
                name="email"
                autoComplete="email"
                label="Email*"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
              />
            )}

            {/* LOGIN password */}
            {mode === "login" && (
              <div>
                <div className="relative">
                  <InputField
                    ref={loginPwdRef}
                    id="login-password"
                    name="current-password"
                    autoComplete="current-password"
                    label="Password*"
                    type={showLoginPwd ? "text" : "password"}
                    placeholder="Enter password"
                    error={fieldErrors.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePwdBlur}
                    onFocus={() => setPwdFocused(true)}
                  />
                  <button
                    type="button"
                    aria-label={
                      showLoginPwd ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowLoginPwd((v) => !v)}
                    className="absolute right-3 top-[26px] z-10 p-1 rounded hover:bg-white/5"
                    tabIndex={-1}
                  >
                    {showLoginPwd ? (
                      /* Eye-off */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.82-3.12 3.17-4.33" />
                        <path d="M22.94 11.94A10.94 10.94 0 0 0 12 4c-1.61 0-3.14.32-4.54.9" />
                        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      /* Eye */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className="flex ml-auto mt-3 text-xs text-[var(--color-brand)] hover:underline cursor-pointer"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* 2FA step */}
            {mode === "twofa" && (
              <>
                {/* Hidden single input that captures the digits (NOT password) */}
                <input
                  ref={hiddenOtpRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => handleOtpInput(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    handleOtpInput(pasted);
                    e.preventDefault();
                  }}
                  className="sr-only"
                  aria-label="Two-factor authentication code"
                />

                {/* Circles with visible digits; click anywhere to focus */}
                <div
                  className="flex items-center justify-center gap-5 sm:gap-6 mb-3"
                  onClick={focusHiddenOtp}
                  role="group"
                  aria-label="Enter 6-digit code"
                >
                  {Array.from({ length: 6 }).map((_, i) => {
                    const active =
                      i === twoFACode.length && twoFACode.length < 6;
                    const digit = twoFACode[i] ?? "";
                    return (
                      <div
                        key={i}
                        className={clsx(
                          "grid place-items-center rounded-full bg-[var(--surface-l3)]",
                          // perfect circles:
                          "aspect-square h-12 w-12 sm:h-14 sm:w-14",
                          // active ring on next slot:
                          active &&
                            "ring-2 ring-[var(--color-brand)] ring-offset-2 ring-offset-black"
                        )}
                      >
                        {digit ? (
                          <span className="font-semibold text-lg sm:text-xl leading-none select-none">
                            {digit}
                          </span>
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-white/80" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-[11px] text-white/60 hover:underline"
                    onClick={() => {
                      setTwoFAUserId(null);
                      setTwoFAMethod(null);
                      setTwoFACode("");
                      setMode("login");
                    }}
                  >
                    Use a different account
                  </button>

                  {(twoFAMethod ?? "").toLowerCase() === "email" && (
                    <button
                      type="button"
                      disabled={resending}
                      className="text-[11px] text-[var(--color-brand)] hover:underline disabled:opacity-50"
                      onClick={async () => {
                        try {
                          setResending(true);
                          await apiClient.sendLoginTwoFactorCode(twoFAUserId);
                        } finally {
                          setResending(false);
                        }
                      }}
                    >
                      {resending ? "Sending…" : "Resend code"}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* REGISTER password */}
            {mode === "register" && (
              <div className="relative">
                <InputField
                  ref={registerPwdRef}
                  id="register-password"
                  name="new-password"
                  autoComplete="new-password"
                  label="Password*"
                  type={showRegisterPwd ? "text" : "password"}
                  placeholder="Enter password"
                  error={fieldErrors.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handlePwdBlur}
                  onFocus={() => setPwdFocused(true)}
                />
                <button
                  type="button"
                  aria-label={
                    showRegisterPwd ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowRegisterPwd((v) => !v)}
                  className="absolute right-3 top-[26px] z-10 p-1 rounded hover:bg-white/5"
                  tabIndex={-1}
                >
                  {showRegisterPwd ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.82-3.12 3.17-4.33" />
                      <path d="M22.94 11.94A10.94 10.94 0 0 0 12 4c-1.61 0-3.14.32-4.54.9" />
                      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                {(pwdFocused ||
                  (pwdTouched &&
                    !(
                      password.length >= 8 &&
                      password.length <= 24 &&
                      /[A-Za-z]/.test(password) &&
                      /[0-9]/.test(password)
                    ))) && <PasswordRules value={password} />}
              </div>
            )}

            {/* RESET passwords */}
            {mode === "reset" && (
              <>
                <div className="relative">
                  <InputField
                    id="new-password"
                    ref={resetPwdRef}
                    name="new-password"
                    autoComplete="new-password"
                    label="New Password*"
                    type={showResetPwd ? "text" : "password"}
                    placeholder="New password"
                    error={fieldErrors.newPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handlePwdBlur}
                    onFocus={() => setPwdFocused(true)}
                  />
                  <button
                    type="button"
                    aria-label={
                      showResetPwd ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowResetPwd((v) => !v)}
                    className="absolute right-3 top-[26px] z-10 p-1 rounded hover:bg-white/5"
                    tabIndex={-1}
                  >
                    {showResetPwd ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.82-3.12 3.17-4.33" />
                        <path d="M22.94 11.94A10.94 10.94 0 0 0 12 4c-1.61 0-3.14.32-4.54.9" />
                        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {(pwdFocused ||
                    (pwdTouched &&
                      !(
                        password.length >= 8 &&
                        password.length <= 24 &&
                        /[A-Za-z]/.test(password) &&
                        /[0-9]/.test(password)
                      ))) && <PasswordRules value={password} />}
                </div>

                <div className="relative">
                  <InputField
                    id="confirm-password"
                    ref={resetConfirmRef}
                    name="new-password"
                    autoComplete="new-password"
                    label="Confirm Password*"
                    type={showResetConfirm ? "text" : "password"}
                    placeholder="Confirm"
                    error={
                      confirmPassword && confirmPassword !== password
                        ? "Passwords do not match"
                        : fieldErrors.confirmPassword || fieldErrors.newPassword
                    }
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={(e) => {
                      const el = e.currentTarget;
                      setTimeout(() => setConfirmPassword(el.value), 150);
                    }}
                  />
                  <button
                    type="button"
                    aria-label={
                      showResetConfirm ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowResetConfirm((v) => !v)}
                    className="absolute right-3 top-[26px] z-10 p-1 rounded hover:bg-white/5"
                    tabIndex={-1}
                  >
                    {showResetConfirm ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.82-3.12 3.17-4.33" />
                        <path d="M22.94 11.94A10.94 10.94 0 0 0 12 4c-1.61 0-3.14.32-4.54.9" />
                        <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* register → terms + referral */}
            {mode === "register" && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded-lg border-[var(--surface-l3)] accent-[#626273]"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                  />
                  <label htmlFor="terms" className="text-sm font-medium">
                    I agree to Terms & Conditions
                  </label>
                </div>
                <details className="my-4 border-t border-b border-[var(--surface-l3)] py-4">
                  <summary className="flex justify-between cursor-pointer">
                    Referral Code (Optional)
                  </summary>
                  <InputField
                    noLabel
                    placeholder="Enter code"
                    className="mt-2"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </details>
              </>
            )}

            {mode === "forgot" && forgotMsg && (
              <p className="text-center text-sm text-[var(--color-brand)]">
                {forgotMsg}
              </p>
            )}
            {formError && (
              <p className="text-sm text-[var(--color-error)]">{formError}</p>
            )}

            <Button
              type="submit"
              className={clsx(
                "w-full",
                !canSubmit && "pointer-events-none opacity-40"
              )}
              disabled={
                ((mode === "reset" ? resetLoading : loading) ||
                  forgotLoading ||
                  !canSubmit) as boolean
              }
              label={
                {
                  login: loading ? "Loading…" : "Log In",
                  register: loading ? "Loading…" : "Register",
                  forgot: forgotLoading ? "Sending…" : "Send Reset Link",
                  reset: resetLoading ? "Resetting…" : "Reset Password",
                  twofa: loading ? "Verifying…" : "Verify & Log In",
                }[mode]
              }
            />

            {(mode === "forgot" || mode === "reset") && (
              <button
                type="button"
                className="block mx-auto text-xs text-white/60 hover:underline"
                onClick={() => setMode("login")}
              >
                Back to Login
              </button>
            )}
          </form>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
