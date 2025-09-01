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

  /** Attach native listeners so password managers & Chrome strong password always sync
   * Re-runs whenever the concrete element instance (ref.current) changes.
   */
  function useNativeSync(
    ref: React.RefObject<HTMLInputElement | null>,
    setter: (v: string) => void
  ) {
    const el = ref.current; // capture current element for stable deps
    useEffect(() => {
      if (!el) return;

      const sync = () => setter(el.value);
      const blurSync = () => setTimeout(() => setter(el.value), 150);

      el.addEventListener("input", sync);
      el.addEventListener("change", sync);
      el.addEventListener("blur", blurSync);

      return () => {
        el.removeEventListener("input", sync);
        el.removeEventListener("change", sync);
        el.removeEventListener("blur", blurSync);
      };
    }, [el, setter]);
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

    // helper for 2FA error narrowing
    const isTwoFAError = (
      e: unknown
    ): e is {
      __twoFARequired: true;
      userId?: string | null;
      twoFactorMethod?: string | null;
    } => {
      if (typeof e !== "object" || e === null) return false;
      const rec = e as Record<string, unknown>;
      return rec.__twoFARequired === true;
    };

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
      } catch (err: unknown) {
        if (isTwoFAError(err)) {
          setTwoFAUserId(err.userId ?? null);
          setTwoFAMethod(err.twoFactorMethod ?? "authenticator");
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
            width="106"
            height="20"
            viewBox="0 0 106 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.26398 19.6154L0 0.384033H4.80798L9.06626 14.5326L13.3245 0.384033H18.1325L11.8685 19.6154H6.26398Z"
              fill="#4264FF"
            />
            <path
              d="M19.7805 0.384583H24.176V19.616H19.7805V0.384583Z"
              fill="#4264FF"
            />
            <path
              d="M33.9291 20C31.9693 20 30.3345 19.5743 29.0251 18.7223C27.7153 17.8709 26.7863 16.7124 26.2366 15.2469L30.028 13.0492C30.7971 14.8259 32.1434 15.7143 34.0663 15.7143C35.8061 15.7143 36.676 15.1925 36.676 14.1486C36.676 13.5809 36.3964 13.1367 35.8383 12.816C35.2796 12.4958 34.2309 12.1249 32.6926 11.7034C31.8865 11.4834 31.1817 11.2365 30.5772 10.9617C29.9726 10.6869 29.3823 10.3255 28.8051 9.87655C28.228 9.42815 27.7886 8.86474 27.4863 8.18685C27.184 7.50949 27.0331 6.73085 27.0331 5.85144C27.0331 4.07523 27.6694 2.65562 28.9423 1.59316C30.2153 0.531231 31.7309 0 33.4892 0C35.0644 0 36.456 0.37086 37.6651 1.11258C38.8737 1.8543 39.8259 2.93047 40.5223 4.34058L36.8132 6.51087C36.465 5.77864 36.0345 5.2242 35.5218 4.84859C35.009 4.47352 34.3311 4.28519 33.4886 4.28519C32.8292 4.28519 32.3212 4.42709 31.964 4.71091C31.6069 4.99525 31.4281 5.33868 31.4281 5.74119C31.4281 6.21756 31.6523 6.62956 32.1012 6.97774C32.5496 7.32591 33.4791 7.71049 34.8898 8.13146C35.6589 8.36991 36.254 8.56193 36.6755 8.70859C37.0964 8.85524 37.6324 9.09791 38.2829 9.43659C38.9328 9.7758 39.4271 10.1329 39.7663 10.508C40.105 10.8836 40.4073 11.3779 40.6732 11.9915C40.9385 12.6055 41.0714 13.3061 41.0714 14.0932C41.0714 15.9248 40.412 17.3671 39.0932 18.42C37.7743 19.4735 36.0525 19.9995 33.9281 19.9995L33.9291 20Z"
              fill="#4264FF"
            />
            <path
              d="M55.2204 19.6154L54.2587 16.5931H47.1159L46.1542 19.6154H41.3462L47.885 0.384033H53.4896L60.0284 19.6154H55.2204ZM48.4347 12.4726H52.9404L50.6878 5.41199L48.4352 12.4726H48.4347Z"
              fill="#4264FF"
            />
            <path
              d="M73.5999 9.64284C75.1751 10.6504 75.9628 12.0975 75.9628 13.9834C75.9628 15.6504 75.3672 17.0057 74.177 18.0497C72.9864 19.0937 71.5119 19.6154 69.7537 19.6154H61.6765V0.384033H69.2039C70.9253 0.384033 72.3676 0.892053 73.5308 1.90862C74.6935 2.92518 75.2754 4.24877 75.2754 5.87834C75.2754 7.41664 74.7162 8.67165 73.5994 9.64231L73.5999 9.64284ZM69.2045 4.50516H66.0725V7.91199H69.2045C69.6988 7.91199 70.1018 7.75162 70.4131 7.43141C70.7243 7.11119 70.8799 6.70341 70.8799 6.2091C70.8799 5.7148 70.7243 5.30701 70.4131 4.98627C70.1013 4.66606 69.6988 4.50568 69.2045 4.50568V4.50516ZM69.7537 15.4948C70.3033 15.4948 70.7428 15.3255 71.0725 14.9868C71.4022 14.6481 71.5668 14.2039 71.5668 13.6542C71.5668 13.1045 71.4022 12.6609 71.0725 12.3217C70.7428 11.983 70.3033 11.8137 69.7537 11.8137H66.0725V15.4948H69.7537Z"
              fill="white"
            />
            <path
              d="M82.5558 15.3846H90.2484V19.6154H78.1604V0.384033H90.1112V4.61488H82.5564V7.80174H89.4244V11.9777H82.5564V15.3846H82.5558Z"
              fill="white"
            />
            <path
              d="M105.634 0.384583V4.61543H100.688V19.616H96.293V4.61543H91.3479V0.384583H105.634H105.634Z"
              fill="white"
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
