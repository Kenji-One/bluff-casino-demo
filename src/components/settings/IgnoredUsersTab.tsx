"use client";

import { User2 } from "lucide-react";
import { Header } from "./shared";

export default function IgnoredUsersTab() {
  const users = new Array(5).fill(null);

  return (
    <section className="space-y-6">
      <Header
        title="Ignored Users"
        subtitle="You won’t see their messages in the chat"
      />

      {/* Headings */}
      <div className="flex justify-between text-xs text-[var(--secondary-text)] px-4 mb-4">
        <span>User</span>
        <span>Action</span>
      </div>

      {/* User Rows */}
      <div className="space-y-2">
        {users.map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[var(--table-cell-primary)] rounded-lg py-[20px] px-4"
          >
            <div className="flex items-center gap-2 text-[var(--secondary-text)] text-sm">
              <User2 size={16} /> Hidden
            </div>
            <button className="text-sm text-white hover:underline cursor-pointer">
              Action
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
