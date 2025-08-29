"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { useEffect, Fragment, useRef, useState } from "react";
import userSettingsApi from "@/services/userSettings";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";

type Props = {
  open: boolean;
  onClose: () => void;
  currentUrl?: string;
  onChanged?: () => void; // optional background refresh
};

const FALLBACK = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Aidan`;

export default function AvatarModal({
  open,
  onClose,
  currentUrl,
  onChanged,
}: Props) {
  const { updateUser } = useAuth();
  const { withBusy } = useUI();
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cacheBust = (u: string) =>
    `${u}${u.includes("?") ? "&" : "?"}t=${Date.now()}`;

  // keep preview in sync when modal opens or server URL changes
  useEffect(() => {
    setFile(null);
    setPreview(currentUrl || FALLBACK);
  }, [currentUrl, open]);

  // revoke blob URL when preview changes or unmounts
  useEffect(() => {
    let toRevoke: string | null = null;
    if (preview && preview.startsWith("blob:")) toRevoke = preview;
    return () => {
      if (toRevoke) URL.revokeObjectURL(toRevoke);
    };
  }, [preview]);

  const onFilePick = (f: File | null) => {
    if (!f) return;
    if (!/^image\/(png|jpeg|jpg)$/i.test(f.type))
      return toast.error("Only JPG/PNG are allowed");
    if (f.size > 5 * 1024 * 1024) return toast.error("Max file size is 5MB");
    setFile(f);
    const next = URL.createObjectURL(f);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return next;
    });
  };

  const generateRandom = async () => {
    await withBusy(async () => {
      setLoading(true);
      try {
        const res = await userSettingsApi.generateAvatar();
        const newUrl: string | undefined = (res as any)?.data?.profilePicture;
        if (newUrl) {
          updateUser({ profilePicture: newUrl }); // optimistic update
          setPreview(cacheBust(newUrl));
        }
        toast.success("Random avatar generated");
        await onChanged?.(); // optional background refresh
        onClose();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to generate avatar");
      } finally {
        setLoading(false);
      }
    });
  };

  const removeAvatar = async () => {
    await withBusy(async () => {
      setLoading(true);
      try {
        await userSettingsApi.deleteProfilePicture();
        updateUser({ profilePicture: undefined }); // optimistic
        toast.success("Avatar removed");
        await onChanged?.();
        onClose();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to remove avatar");
      } finally {
        setLoading(false);
      }
    });
  };

  const saveUpload = async () => {
    if (!file) return toast.error("Choose a file first");
    await withBusy(async () => {
      setLoading(true);
      try {
        const res = await userSettingsApi.uploadProfilePicture(file);
        const newUrl: string | undefined =
          (res as any)?.data?.url || (res as any)?.data?.profilePicture;
        if (newUrl) {
          updateUser({ profilePicture: newUrl }); // optimistic
          setPreview(cacheBust(newUrl));
        }
        toast.success("Profile picture updated");
        await onChanged?.();
        onClose();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Upload failed");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        onClose={() => (loading ? null : onClose())}
        className="relative z-50"
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
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
              enter="ease-out duration-150"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-2xl bg-[var(--color-black)] p-6 shadow-xl ring-1 ring-white/10">
                <DialogTitle className="text-lg font-semibold text-white">
                  Update Avatar
                </DialogTitle>

                {/* Preview */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white/10">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="avatar preview"
                        className="h-full w-full object-cover"
                        onError={() => setPreview(FALLBACK)}
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-xs text-white/50">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-sm text-white/70">
                    JPG/PNG, max 5MB. You can upload your own or generate a
                    random avatar.
                  </div>
                </div>

                {/* Upload control */}
                <div className="mt-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => onFilePick(e.target.files?.[0] ?? null)}
                  />

                  <div
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFilePick(e.dataTransfer.files?.[0] ?? null);
                    }}
                  >
                    <p className="text-sm mb-3">Upload</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full px-3 py-2 bg-white/10 hover:bg-white/15 text-sm"
                        disabled={loading}
                      >
                        Choose File
                      </button>
                      {file ? (
                        <span className="text-xs text-white/60">
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </span>
                      ) : (
                        <span className="text-xs text-white/40">
                          or drag & drop here
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveUpload}
                      className="rounded-full px-3 py-2 bg-[var(--color-blue)] hover:bg-[var(--color-blue)]/90 text-sm text-white cursor-pointer"
                      disabled={loading || !file}
                    >
                      Save Upload
                    </button>
                    <button
                      type="button"
                      onClick={generateRandom}
                      className="rounded-full px-3 py-2 bg-[var(--tab-btn-bg)] hover:opacity-90 text-sm text-white cursor-pointer"
                      disabled={loading}
                    >
                      Use Random Avatar
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="rounded-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-sm text-red-100 cursor-pointer"
                      disabled={loading}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full px-3 py-2 bg-white/10 hover:bg-white/15 text-sm text-white cursor-pointer"
                      disabled={loading}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
