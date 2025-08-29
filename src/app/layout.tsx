import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bluff Casino",
  description: "Crypto casino built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0B11]`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          {/* Global, brand-styled toaster */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--color-popup-background, #11111A)",
                color: "#fff",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.08)",
                // boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                padding: "14px 16px",
                fontSize: "14px",
                fontWeight: 500,
                backdropFilter: "blur(20px)",
              },
              success: {
                iconTheme: {
                  primary: "#C0FF03", // Bluff neon green
                  secondary: "#11111A",
                },
                style: {
                  background: "rgba(192,255,3,0.2)",
                  borderColor: "rgba(192,255,3,0.25)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#FF5A72",
                  secondary: "#11111A",
                },
                style: {
                  background: "rgba(255,90,114,0.08)",
                  borderColor: "rgba(255,90,114,0.25)",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
