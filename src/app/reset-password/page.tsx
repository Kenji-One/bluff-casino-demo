// src/app/reset-password/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import MainPage from "../page"; // your main page component
import RegisterLoginModal from "@/components/layout/RegisterLoginModal";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      setIsModalOpen(true);
    }
  }, [token]);

  return (
    <>
      {/* Main page content */}
      <MainPage />

      {/* Reset modal */}
      {token && (
        <RegisterLoginModal
          isOpen={isModalOpen}
          initialMode="reset"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
