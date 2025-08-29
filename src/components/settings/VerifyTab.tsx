"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { parseApiError } from "@/utils/parseApiError";
import Button from "../form/Button";
import { Card, Header } from "./shared";
import userSettingsApi from "@/services/userSettings";
import { apiClient, type User } from "@/services/api";

const COOLDOWN_KEY = "verifyEmailCooldownUntil";
/** KYC finite states */
type KycState = "not_started" | "pending" | "verified" | "rejected";

/** NEW – matches /user-settings/verification/status */
type VerificationStatusData = {
  currentStep?: "email" | "basic_info" | "identity" | "address";
  emailVerified?: boolean;
  basicInfoStatus?: KycState;
  identityStatus?: KycState;
  addressStatus?: KycState;
  completedSteps?: string[];
  nextStep?: "email" | "basic_info" | "identity" | "address";
  canProceed?: boolean;
  profile?: {
    country?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    occupation?: string;
  };
};
type VerificationStatusResp = {
  success?: boolean;
  data?: VerificationStatusData | null;
};

/** NEW – matches /user-settings/verification/requirements (sections object) */
type RequirementsSections = {
  email?: { required?: boolean; description?: string; fields?: any[] };
  basic_info?: { required?: boolean; description?: string; fields?: any[] };
  identity?: { required?: boolean; description?: string; fields?: any[] };
  address?: { required?: boolean; description?: string; fields?: any[] };
};

type RequirementItem = { level: string; items: string[] };

type RequirementsResp = { success?: boolean; data?: RequirementItem[] | null };

type HistoryItem = {
  step: string;
  description: string;
  completedAt: string;
  submittedAt: string;
};
type HistoryResp = { success?: boolean; data?: HistoryItem[] | null };

/** Chip states for the UI */
type ChipState = "Completed" | "Requested" | "Incomplete";

