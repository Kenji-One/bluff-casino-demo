// src/components/settings/security/VerifyEmailCodeModal.tsx
"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../../form/Button";

export default function VerifyEmailCodeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* backdrop & panel similar to others… */}
        {/* … */}
      </Dialog>
    </Transition>
  );
}
