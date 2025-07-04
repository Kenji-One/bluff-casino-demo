// src/components/home/Hero.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiClient, Game, RawGamesResponse } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import GameCarouselSection from "@/components/games/GameCarouselSection";
import Image from "next/image";
/* -------------------------------------------------
 *  Constants / helpers
 * ------------------------------------------------- */
const PRODUCT_ID = "PGSOFT"; // change to whichever product you want
const CARD_LIMIT = 10; // how many games we slice for each row

const splitGames = (games: Game[]) => ({
  popular: games
    .filter((g) => g.type?.toUpperCase() === "SLOT")
    .slice(0, CARD_LIMIT),
  originals: games
    .filter((g) => Number(g.rank) && Number(g.rank) <= 10)
    .slice(0, CARD_LIMIT),
});

/* -------------------------------------------------
 *  Component
 * ------------------------------------------------- */
export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- 1. fetch once on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<RawGamesResponse>(
          `/seamless/games?productId=${PRODUCT_ID}`
        );
        const raw = Array.isArray(res?.data?.games)
          ? res.data.games
          : Array.isArray(res?.games)
          ? res.games
          : [];

        // setGames(
        //   raw.map((g: any) => ({
        //     ...g,
        //     imageUrl: g.imageUrl || g.img || "",
        //   }))
        // );
        const mapped = raw.map((g: Game) => ({
          ...g,
          imageUrl: g.imageUrl ?? g.img ?? "",
        }));

        setGames(mapped);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || "Failed to load games");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- 2. click-to-play (copied from GameGrid) ---------- */
  const handlePlay = async (g: Game) => {
    if (!user) {
      alert("Please log in to play games.");
      return;
    }

    try {
      setLoading(true);

      // const res = await apiClient.post(`/games/${PRODUCT_ID}/launch`, {
      //   gameCode: g.code,
      //   currency: "THB",
      //   language: "en",
      //   isMobileLogin: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
      // });

      // const gameUrl = res?.data?.gameUrl || res?.data?.url;
      // if (!res.success || !gameUrl)
      //   throw new Error(res.message || "No game URL");

      // router.push(
      //   `/play/${PRODUCT_ID}/${g.code}` +
      //     `?url=${encodeURIComponent(gameUrl)}&name=${encodeURIComponent(
      //       g.name
      //     )}`
      // );
      const gameUrl = await apiClient.launchGame(g.code, PRODUCT_ID);
      router.push(
        `/play/${PRODUCT_ID}/${g.code}` +
          `?url=${encodeURIComponent(gameUrl)}&name=${encodeURIComponent(
            g.name
          )}`
      );
    } catch (e: unknown) {
      const err = e as Error;
      alert(err.message || "Failed to launch game");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 3. derive carousel slices ---------- */
  const { popular, originals } = useMemo(() => splitGames(games), [games]);

  /* ---------- 4. UI ---------- */
  return (
    <div className="space-y-10">
      {/* Promo strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* <img src="/images/heroImg1.svg" alt="Roll the dice" />
        <img src="/images/heroIMG2.svg" alt="Weekly Race" />
        <img src="/images/HeroIMG3.svg" alt="Welcome Bonus" /> */}
        <Image
          src="/images/heroImg1.svg"
          alt="Roll the dice"
          width={600}
          height={250}
        />
        <Image
          src="/images/heroIMG2.svg"
          alt="Weekly Race"
          width={600}
          height={250}
        />
        <Image
          src="/images/HeroIMG3.svg"
          alt="Welcome Bonus"
          width={600}
          height={250}
        />
      </section>

      {/* Loaders / errors */}
      {loading && <p className="p-4 text-center text-sm">Loading games…</p>}
      {error && <p className="p-4 text-center text-sm text-red-500">{error}</p>}

      {/* Carousels */}
      {!loading && !error && (
        <>
          <GameCarouselSection
            title="Popular Slots"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15.252 10.689C14.265 9.50896 13.772 8.91896 13.204 9.00896C12.637 9.09996 12.372 9.81196 11.842 11.236L11.704 11.604C11.554 12.009 11.478 12.211 11.331 12.36C11.185 12.509 10.983 12.588 10.581 12.746L10.214 12.889C8.79699 13.444 8.08799 13.722 8.00699 14.289C7.92599 14.856 8.52699 15.338 9.72799 16.3L10.038 16.55C10.38 16.823 10.551 16.96 10.649 17.147C10.749 17.334 10.764 17.551 10.795 17.984L10.824 18.378C10.934 19.901 10.99 20.663 11.507 20.923C12.024 21.183 12.661 20.768 13.934 19.94L14.263 19.725C14.625 19.49 14.806 19.372 15.013 19.338C15.221 19.305 15.433 19.36 15.854 19.47L16.239 19.57C17.724 19.956 18.467 20.15 18.868 19.743C19.269 19.336 19.061 18.599 18.647 17.123L18.539 16.743C18.422 16.323 18.363 16.113 18.392 15.906C18.422 15.698 18.537 15.516 18.766 15.15L18.976 14.818C19.783 13.533 20.186 12.891 19.916 12.38C19.647 11.869 18.883 11.827 17.354 11.745L16.958 11.723C16.524 11.7 16.306 11.688 16.117 11.593C15.927 11.498 15.787 11.33 15.507 10.994L15.252 10.689Z"
                  fill="#4264FF"
                />
                <path
                  d="M14.8781 5.167L15.0611 5.689C15.2621 6.262 15.3631 6.549 15.5581 6.759C15.7541 6.97099 16.0221 7.083 16.5591 7.306L17.0481 7.51C18.9381 8.296 19.8831 8.69 19.9901 9.493C20.0351 9.827 19.9231 10.141 19.6601 10.491C19.5761 10.4682 19.4914 10.4482 19.4061 10.431C18.8801 10.324 18.2111 10.288 17.5291 10.251L17.0391 10.225L16.8091 10.212L16.6581 10.032L16.3421 9.65499C15.9021 9.127 15.4721 8.61199 15.0701 8.25399C14.6431 7.87199 13.9291 7.374 12.9671 7.528C11.9951 7.684 11.4771 8.391 11.1971 8.895C10.9381 9.363 10.7051 9.989 10.4691 10.622L10.2991 11.08L10.2271 11.273C10.1737 11.293 10.1094 11.3183 10.0341 11.349L9.57807 11.527C8.94807 11.774 8.32507 12.017 7.86107 12.284C7.36307 12.571 6.66107 13.101 6.52207 14.077C6.38507 15.044 6.90007 15.75 7.28907 16.169C7.57907 16.48 7.97007 16.809 8.38707 17.147C6.81807 17.572 5.98407 17.731 5.51007 17.219C4.97607 16.643 5.25207 15.599 5.80507 13.509L5.94707 12.969C6.10407 12.374 6.18307 12.078 6.14407 11.783C6.10407 11.489 5.95107 11.23 5.64507 10.713L5.36707 10.243C4.29007 8.422 3.75207 7.512 4.11007 6.787C4.47007 6.063 5.48907 6.004 7.52807 5.887L8.05507 5.857C8.63507 5.823 8.92407 5.807 9.17707 5.672C9.42907 5.537 9.61607 5.3 9.99007 4.824L10.3301 4.392C11.6461 2.719 12.3041 1.883 13.0601 2.012C13.8161 2.141 14.1701 3.149 14.8771 5.166"
                  fill="#4264FF"
                />
              </svg>
            }
            games={popular}
            onPlay={handlePlay}
            viewAllHref="/slots"
          />

          <GameCarouselSection
            title="Originals"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M20.9601 18.4C20.0001 18.88 18.7201 18.56 18.0801 17.6L16.3201 15.36H7.68006L5.92006 17.6C5.12006 18.72 3.68006 18.88 2.56006 18.08C1.76006 17.44 1.44006 16.48 1.60006 15.68L2.72006 9.75997C3.04006 7.83997 4.80006 6.39998 6.72006 6.39998H11.2001V3.99998C11.2001 2.71998 12.1601 1.59998 13.4401 1.59998H18.4001C18.8801 1.59998 19.2001 1.91998 19.2001 2.39998C19.2001 2.87998 18.8801 3.19998 18.4001 3.19998H13.6001C13.1201 3.19998 12.8001 3.51998 12.8001 3.83998V6.39998H17.2801C19.2001 6.39998 20.9601 7.83997 21.2801 9.75997L22.4001 15.68C22.5601 16.8 22.0801 17.92 20.9601 18.4ZM9.60006 10.4C9.60006 9.11998 8.48006 7.99998 7.20006 7.99998C5.92006 7.99998 4.80006 9.11998 4.80006 10.4C4.80006 11.68 5.92006 12.8 7.20006 12.8C8.48006 12.8 9.60006 11.68 9.60006 10.4ZM19.2001 10.4C19.2001 9.91998 18.8801 9.59998 18.4001 9.59998H17.6001V8.79998C17.6001 8.31998 17.2801 7.99998 16.8001 7.99998C16.3201 7.99998 16.0001 8.31998 16.0001 8.79998V9.59998H15.2001C14.7201 9.59998 14.4001 9.91998 14.4001 10.4C14.4001 10.88 14.7201 11.2 15.2001 11.2H16.0001V12C16.0001 12.48 16.3201 12.8 16.8001 12.8C17.2801 12.8 17.6001 12.48 17.6001 12V11.2H18.4001C18.8801 11.2 19.2001 10.88 19.2001 10.4Z"
                  fill="#4264FF"
                />
              </svg>
            }
            games={originals}
            onPlay={handlePlay}
            viewAllHref="/slots?category=original"
          />
        </>
      )}
    </div>
  );
}