export default function VerifyTab() {
  const qc = useQueryClient();
  // local cooldown state
  const [cooldownUntil, setCooldownUntil] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = Number(localStorage.getItem(COOLDOWN_KEY));
    return Number.isFinite(saved) ? saved : 0;
  });
  const [now, setNow] = useState<number>(() => Date.now());

  // derive seconds left + whether we’re cooling down
  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const onCooldown = secondsLeft > 0;

  useEffect(() => {
    if (!onCooldown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [onCooldown]);

  useEffect(() => {
    if (cooldownUntil > Date.now()) {
      localStorage.setItem(COOLDOWN_KEY, String(cooldownUntil));
    } else {
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }, [cooldownUntil]);

  /** Email verification (boolean; NEW endpoint) */
  const emailQ = useQuery<boolean>({
    queryKey: ["verify", "email"],
    queryFn: async () => {
      const res: any = await userSettingsApi.getEmailVerificationStatus();
      const d = res?.data ?? res;
      return Boolean(d?.emailVerified ?? d?.verified ?? false);
    },
  });

  /** KYC status */
  const statusQ = useQuery<VerificationStatusResp>({
    queryKey: ["verify", "status"],
    queryFn: () =>
      userSettingsApi.getVerificationStatus() as Promise<VerificationStatusResp>,
  });

  /** Requirements */
  const requirementsQ = useQuery<RequirementsResp>({
    queryKey: ["verify", "requirements"],
    queryFn: () =>
      userSettingsApi.getVerificationRequirements() as Promise<RequirementsResp>,
  });

  const rawReqs = (requirementsQ.data?.data ??
    null) as RequirementsSections | null;

  /** History */
  const historyQ = useQuery<HistoryResp>({
    queryKey: ["verify", "history"],
    queryFn: () =>
      userSettingsApi.getVerificationHistory() as Promise<HistoryResp>,
  });

  // profile (for email)
  const meQ = useQuery<User>({
    queryKey: ["me"],
    queryFn: () => apiClient.myProfile(),
  });

  const emailVerified = emailQ.data === true;

  // ---- Normalize step statuses using nextStep so "pending" for the next actionable step
  // behaves as "not_started" (i.e., clickable "Verify Now")
  const nextStep = statusQ.data?.data?.nextStep;

  const basicRaw = (statusQ.data?.data?.basicInfoStatus ??
    "not_started") as KycState;
  const identityRaw = (statusQ.data?.data?.identityStatus ??
    "not_started") as KycState;
  const addressRaw = (statusQ.data?.data?.addressStatus ??
    "not_started") as KycState;

  const normalizeStep = (
    raw: KycState,
    step: "basic_info" | "identity" | "address"
  ): KycState => {
    if (raw === "pending" && nextStep === step) return "not_started";
    return raw;
  };

  const basicInfo = normalizeStep(basicRaw, "basic_info");
  const identity = normalizeStep(identityRaw, "identity");
  const address = normalizeStep(addressRaw, "address");

  // Derive gated/effective states for the UI
  const basicEff: KycState = emailVerified ? basicInfo : "not_started";

  const identityEff: KycState =
    emailVerified && basicEff === "verified" ? identity : "not_started";

  const addressEff: KycState =
    emailVerified && basicEff === "verified" && identityEff === "verified"
      ? address
      : "not_started";

  // Prefill for the Basic Info modal (if backend sent saved profile)
  const initialBasicValues = useMemo(() => {
    const p = statusQ.data?.data?.profile;
    if (!p) return null;
    return {
      country: p.country ?? "",
      firstName: p.firstName ?? "",
      lastName: p.lastName ?? "",
      dateOfBirth: p.dateOfBirth ?? "", // "YYYY-MM-DD"
      occupation: p.occupation ?? "",
    };
  }, [statusQ.data]);

  const resend = useMutation({
    mutationFn: async () => {
      const email = meQ.data?.email ?? (await apiClient.myProfile()).email;
      await userSettingsApi.resendEmailVerification(email);
    },
    onSuccess: () => {
      toast.success("Verification email sent.");
      setCooldownUntil(Date.now() + 60_000); // 60s
    },
    onError: (err) => {
      const { message } = parseApiError(err);
      toast.error(message || "Failed to send verification email");
      setCooldownUntil(Date.now() + 15_000); // 15s fallback
    },
  });

  const [showBasic, setShowBasic] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);

  useEffect(() => {
    // auto-open Email modal if ?token=
    const search = typeof window !== "undefined" ? window.location.search : "";
    if (search && new URLSearchParams(search).get("token")) {
      setShowEmailModal(true);
    }
  }, []);

  const reqs = useMemo<RequirementItem[]>(() => {
    const r = rawReqs || {};
    const build = (
      label: string,
      sec?: { description?: string; fields?: any[] }
    ): RequirementItem | null => {
      if (!sec) return null;
      const items: string[] = [];
      if (sec.description) items.push(sec.description);
      if (Array.isArray(sec.fields))
        items.push(...sec.fields.map((f) => f?.name).filter(Boolean));
      return { level: label, items };
    };
    return [
      build("Email", r.email),
      build("Basic Info", r.basic_info),
      build("Identity", r.identity),
      build("Address", r.address),
    ].filter(Boolean) as RequirementItem[];
  }, [rawReqs]);

  const hist = useMemo<HistoryItem[]>(
    () => historyQ.data?.data ?? [],
    [historyQ.data]
  );

  // Chips
  const emailChip: ChipState = emailVerified ? "Completed" : "Requested";
  const basicChip: ChipState =
    basicEff === "verified"
      ? "Completed"
      : emailVerified
      ? "Requested"
      : "Incomplete";
  const identityChip: ChipState =
    identityEff === "verified"
      ? "Completed"
      : emailVerified && basicEff === "verified"
      ? "Requested"
      : "Incomplete";
  const addressChip: ChipState =
    addressEff === "verified"
      ? "Completed"
      : emailVerified && basicEff === "verified" && identityEff === "verified"
      ? "Requested"
      : "Incomplete";

  // Buttons: disabled
  const basicBtnDisabled = !emailVerified || basicEff === "pending";
  const identityBtnDisabled =
    !(emailVerified && basicEff === "verified") || identityEff === "pending";
  const addressBtnDisabled =
    !(emailVerified && basicEff === "verified" && identityEff === "verified") ||
    addressEff === "pending";

  // Buttons: labels
  const basicLabel =
    basicEff === "pending"
      ? "Submitted — Pending"
      : basicEff === "verified"
      ? "View and Update"
      : "Verify Now";

  const identityLabel =
    identityEff === "pending"
      ? "Submitted — Pending"
      : identityEff === "verified"
      ? "View"
      : "Verify Now";

  const addressLabel =
    addressEff === "pending"
      ? "Submitted — Pending"
      : addressEff === "verified"
      ? "View"
      : "Verify Now";

  return (
    <section className="space-y-2">
      <Header
        title="Account verification"
        subtitle="Verify your account to gain full access"
      />

      {/* L1 Email */}
      <Card className="flex items-center justify-between gap-4 flex-wrap py-[20px]">
        <div className="flex items-center gap-3 ">
          <StatusIcon ok={emailVerified} />
          <div>
            <div className="flex items-center gap-3 ">
              <p className="font-medium leading-none">L1: Email Verification</p>
              <Chip type={emailChip} />
            </div>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              {emailVerified
                ? "Your email is verified."
                : "Confirm your email address to secure your account."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!emailVerified ? (
            <>
              <Button
                label={
                  resend.isPending
                    ? "Sending..."
                    : onCooldown
                    ? `Try again in ${secondsLeft}s`
                    : "Resend Email"
                }
                padding="px-4 py-3"
                disabled={resend.isPending || onCooldown || meQ.isLoading}
                onClick={() => resend.mutate()}
              />

              <Button
                label="Enter Code"
                padding="px-4 py-3"
                variant="login"
                onClick={() => setShowEmailModal(true)}
              />
            </>
          ) : (
            <span className="rounded-full bg-[var(--surface-l3)] px-3 py-2 text-sm text-[#C0FF03]">
              Completed
            </span>
          )}
        </div>
      </Card>

      {/* L2 Basic info */}
      <Card className="flex items-center justify-between gap-4 flex-wrap py-[20px]">
        <div className="flex items-center gap-3">
          <StatusIcon
            ok={basicEff === "verified"}
            pending={basicEff === "pending"}
          />
          <div>
            <div className="flex items-center gap-3">
              <p className="font-medium leading-none">L2: Basic Information</p>
              <Chip type={basicChip} />
            </div>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              Fill in your details for us to get to know you better.
            </p>
          </div>
        </div>
        <Button
          label={basicLabel}
          padding="px-4 py-3"
          variant={basicEff === "verified" ? "login" : undefined}
          onClick={() => (basicBtnDisabled ? null : setShowBasic(true))}
          disabled={basicBtnDisabled}
        />
      </Card>

      {/* L3 Identity */}
      <Card className="flex items-center justify-between gap-4 flex-wrap py-[20px]">
        <div className="flex items-center gap-3">
          <StatusIcon
            ok={identityEff === "verified"}
            pending={identityEff === "pending"}
          />
          <div>
            <div className="flex items-center gap-3">
              <p className="font-medium leading-none">
                L3: Identity Verification
              </p>
              <Chip type={identityChip} />
            </div>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              Upload a copy of your ID
            </p>
          </div>
        </div>
        <Button
          label={identityLabel}
          padding="px-4 py-3"
          onClick={() => (identityBtnDisabled ? null : setShowIdentity(true))}
          disabled={identityBtnDisabled}
        />
      </Card>

      {/* L4 Proof of Address */}
      {/* <Card className="flex items-center justify-between gap-4 flex-wrap py-[20px]">
        <div className="flex items-center gap-3">
          <StatusIcon
            ok={addressEff === "verified"}
            pending={addressEff === "pending"}
          />
          <div>
            <div className="flex items-center gap-3">
              <p className="font-medium leading-none">L4: Proof of Address</p>
              <Chip type={addressChip} />
            </div>
            <p className="mt-1 text-sm text-[var(--secondary-text)]">
              Upload your Proof of Address supporting documents
            </p>
          </div>
        </div>
        <Button
          label={addressLabel}
          padding="px-4 py-3"
          onClick={() => {
          }}
          disabled={addressBtnDisabled}
        />
      </Card> */}

      {/* Requirements */}
      {reqs.length > 0 ? (
        <Card className="mt-6 p-4">
          <p className="mb-2 text-sm font-medium opacity-80">Requirements</p>
          <div className="grid gap-3 md:grid-cols-2">
            {reqs.map((r, i) => (
              <div
                key={`${r.level}-${i}`}
                className="rounded-xl border border-white/10 p-3"
              >
                <p className="text-sm font-semibold">{r.level}</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-[var(--secondary-text)]">
                  {r.items.map((it, k) => (
                    <li key={`${i}-${k}`}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* History */}
      {hist.length > 0 ? (
        <Card className="mt-4 p-4">
          <p className="mb-2 text-sm font-medium opacity-80">
            Verification history
          </p>
          <div className="space-y-2">
            {hist.map((h, i) => (
              <div
                key={`${h.description}-${i}`}
                className="flex items-center justify-between rounded-lg bg-[var(--surface-l3)] px-3 py-2 text-sm"
              >
                <span className="opacity-80">{h.description}</span>
                <span className="opacity-60">
                  {new Date(h.completedAt || h.submittedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Help */}
      <Card className="mt-8 flex items-center justify-between gap-4 flex-wrap py-[20px]">
        <div>
          <p className="text-base font-medium leading-none">Need Help?</p>
          <p className="mt-2 text-sm text-[var(--secondary-text)]">
            Have questions or concerns regarding your Bluff account? Our experts
            are here to help!
          </p>
        </div>
        <Button label="Chat with us" padding="px-4 py-3" />
      </Card>

      {/* Modals */}
      <BasicInfoModalWrapper
        open={showBasic}
        onClose={() => setShowBasic(false)}
        initialValues={initialBasicValues}
        onSubmitted={(msg?: string) => {
          setShowBasic(false);
          qc.invalidateQueries({ queryKey: ["verify", "status"] });
          qc.invalidateQueries({ queryKey: ["verify", "history"] });
          toast.success(
            msg ||
              "Basic information submitted and approved! You can now proceed to identity verification."
          );
        }}
      />
      <IdentityModalWrapper
        open={showIdentity}
        onClose={() => setShowIdentity(false)}
        onSubmitted={(msg?: string) => {
          setShowIdentity(false);
          qc.invalidateQueries({ queryKey: ["verify", "status"] });
          qc.invalidateQueries({ queryKey: ["verify", "history"] });
          toast.success(
            msg || "Identity submitted. We’ll notify you when it’s approved."
          );
        }}
      />
      <EmailVerifyModalWrapper
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onVerified={() => {
          setShowEmailModal(false);
          qc.invalidateQueries({ queryKey: ["verify", "email"] });
          qc.invalidateQueries({ queryKey: ["verify", "status"] }); // refresh step gating
          toast.success("Your email has been verified. You can continue.");
        }}
      />
    </section>
  );
}

/* ── Small helpers/components ─────────────────────────────────────────────── */

function StatusIcon({ ok, pending }: { ok?: boolean; pending?: boolean }) {
  const fill = ok ? "#C0FF03" : pending ? "#F5A524" : "#626273";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12ZM15.6103 10.1859C15.8511 9.84887 15.773 9.38046 15.4359 9.1397C15.0989 8.89894 14.6305 8.97701 14.3897 9.31407L11.1543 13.8436L9.53033 12.2197C9.23744 11.9268 8.76256 11.9268 8.46967 12.2197C8.17678 12.5126 8.17678 12.9874 8.46967 13.2803L10.7197 15.5303C10.8756 15.6862 11.0921 15.7656 11.3119 15.7474C11.5316 15.7293 11.7322 15.6153 11.8603 15.4359L15.6103 10.1859Z"
        fill={fill}
      />
    </svg>
  );
}

function Chip({ type }: { type: ChipState }) {
  const cls =
    type === "Completed"
      ? "bg-[#C0FF03]/15 text-[#C0FF03]"
      : type === "Requested"
      ? "bg-amber-500/15 text-amber-300"
      : "bg-white/10 text-white/60";
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}

/* Dynamic imports with explicit prop typing to satisfy strict TS */
type BasicInfoModalProps = {
  open: boolean;
  onClose: () => void;
  initialValues?: {
    country?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    occupation?: string;
  } | null;
  onSubmitted?: (message?: string) => void;
};

type IdentityModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (message?: string) => void;
  initialValues?: {
    documentType?: string;
    documentNumber?: string;
    documentUrl?: string;
  } | null;
};

type EmailVerifyModalProps = {
  open: boolean;
  onClose: () => void;
  onVerified?: () => void;
};

const BasicInfoModalWrapper = dynamic(
  () => import("./verification/BasicInfoModal"),
  { ssr: false }
) as React.ComponentType<BasicInfoModalProps>;

const IdentityModalWrapper = dynamic(
  () => import("./verification/IdentityModal"),
  { ssr: false }
) as React.ComponentType<IdentityModalProps>;

const EmailVerifyModalWrapper = dynamic(
  () => import("./verification/EmailVerifyModal"),
  { ssr: false }
) as React.ComponentType<EmailVerifyModalProps>;
