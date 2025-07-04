"use client";

import { Card, Header } from "./shared";
import Button from "../form/Button";

export default function VerifyTab() {
  const levels = [
    {
      title: "Email Verification",
      verified: true,
      cta: null,
    },
    {
      title: "Level 1 Verification: Basic Information",
      sub: "Fill in your details for us to get to know you better",
      verified: true,
      cta: "View and update",
    },
    {
      title: "Level 2 Verification: Identity Verification",
      sub: "Upload a copy of your ID",
      verified: false,
      cta: "Verify now",
    },
  ];

  return (
    <section className="space-y-2">
      <Header
        title="Account Verification"
        subtitle="Verify your account to gain full access"
      />

      {levels.map(({ title, sub, verified, cta }) => (
        <Card
          key={title}
          className="flex items-center justify-between py-[20px]"
        >
          <div className="flex items-center gap-3">
            {verified ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12ZM15.6103 10.1859C15.8511 9.84887 15.773 9.38046 15.4359 9.1397C15.0989 8.89894 14.6305 8.97701 14.3897 9.31407L11.1543 13.8436L9.53033 12.2197C9.23744 11.9268 8.76256 11.9268 8.46967 12.2197C8.17678 12.5126 8.17678 12.9874 8.46967 13.2803L10.7197 15.5303C10.8756 15.6862 11.0921 15.7656 11.3119 15.7474C11.5316 15.7293 11.7322 15.6153 11.8603 15.4359L15.6103 10.1859Z"
                  fill="#C0FF03"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12ZM15.6103 10.1859C15.8511 9.84887 15.773 9.38046 15.4359 9.1397C15.0989 8.89894 14.6305 8.97701 14.3897 9.31407L11.1543 13.8436L9.53033 12.2197C9.23744 11.9268 8.76256 11.9268 8.46967 12.2197C8.17678 12.5126 8.17678 12.9874 8.46967 13.2803L10.7197 15.5303C10.8756 15.6862 11.0921 15.7656 11.3119 15.7474C11.5316 15.7293 11.7322 15.6153 11.8603 15.4359L15.6103 10.1859Z"
                  fill="#626273"
                />
              </svg>
            )}
            <div>
              <p className="font-medium leading-none">{title}</p>
              {sub ? (
                <p className="text-sm text-[var(--secondary-text)] mt-2">
                  {sub}
                </p>
              ) : null}
            </div>
          </div>
          {cta &&
            (cta === "View and update" ? (
              <Button label={cta} padding="px-4 py-3" variant="login" />
            ) : (
              <Button label={cta} padding="px-4 py-3" />
            ))}
        </Card>
      ))}

      <Card className="flex items-center justify-between mt-8 py-[20px]">
        <div>
          <p className="text-base font-medium leading-none">Need Help?</p>
          <p className="text-sm text-[var(--secondary-text)] mt-2">
            Have questions or concerns regarding your Bluff account? Our experts
            are here to help!
          </p>
        </div>
        <Button label="Chat with us" padding="px-4 py-3" />
      </Card>
    </section>
  );
}
