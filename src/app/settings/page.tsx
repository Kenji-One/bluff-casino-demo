"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";

// 📦 Individual tab components
import AccountTab from "@/components/settings/AccountTab";
import VerifyTab from "@/components/settings/VerifyTab";
import SecurityTab from "@/components/settings/SecurityTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import SessionsTab from "@/components/settings/SessionsTab";
import IgnoredUsersTab from "@/components/settings/IgnoredUsersTab";
import TransactionHistoryTab from "@/components/settings/TransactionHistoryTab";

const TABS = [
  { key: "Account", label: "Account" },
  { key: "Verify", label: "Verify" },
  { key: "Security", label: "Security" },
  { key: "Preferences", label: "Preferences" },
  { key: "Sessions", label: "Sessions" },
  // { key: "IgnoredUsers", label: "Ignored Users" },
  { key: "TransactionHistory", label: "Transaction History" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

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
      // case "IgnoredUsers":
      // return <IgnoredUsersTab />;
      case "TransactionHistory":
        return <TransactionHistoryTab />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="text-white w-full pb-[80px]">
        {/* Header + tabs */}
        <div className="mb-8 flex w-full min-w-0 flex-col items-start gap-4 ">
          <h1 className="text-3xl font-bold">Settings</h1>

          {/* Tabs nav: becomes horizontal scroller on small screens */}

          {/* Tabs nav: auto-width pill with internal scrollbar */}
          <div className="scroll-tabs inline-block max-w-full rounded-full bg-[var(--button-background-primary-default)] overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] !pr-0">
            <div className="flex w-max flex-nowrap whitespace-nowrap gap-2">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={`shrink-0 px-3 py-[14px] rounded-[999px] text-sm leading-[100%] font-medium transition-colors ${
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
        </div>

        {renderTab()}
      </div>
    </MainLayout>
  );
}
