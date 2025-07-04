"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { joinGame } from "@/lib/games";
import { useAuth } from "@/context/AuthContext";

export default function SlotIframe() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    joinGame({
      username: user.username,
      productId: "JOKER",
      gameCode,
      isMobileLogin: false,
      limit: 1_000,
      betLimit: 500,
      currency: "THB",
      language: "EN",
    })
      .then((d) => setUrl(d.gameUrl))
      .catch((e) => setError(e.message));
  }, [gameCode, router, user]);

  return (
    <MainLayout>
      {error && <p className="p-4 text-red-500">{error}</p>}
      {!url && !error && <p className="p-4">Launching…</p>}
      {url && (
        <iframe
          src={url}
          className="h-screen w-full border-none"
          allowFullScreen
        />
      )}
    </MainLayout>
  );
}
