"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Button from "../../form/Button";
import InputField from "../../form/InputField";
import userSettingsApi from "@/services/userSettings";
import { parseApiError } from "@/utils/parseApiError";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Optional prefill (e.g. from profile) */
  initialValues?: {
    country?: string;
  } | null;
  onSubmitted?: (message?: string) => void;
};

type DocKind = "drivers_license" | "id_card" | "passport" | "residence_permit";

const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_MB = 10;

export default function IdentityModal({
  open,
  onClose,
  initialValues,
  onSubmitted,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [country, setCountry] = useState(initialValues?.country ?? "Georgia");
  const [docType, setDocType] = useState<DocKind>("id_card");
  const [docNumber, setDocNumber] = useState("");

  // Step 2 & 3
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // reset between openings
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErr(null);
  }, [open]);

  // previews
  useEffect(() => {
    if (!frontFile) return setFrontPreview(null);
    const url = URL.createObjectURL(frontFile);
    setFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [frontFile]);

  useEffect(() => {
    if (!backFile) return setBackPreview(null);
    const url = URL.createObjectURL(backFile);
    setBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [backFile]);

  const requiresBack = useMemo(() => docType !== "passport", [docType]);

  const fileInputFront = useRef<HTMLInputElement>(null);
  const fileInputBack = useRef<HTMLInputElement>(null);

  const validateFile = (f: File) => {
    if (!ALLOWED_MIME.includes(f.type as any)) {
      throw new Error("Only JPG, PNG or PDF files are allowed.");
    }
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_MB) {
      throw new Error(`File must be less than ${MAX_MB} MB.`);
    }
  };

  const uploadAndSubmit = useMutation({
    mutationFn: async () => {
      setErr(null);

      if (!country) throw new Error("Please select issuing country.");
      if (!docType) throw new Error("Please select document type.");
      if (!docNumber.trim()) throw new Error("Please enter document number.");
      if (!frontFile) throw new Error("Please upload the front side.");

      validateFile(frontFile);
      if (requiresBack) {
        if (!backFile) throw new Error("Please upload the back side.");
        validateFile(backFile);
      }

      // 1) Upload files -> get CDN URLs (uses FormData)
      const frontUrl = await userSettingsApi.uploadKycFile(frontFile);
      let backUrl: string | undefined;
      if (requiresBack && backFile) {
        backUrl = await userSettingsApi.uploadKycFile(backFile);
      }

      // 2) Submit identity payload
      const payload: any = {
        documentType: mapDocType(docType),
        documentNumber: docNumber.trim(),
        documentUrl: frontUrl,
      };
      if (backUrl) payload.documentBackUrl = backUrl;
      if (country) payload.country = country;

      const resp = await userSettingsApi.submitIdentity(payload);
      return resp;
    },
    onSuccess: (resp: any) => {
      const msg =
        resp?.message ||
        "Identity documents submitted! We’ll review them shortly.";
      toast.success(msg);
      onSubmitted?.(resp?.message);
      onClose();
    },
    onError: (e: unknown) => {
      const { message } = parseApiError(e);
      setErr(message || "Submission failed");
    },
  });

  const nextFromStep1 = () => {
    setErr(null);
    if (!country || !docType || !docNumber.trim()) {
      setErr("Please complete all fields to continue.");
      return;
    }
    setStep(2);
  };

  const backFromStep2 = () => {
    setErr(null);
    setStep(1);
  };

  const nextFromStep2 = () => {
    setErr(null);
    if (!frontFile) {
      setErr("Please upload the front side.");
      return;
    }
    if (requiresBack) setStep(3);
    else uploadAndSubmit.mutate();
  };

  const backFromStep3 = () => {
    setErr(null);
    setStep(2);
  };

  const submitFromStep3 = () => {
    setErr(null);
    if (requiresBack && !backFile) {
      setErr("Please upload the back side.");
      return;
    }
    uploadAndSubmit.mutate();
  };

  const close = () => {
    if (uploadAndSubmit.isPending) return;
    setErr(null);
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-50" onClose={close}>
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
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        {/* Panel */}
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
              <DialogPanel className="w-full max-w-[640px] rounded-2xl bg-[var(--sidenav-background)] text-white border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                  <DialogTitle className="text-2xl font-semibold">
                    {step === 1
                      ? "Identity Verification"
                      : step === 2
                      ? "Upload document"
                      : "Upload document (continued)"}
                  </DialogTitle>
                  <button
                    className="rounded-lg p-2 text-white/60 hover:text-white"
                    onClick={close}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6">
                  {step === 1 && (
                    <Step1
                      country={country}
                      setCountry={setCountry}
                      docType={docType}
                      setDocType={setDocType}
                      docNumber={docNumber}
                      setDocNumber={setDocNumber}
                    />
                  )}

                  {step === 2 && (
                    <StepUpload
                      label="Front side of your ID"
                      file={frontFile}
                      setFile={setFrontFile}
                      preview={frontPreview}
                      inputRef={fileInputFront}
                    />
                  )}

                  {step === 3 && (
                    <StepUpload
                      label="Back side of your ID"
                      file={backFile}
                      setFile={setBackFile}
                      preview={backPreview}
                      inputRef={fileInputBack}
                    />
                  )}

                  {err ? (
                    <div className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
                      {err}
                    </div>
                  ) : null}

                  {/* Footer actions */}
                  <div className="mt-6 flex items-center gap-3">
                    {step > 1 ? (
                      <Button
                        label="Back"
                        padding="px-4 py-3"
                        variant="login"
                        onClick={step === 2 ? backFromStep2 : backFromStep3}
                        disabled={uploadAndSubmit.isPending}
                      />
                    ) : (
                      <Button
                        label="Cancel"
                        padding="px-4 py-3"
                        variant="login"
                        onClick={close}
                        disabled={uploadAndSubmit.isPending}
                      />
                    )}

                    {step === 1 && (
                      <Button
                        label="Next"
                        padding="px-4 py-3"
                        onClick={nextFromStep1}
                      />
                    )}

                    {step === 2 && (
                      <Button
                        label={
                          requiresBack
                            ? "Next"
                            : uploadAndSubmit.isPending
                            ? "Submitting..."
                            : "Submit"
                        }
                        padding="px-4 py-3"
                        onClick={
                          requiresBack ? nextFromStep2 : uploadAndSubmit.mutate
                        }
                        disabled={uploadAndSubmit.isPending}
                      />
                    )}

                    {step === 3 && (
                      <Button
                        label={
                          uploadAndSubmit.isPending ? "Submitting..." : "Submit"
                        }
                        padding="px-4 py-3"
                        onClick={submitFromStep3}
                        disabled={uploadAndSubmit.isPending}
                      />
                    )}
                  </div>

                  {(step === 2 || step === 3) && (
                    <p className="mt-4 text-xs text-white/50">
                      File size must be less than 10 MB in jpeg, png or pdf
                      format.
                    </p>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function Step1(props: {
  country: string;
  setCountry: (v: string) => void;
  docType: DocKind;
  setDocType: (v: DocKind) => void;
  docNumber: string;
  setDocNumber: (v: string) => void;
}) {
  const { country, setCountry, docType, setDocType, docNumber, setDocNumber } =
    props;

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm opacity-80">
          Select issuing country
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[var(--surface-l3)] px-3 py-3 outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm opacity-80">
          Select document type
        </label>

        <div className="overflow-hidden rounded-xl border border-white/10">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.value}
              onClick={() => setDocType(dt.value)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                docType === dt.value
                  ? "bg-white/5"
                  : "hover:bg-white/5 bg-transparent"
              }`}
              type="button"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`inline-block h-3 w-3 rounded-full border ${
                    docType === dt.value
                      ? "bg-[#7c4dff] border-[#7c4dff]"
                      : "border-white/40"
                  }`}
                />
                {dt.label}
              </span>
              <span className="opacity-50">{dt.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <InputField
        label="Document number"
        placeholder="e.g. A1234567"
        value={docNumber}
        onChange={(e) => setDocNumber(e.target.value)}
      />
    </div>
  );
}

function StepUpload({
  label,
  file,
  setFile,
  preview,
  inputRef,
}: {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
  preview: string | null;
  // 🔧 accept the real type returned by useRef<HTMLInputElement>(null)
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium opacity-80">
          Make sure that your document:
        </p>
        <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
          <li>is clear and easy to read</li>
          <li>is unedited</li>
          <li>the whole document must appear in the photo</li>
          <li>there is no reflective glare</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-[var(--surface-l3)] px-6 py-8 text-center">
        {preview && file && file.type.startsWith("image/") ? (
          <div className="mx-auto mb-4 w-full max-w-[360px] overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="preview"
              className="w-full object-contain"
            />
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-xl bg-black/30">
            <span className="text-3xl">🪪</span>
          </div>
        )}
        <p className="mb-1 font-semibold">{label}</p>
        <p className="mb-5 text-xs text-white/50">
          File size must be less than 10 MB in jpeg, png or pdf format.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />

        <div className="flex items-center justify-center gap-3">
          <Button
            label={file ? "Replace file" : "Choose file"}
            padding="px-4 py-3"
            onClick={() => inputRef.current?.click()}
          />
          {file ? (
            <Button
              label="Remove"
              padding="px-4 py-3"
              variant="login"
              onClick={() => setFile(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function mapDocType(t: DocKind) {
  // Backend expects: "passport" | "id_card" | "drivers_license" | "residence_permit"
  return t;
}

const DOC_TYPES: { value: DocKind; label: string; icon: string }[] = [
  { value: "drivers_license", label: "Driver's License", icon: "🪪" },
  { value: "id_card", label: "ID Card", icon: "🧾" },
  { value: "passport", label: "Passport", icon: "🛂" },
  { value: "residence_permit", label: "Residence Permit", icon: "📄" },
];

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
