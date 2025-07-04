"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";

// 📦 Individual tab components (each lives in its own file below)
import AccountTab from "@/components/settings/AccountTab";
import VerifyTab from "@/components/settings/VerifyTab";
import SecurityTab from "@/components/settings/SecurityTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import SessionsTab from "@/components/settings/SessionsTab";
import IgnoredUsersTab from "@/components/settings/IgnoredUsersTab";
import TransactionHistoryTab from "@/components/settings/TransactionHistoryTab";
/**
 * Keeping page‑level file ultra‑thin: only layout + tab switcher.
 * Each tab’s UI / logic lives in its own co‑located component for clarity & tree‑shaking.
 */

const TABS = [
  { key: "Account", label: "Account" },
  { key: "Verify", label: "Verify" },
  { key: "Security", label: "Security" },
  { key: "Preferences", label: "Preferences" },
  { key: "Sessions", label: "Sessions" },
  { key: "IgnoredUsers", label: "Ignored Users" },
  { key: "TransactionHistory", label: "Transaction History" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  const [activeTab, setActiveTab] = useState<TabKey>("Account");

  const renderTab = () => {
    switch (activeTab) {
      case "Account":
        return <AccountTab />;
      case "Verify":
        return <VerifyTab />;
      case "Security":
        return <SecurityTab />;
      case "Preferences":
        return <PreferencesTab />;
      case "Sessions":
        return <SessionsTab />;
      case "IgnoredUsers": // <‑‑ keep for backward compatibility
        return <IgnoredUsersTab />;
      case "TransactionHistory":
        return <TransactionHistoryTab />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 text-white max-w-6xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>

          {/* Tabs nav */}
          <div className="flex rounded-full gap-2 text-[var(--color-muted)] bg-[var(--button-background-primary-default)]">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-[14px] rounded-[999px] text-sm leading-[100%] font-medium transition-colors ${
                  activeTab === key
                    ? "bg-[var(--tab-btn-bg)] text-white"
                    : "cursor-pointer"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {renderTab()}
      </div>
    </MainLayout>
  );
}
