"use client";

import { Card, Header } from "./shared";
import Button from "../form/Button";

export default function SecurityTab() {
  return (
    <section className="space-y-6">
      <Header title="Security" subtitle="Manage your account security" />

      <div className="grid lg:grid-cols-2 gap-2">
        <Card className="flex items-center gap-6 justify-between">
          <div className="">
            <p className="font-medium">Change Password</p>
            <p className="text-xs text-[var(--secondary-text)]">
              Last changed: 15/01/2025
            </p>
          </div>
          <Button
            label="Change password"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7.5 4.16732L13.3333 10.0007L7.5 15.834"
                  stroke="white"
                  strokeWidth="1.5"
                  stroke-winecap="round"
                  stroke-winejoin="round"
                />
              </svg>
            }
            variant="login"
            padding="px-3 py-[6px]"
          />
        </Card>

        <Card className="flex items-center gap-6">
          <div className="">
            <p className="font-medium mb-1">Two-Factor Authentication</p>
            <p className="text-xs text-[var(--secondary-text)]">
              Enhance your security by using 2-factor verification via an
              authenticator app for all future logins, withdrawals and tipping.
            </p>
          </div>

          <Button label="Enable" padding="px-4 py-3" />
        </Card>
      </div>
    </section>
  );
}
