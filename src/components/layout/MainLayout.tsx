"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SideNav from "@/components/nav/SideNav";
import TopBar from "@/components/nav/TopBar";
import RegisterLoginModal from "./RegisterLoginModal";
import Footer from "@/components/nav/Footer";
import SearchModal from "@/components/search/SearchModal"; // ← import the new search modal

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"register" | "login" | "reset">("register");

  // ✅ NEW: Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setMode("reset");
      setIsModalOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col lg:flex-row bg-[#0B0B11] text-white pt-4 lg:pt-[22px] lg:pr-2 max-w-[1440px] mx-auto">
      {/* Pass search modal toggle into SideNav */}
      <SideNav onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Pass search modal toggle into TopBar */}
        <TopBar
          setIsModalOpen={setIsModalOpen}
          setMode={setMode}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        <main className="flex-1 p-4 min-w-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

        {pathname !== "/settings" && <Footer />}
      </div>

      {/* 🔍 Global Search Modal */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <RegisterLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={mode}
      />
    </div>
  );
}
