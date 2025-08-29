// ./src/components/settings/security/ChangePasswordModal.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import InputField from "../../form/InputField";
import Button from "../../form/Button";
import userSettingsApi from "@/services/userSettings";
import toast from "react-hot-toast";

/* ── tiny helpers to avoid `any` in error handling ───────────────────────── */
type FieldName = "currentPassword" | "newPassword" | "confirm";
type ApiFieldError = { path: FieldName; message: string };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isFieldName(v: unknown): v is FieldName {
  return v === "currentPassword" || v === "newPassword" || v === "confirm";
}

/* ──────────────────────────────────────────────────────────────
   Password input with show / hide toggle + inline error support
   ────────────────────────────────────────────────────────────── */
function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <InputField
        label={label}
        placeholder={placeholder}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
        error={error}
      />

      {/* eye icon — chooses anchoring based on error state */}
      <button
        type="button"
        className={`absolute right-4 ${
          error ? "top-1/2 -translate-y-1/2" : "bottom-3"
        } text-white/60 hover:text-white`}
        onClick={() => setShow((s) => !s)}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Change-Password Modal
   ────────────────────────────────────────────────────────────── */
type Props = { open: boolean; onClose: () => void };

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const router = useRouter();
  const { logout } = useAuth(); // clears token & auth state on this device

  /** field-level validation errors from backend */
  const [errs, setErrs] = useState<Partial<Record<keyof typeof form, string>>>(
    {}
  );

  const [loading, setLoading] = useState(false);

  /* ------------ submit handler ------------ */
  const handleSave = async () => {
    setErrs({}); // clear previous

    if (form.newPassword !== form.confirm) {
      setErrs({ confirm: "Passwords do not match" });
      toast.error("Validation failed");
      return;
    }

    setLoading(true);
    try {
      await userSettingsApi.changePassword(
        form.currentPassword,
        form.newPassword,
        form.confirm
      );
      toast.success("Password updated – signing you out…");
      /**
       *  ‣ close the modal so UI doesn’t stay frozen
       *  ‣ log the user out locally
       *  ‣ trigger a hard-refresh to ensure all auth-guarded
       *    pages redirect to the login screen.
       */
      onClose();
      logout();
      router.refresh();
    } catch (e: unknown) {
      // Safely extract backend errors without using `any`
      let apiErrors: ApiFieldError[] | undefined;
      if (isRecord(e)) {
        const resp = e["response"];
        if (isRecord(resp)) {
          const data = resp["data"];
          if (isRecord(data)) {
            const errs = data["errors"];
            if (Array.isArray(errs)) {
              apiErrors = errs
                .map((it): ApiFieldError | null => {
                  const path = isRecord(it) ? it["path"] : undefined;
                  const message = isRecord(it) ? it["message"] : undefined;
                  if (isFieldName(path) && typeof message === "string") {
                    return { path, message };
                  }
                  return null;
                })
                .filter(Boolean) as ApiFieldError[];
            }
          }
        }
      }

      if (apiErrors?.length) {
        const fieldErrs: Partial<Record<keyof typeof form, string>> = {};
        apiErrors.forEach(({ path, message }) => {
          fieldErrs[path] = message;
        });
        setErrs(fieldErrs);
        toast.error("Validation failed");
      } else {
        toast.error("Error updating password");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ------------ modal UI ------------ */
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* backdrop */}
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

        {/* panel */}
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
            <DialogPanel className="w-full max-w-lg rounded-2xl bg-[var(--color-black)] p-6 lg:p-10 space-y-4">
              {/* title */}
              <DialogTitle className="text-3xl font-extrabold">
                Change Password
              </DialogTitle>
              <p className="text-sm text-[var(--secondary-text)] mb-8">
                Changing your password will sign you out on all other devices
              </p>

              {/* inputs */}
              <div className="space-y-6 mb-8">
                {/* current password + forgot link */}
                <div className="space-y-1">
                  <PasswordInput
                    label="Current password*"
                    placeholder="Enter password"
                    value={form.currentPassword}
                    onChange={(v) => setForm({ ...form, currentPassword: v })}
                    error={errs.currentPassword}
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      className="text-xs text-[var(--color-blue)] hover:underline"
                      onClick={() =>
                        (window.location.href = "/forgot-password")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={(v) => setForm({ ...form, newPassword: v })}
                  error={errs.newPassword}
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={form.confirm}
                  onChange={(v) => setForm({ ...form, confirm: v })}
                  error={errs.confirm}
                />
              </div>

              {/* submit */}
              <Button
                fullWidth
                variant="signup"
                label="Change password"
                loading={loading}
                onClick={handleSave}
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
