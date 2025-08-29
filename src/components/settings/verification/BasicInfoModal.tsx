// ./src/components/settings/verification/BasicInfoModal.tsx
"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import userSettingsApi from "@/services/userSettings";
import InputField from "../../form/InputField";
import Button from "../../form/Button";

type Values = {
  country?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // "YYYY-MM-DD"
  occupation?: string;
};

function getErrorMessage(e: unknown): string | undefined {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    return (e as Record<string, unknown>).message as string;
  }
  return undefined;
}

export default function BasicInfoModal({
  open,
  onClose,
  initialValues,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: Values | null;
  onSubmitted?: () => void;
}) {
  // Local form state
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // 🔁 Keep form in sync with incoming initialValues whenever the modal opens
  useEffect(() => {
    if (!open) return;

    const v = initialValues ?? {};
    setCountry(v.country ?? "");
    setFirstName(v.firstName ?? "");
    setLastName(v.lastName ?? "");
    setOccupation(v.occupation ?? "");

    // Expecting "YYYY-MM-DD". Convert "06" -> "6" etc. so <select> matches.
    const [yy, mm, dd] =
      typeof v.dateOfBirth === "string" ? v.dateOfBirth.split("-") : [];
    setYear(yy ?? "");
    setMonth(mm ? String(Number(mm)) : "");
    setDay(dd ? String(Number(dd)) : "");

    setErr(null);
  }, [open, initialValues]);

  const save = useMutation({
    mutationFn: async () => {
      setErr(null);
      const date = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new Error("Please enter a valid date");

      return userSettingsApi.submitBasicInfo({
        country,
        firstName,
        lastName,
        dateOfBirth: date,
        occupation,
      });
    },
    onError: (e: unknown) => setErr(getErrorMessage(e) || "Failed to submit"),
    onSuccess: () => onSubmitted?.(),
  });

  const resetAndClose = () => {
    setErr(null);
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={resetAndClose}>
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
              <DialogPanel className="w-full max-w-[560px] rounded-2xl bg-[var(--sidenav-background)] p-6 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <DialogTitle className="text-xl font-semibold">
                    Basic verification
                  </DialogTitle>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-white/60 hover:text-white cursor-pointer"
                    onClick={resetAndClose}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <p className="mb-6 text-sm text-[var(--secondary-text)]">
                  Fill in your personal information
                </p>

                {/* Country */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm opacity-80">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[var(--surface-l3)] px-3 py-3 outline-none"
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Names */}
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <InputField
                    label="First Name"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <InputField
                    label="Last Name"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                {/* DOB */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm opacity-80">
                    Date of Birth
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[var(--surface-l3)] px-3 py-3 outline-none"
                    >
                      <option value="" disabled>
                        Day
                      </option>
                      {Array.from({ length: 31 }).map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[var(--surface-l3)] px-3 py-3 outline-none"
                    >
                      <option value="" disabled>
                        Month
                      </option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={String(m.value)}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[var(--surface-l3)] px-3 py-3 outline-none"
                    >
                      <option value="" disabled>
                        Year
                      </option>
                      {YEARS.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Occupation */}
                <div className="mb-6">
                  <InputField
                    label="Occupation"
                    placeholder="Your occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  />
                </div>

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
                    onClick={resetAndClose}
                  />
                  <Button
                    label={save.isPending ? "Submitting..." : "Next"}
                    padding="px-4 py-3"
                    onClick={() => save.mutate()}
                    disabled={
                      save.isPending ||
                      !country ||
                      !firstName ||
                      !lastName ||
                      !day ||
                      !month ||
                      !year ||
                      !occupation
                    }
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

const COUNTRIES = [
  "Georgia",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "India",
  "Japan",
  "Australia",
  "Brazil",
  "Mexico",
  "South Africa",
  "Singapore",
];

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const YEARS = (() => {
  const now = new Date().getFullYear();
  const min = now - 100;
  return Array.from({ length: 83 })
    .map((_, i) => now - 18 - i)
    .filter((y) => y >= min);
})();
