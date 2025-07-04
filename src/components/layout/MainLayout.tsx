"use client";

import { useState } from "react";
import SideNav from "@/components/nav/SideNav";
import TopBar from "@/components/nav/TopBar";
// import BottomNav from "@/components/nav/BottomNav";
// import Hero from "../home/Hero";
import RegisterLoginModal from "./RegisterLoginModal"; // 👈 import the modal
import Footer from "@/components/nav/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();
  // const isHomePage = pathname === "/";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"register" | "login">("register");

  return (
    <div className="flex flex-col lg:flex-row bg-[#0B0B11] text-white pt-[22px] pr-2 max-w-[1396px] mx-auto">
      <SideNav />

      <div className="flex-1 flex flex-col">
        <TopBar setIsModalOpen={setIsModalOpen} setMode={setMode} />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
        <Footer />
        {/* <BottomNav /> */}
      </div>

      {/* 🔥 Modal Hooked In */}
      <RegisterLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
}
