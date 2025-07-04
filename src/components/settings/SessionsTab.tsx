"use client";

import { Laptop, Smartphone, LogOut } from "lucide-react";
import { useState } from "react";
import { Header, Toggle, ButtonSecondary } from "./shared";

export default function SessionsTab() {
  const [showLoggedOut, setShowLoggedOut] = useState(false);

  const sessions = [
    {
      device: "Mac OS (Chrome)",
      location: "Leeds, United Kingdom",
      ip: "198.168.0.1",
      lastUsed: "Online",
      current: true,
    },
    {
      device: "iOS 16.2",
      location: "London, United Kingdom",
      ip: "198.168.1.1",
      lastUsed: "4 hours ago",
      current: false,
    },
  ];

  return (
    <section className="space-y-6">
      <Header
        title="Sessions"
        subtitle="All the usage sessions related to your account"
      />

      {/* Headings */}
      <div className="grid grid-cols-5 text-xs text-[var(--secondary-text)] px-2 mb-4">
        <span className="pl-2">User</span>
        <span>Near</span>
        <span>IP Address</span>
        <span>Last Used</span>
        <span className="ml-auto pr-2">Action</span>
      </div>

      {/* Session rows */}
      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.ip}
            className="grid grid-cols-5 items-center bg-[#1C1C22] rounded-lg px-4 py-[20px] text-sm text-[var(--secondary-text)]"
          >
            <div className="flex items-center gap-2">
              {s.device.includes("Mac") ? (
                <Laptop size={16} />
              ) : (
                <Smartphone size={16} />
              )}
              {s.device}
            </div>
            <div>{s.location}</div>
            <div>{s.ip}</div>
            <div>{s.lastUsed}</div>
            <div className="text-right">
              {s.current ? (
                <span className="text-gray-400">Current session</span>
              ) : (
                <button className="text-white text-sm hover:underline">
                  Remove session
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-4">
        <Toggle
          checked={showLoggedOut}
          onChange={() => setShowLoggedOut(!showLoggedOut)}
        />
        <span className="text-sm">Display logged out sessions</span>

        <ButtonSecondary className="flex items-center gap-2">
          Log out of all sessions
          <LogOut size={16} />
        </ButtonSecondary>
      </div>
    </section>
  );
}
