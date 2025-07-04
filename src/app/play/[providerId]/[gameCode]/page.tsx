"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import MainLayout from "@/components/layout/MainLayout";
import { apiClient, Game, Transaction } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import GameCarouselSection from "@/components/games/GameCarouselSection";
import { Loader2, X } from "lucide-react";

/* ---------- custom SVG icons ---------- */
const BarChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M6.25 11.875V13.75M8.75 10V13.75M11.25 8.125V13.75M13.75 6.25V13.75M5 16.875H15C16.0355 16.875 16.875 16.0355 16.875 15V5C16.875 3.96447 16.0355 3.125 15 3.125H5C3.96447 3.125 3.125 3.96447 3.125 5V15C3.125 16.0355 3.96447 16.875 5 16.875Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const KeyboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <g clip-path="url(#clip0_147_75620)">
      <path
        d="M16.6667 4.16667H3.33341C2.41675 4.16667 1.67508 4.91667 1.67508 5.83333L1.66675 14.1667C1.66675 15.0833 2.41675 15.8333 3.33341 15.8333H16.6667C17.5834 15.8333 18.3334 15.0833 18.3334 14.1667V5.83333C18.3334 4.91667 17.5834 4.16667 16.6667 4.16667ZM9.16675 6.66667H10.8334V8.33333H9.16675V6.66667ZM9.16675 9.16667H10.8334V10.8333H9.16675V9.16667ZM6.66675 6.66667H8.33342V8.33333H6.66675V6.66667ZM6.66675 9.16667H8.33342V10.8333H6.66675V9.16667ZM5.83342 10.8333H4.16675V9.16667H5.83342V10.8333ZM5.83342 8.33333H4.16675V6.66667H5.83342V8.33333ZM13.3334 14.1667H6.66675V12.5H13.3334V14.1667ZM13.3334 10.8333H11.6667V9.16667H13.3334V10.8333ZM13.3334 8.33333H11.6667V6.66667H13.3334V8.33333ZM15.8334 10.8333H14.1667V9.16667H15.8334V10.8333ZM15.8334 8.33333H14.1667V6.66667H15.8334V8.33333Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_147_75620">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
const TheatreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M5 2.5C3.61929 2.5 2.5 3.61929 2.5 5V6.25C2.5 6.59518 2.77982 6.875 3.125 6.875C3.47018 6.875 3.75 6.59518 3.75 6.25V5C3.75 4.30964 4.30964 3.75 5 3.75H6.25C6.59518 3.75 6.875 3.47018 6.875 3.125C6.875 2.77982 6.59518 2.5 6.25 2.5H5Z"
      fill="white"
    />
    <path
      d="M13.75 2.5C13.4048 2.5 13.125 2.77982 13.125 3.125C13.125 3.47018 13.4048 3.75 13.75 3.75H15C15.6904 3.75 16.25 4.30964 16.25 5V6.25C16.25 6.59518 16.5298 6.875 16.875 6.875C17.2202 6.875 17.5 6.59518 17.5 6.25V5C17.5 3.61929 16.3807 2.5 15 2.5H13.75Z"
      fill="white"
    />
    <path
      d="M10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875Z"
      fill="white"
    />
    <path
      d="M3.75 13.75C3.75 13.4048 3.47018 13.125 3.125 13.125C2.77982 13.125 2.5 13.4048 2.5 13.75V15C2.5 16.3807 3.61929 17.5 5 17.5H6.25C6.59518 17.5 6.875 17.2202 6.875 16.875C6.875 16.5298 6.59518 16.25 6.25 16.25H5C4.30964 16.25 3.75 15.6904 3.75 15V13.75Z"
      fill="white"
    />
    <path
      d="M17.5 13.75C17.5 13.4048 17.2202 13.125 16.875 13.125C16.5298 13.125 16.25 13.4048 16.25 13.75V15C16.25 15.6904 15.6904 16.25 15 16.25H13.75C13.4048 16.25 13.125 16.5298 13.125 16.875C13.125 17.2202 13.4048 17.5 13.75 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V13.75Z"
      fill="white"
    />
  </svg>
);
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M7.99473 3.28344C8.07007 2.83139 8.46119 2.50006 8.91947 2.50006H11.0811C11.5394 2.50006 11.9305 2.83139 12.0059 3.28344L12.1838 4.35098C12.2357 4.66268 12.444 4.92233 12.7205 5.07536C12.7823 5.10958 12.8434 5.14493 12.9038 5.18137C13.1746 5.34493 13.5041 5.39578 13.8004 5.28478L14.8144 4.90488C15.2436 4.7441 15.7261 4.91715 15.9552 5.31404L17.0361 7.18608C17.2652 7.58296 17.1738 8.08734 16.82 8.37862L15.9831 9.06763C15.7393 9.2683 15.6185 9.57816 15.6243 9.89384C15.625 9.92917 15.6253 9.96458 15.6253 10.0001C15.6253 10.0355 15.625 10.071 15.6243 10.1063C15.6185 10.422 15.7393 10.7318 15.9831 10.9325L16.82 11.6215C17.1738 11.9128 17.2652 12.4172 17.0361 12.814L15.9552 14.6861C15.7261 15.083 15.2436 15.256 14.8144 15.0952L13.8004 14.7153C13.5041 14.6043 13.1747 14.6552 12.9038 14.8187C12.8434 14.8552 12.7823 14.8905 12.7205 14.9248C12.444 15.0778 12.2357 15.3374 12.1838 15.6491L12.0059 16.7167C11.9305 17.1687 11.5394 17.5001 11.0811 17.5001H8.91947C8.46119 17.5001 8.07007 17.1687 7.99473 16.7167L7.8168 15.6491C7.76485 15.3374 7.55654 15.0778 7.28007 14.9248C7.21826 14.8905 7.15716 14.8552 7.0968 14.8188C6.82594 14.6552 6.49649 14.6043 6.20019 14.7154L5.18613 15.0953C4.75698 15.256 4.27448 15.083 4.04534 14.6861L2.96452 12.8141C2.73538 12.4172 2.82676 11.9128 3.18057 11.6215L4.01753 10.9325C4.26129 10.7318 4.38212 10.422 4.37627 10.1063C4.37562 10.071 4.37529 10.0356 4.37529 10.0001C4.37529 9.96458 4.37562 9.92918 4.37627 9.89385C4.38212 9.57818 4.26129 9.26831 4.01753 9.06764L3.18057 8.37863C2.82675 8.08735 2.73538 7.58298 2.96452 7.18609L4.04534 5.31406C4.27448 4.91717 4.75698 4.74411 5.18613 4.90489L6.20018 5.28479C6.49648 5.39579 6.82593 5.34494 7.09679 5.18138C7.15715 5.14493 7.21825 5.10958 7.28007 5.07536C7.55654 4.92233 7.76485 4.66268 7.8168 4.35098L7.99473 3.28344Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5001 10C12.5001 11.3807 11.3808 12.5 10.0001 12.5C8.61939 12.5 7.5001 11.3807 7.5001 10C7.5001 8.61929 8.61939 7.5 10.0001 7.5C11.3808 7.5 12.5001 8.61929 12.5001 10Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
/* ---------- params ---------- */
interface Params {
  providerId: string;
  gameCode: string;
}

export default function PlayGame() {
  const { providerId: routeProviderId, gameCode } = useParams<Params>();
  const { user } = useAuth();
  const router = useRouter();
  /* ——— state ——— */
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [sameProvider, setSameProvider] = useState<Game[]>([]);
  // const [debug, setDebug] = useState<string>("");

  const [statsOpen, setStatsOpen] = useState(false);
  const [kbOpen, setKbOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playMode, setPlayMode] = useState<"real" | "fun">("real");

  const [txns, setTxns] = useState<Transaction[] | null>(null);
  const [loadingTxns, setLoadingTxns] = useState(false);

  /* —— fullscreen —— */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await wrapperRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch () {
      /* ignore – some browsers block without user gesture */
    }
  };
  /* keep state in sync when user hits Esc */
  useEffect(() => {
    const handler = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ————————— launch helpers ————————— */
  const launch = async (mode: "real" | "fun") => {
    try {
      const u = await apiClient.launchGame(gameCode, routeProviderId);
      setUrl(mode === "fun" ? `${u}&demo=true` : u);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  /** first load & meta fetches */
  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    launch("real");

    /** get meta then same-provider list */
    apiClient.getGameMeta(gameCode, routeProviderId).then((g) => {
      setGame(g);

      const pid = g?.providerId || routeProviderId;
      apiClient
        .listGames({ providerId: pid, limit: 100 })
        .then((all) => {
          const filtered = all.filter((x) => x.code !== gameCode).slice(0, 12);
          setSameProvider(filtered);

          // if (process.env.NODE_ENV !== "production") {
          //   setDebug(
          //     `providerId=${pid} | total=${all.length} | showing=${filtered.length}`
          //   );
          // }
        })
        .catch((e: unknown) => {
          const err = e as Error;
          console.error(`listGames error for ${pid}:`, err.message);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeProviderId, gameCode, user]);

  /** relaunch on mode switch */
  useEffect(() => {
    if (user) launch(playMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode]);

  /** lazy-load txns the first time stats opens */
  useEffect(() => {
    if (statsOpen && txns === null && !loadingTxns) {
      setLoadingTxns(true);
      apiClient
        .getTransactions(100, 0)
        .then((r) => setTxns(r.data.transactions ?? []))
        .finally(() => setLoadingTxns(false));
    }
  }, [statsOpen, txns, loadingTxns]);

  /* profit / wagered etc. */
  const stats = useMemo(() => {
    if (!txns) return null;
    const wins = txns.filter((t) => t.type === "WIN");
    const bets = txns.filter((t) => t.type === "BET");
    const profit =
      wins.reduce((a, t) => a + t.amount, 0) -
      bets.reduce((a, t) => a + t.amount, 0);
    return {
      wins: wins.length,
      losses: bets.length - wins.length,
      wagered: bets.reduce((a, t) => a + t.amount, 0),
      profit,
    };
  }, [txns]);

  /* reusable pill-button */
  const ToggleBtn = ({
    active,
    onClick,
    children, // <-- now expects [icon , label]
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 rounded-full px-[14px] py-2 text-[10px] font-semibold transition cursor-pointer",
        active
          ? "bg-[var(--toggle-active-bg)] text-white"
          : "bg-[var(--tab-btn-bg)] text-[var(--color-muted)] hover:text-white"
      )}
    >
      {children}
    </button>
  );

  /* place this helper just above the return */
  const handlePlaySame = async (g: Game) => {
    if (!user) {
      alert("Please log in to play games.");
      return;
    }
    try {
      const launchUrl = await apiClient.launchGame(
        g.code,
        g.providerId ?? routeProviderId
      );

      router.push(
        `/play/${g.providerId ?? routeProviderId}/${g.code}` +
          `?url=${encodeURIComponent(launchUrl)}&name=${encodeURIComponent(
            g.name
          )}`
      );
    } catch (e: any) {
      alert(e.message || "Failed to launch game");
    }
  };

  /* ————————— JSX ————————— */
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* ██████ game wrapper ██████ */}
        <div
          ref={wrapperRef}
          className={clsx(
            "rounded-xl bg-black transition-all",
            isFs ? "h-screen w-screen fixed inset-0 z-40 m-0" : "aspect-[16/9]"
          )}
          /* In fullscreen the browser ignores most positional styles,
             but the fixed+inset combo ensures mobile Safari behaves. */
        >
          {/* iframe slot */}
          <div className="relative h-full w-full overflow-hidden">
            {!url && !err && (
              <div className="absolute inset-0 grid place-content-center text-sm text-white/70">
                <Loader2 size={32} className="animate-spin mb-2" />
                Starting game…
              </div>
            )}
            {err && (
              <div className="absolute inset-0 grid place-content-center text-red-500 text-sm">
                {err}
              </div>
            )}
            {url && (
              <iframe
                key={url}
                src={url}
                scrolling="no"
                className={clsx(
                  "absolute inset-0 h-full w-full border-none",
                  isFs ? "rounded-none" : "rounded-t-xl"
                )}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen *; microphone; payment"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            )}
          </div>

          {/* overlay bar */}
          <div
            className={clsx(
              "py-4 w-full bg-[var(--table-cell-primary)] flex items-center justify-between px-6",
              isFs ? "" : "rounded-b-xl"
            )}
          >
            <div className="flex items-center gap-2 text-white">
              <button
                title="Live stats"
                onClick={() => setStatsOpen(true)}
                className="hover:text-[var(--color-brand)] cursor-pointer"
              >
                <BarChartIcon width={20} height={20} />
              </button>
              <button
                title="Shortcut keys"
                onClick={() => setKbOpen(true)}
                className="hover:text-[var(--color-brand)] cursor-pointer"
              >
                <KeyboardIcon width={20} height={20} />
              </button>
              <button
                title="Fullscreen"
                onClick={toggleFullscreen}
                className={clsx(
                  "cursor-pointer",
                  isFs
                    ? "text-[var(--color-brand)]"
                    : "hover:text-[var(--color-brand)]"
                )}
              >
                <TheatreIcon width={20} height={20} />
              </button>
              <button
                title="Settings"
                onClick={() => setSettingsOpen(true)}
                className="hover:text-[var(--color-brand)] cursor-pointer"
              >
                <SettingsIcon width={20} height={20} />
              </button>
            </div>

            <span className="hidden md:block text-sm font-semibold text-white/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="12"
                viewBox="0 0 64 12"
                fill="none"
              >
                <path
                  d="M4.0682 11.7692L0.309814 0.230419H3.1946L5.74957 8.71955L8.30454 0.230419H11.1893L7.43094 11.7692H4.0682Z"
                  fill="#626273"
                />
                <path
                  d="M12.1781 0.230751H14.8154V11.7696H12.1781V0.230751Z"
                  fill="#626273"
                />
                <path
                  d="M20.6673 12C19.4914 12 18.5105 11.7446 17.7249 11.2334C16.939 10.7225 16.3816 10.0274 16.0518 9.14813L18.3266 7.8295C18.7881 8.89555 19.5959 9.42857 20.7496 9.42857C21.7935 9.42857 22.3154 9.11553 22.3154 8.48913C22.3154 8.14855 22.1477 7.88204 21.8128 7.6896C21.4776 7.49747 20.8483 7.27495 19.9254 7.02205C19.4417 6.89006 19.0188 6.74193 18.6561 6.57702C18.2934 6.41211 17.9392 6.19529 17.5929 5.92593C17.2466 5.65689 16.983 5.31884 16.8016 4.91211C16.6202 4.5057 16.5297 4.03851 16.5297 3.51087C16.5297 2.44514 16.9114 1.59337 17.6752 0.955898C18.439 0.318738 19.3483 0 20.4033 0C21.3484 0 22.1834 0.222516 22.9089 0.667547C23.634 1.11258 24.2054 1.75828 24.6232 2.60435L22.3977 3.90652C22.1888 3.46719 21.9305 3.13452 21.6229 2.90916C21.3152 2.68411 20.9085 2.57111 20.403 2.57111C20.0073 2.57111 19.7025 2.65626 19.4882 2.82654C19.274 2.99715 19.1667 3.20321 19.1667 3.44471C19.1667 3.73053 19.3012 3.97774 19.5705 4.18664C19.8396 4.39555 20.3973 4.62629 21.2437 4.87888C21.7052 5.02194 22.0622 5.13716 22.3151 5.22515C22.5677 5.31315 22.8893 5.45875 23.2795 5.66195C23.6695 5.86548 23.9661 6.07976 24.1696 6.30481C24.3728 6.53017 24.5542 6.82676 24.7137 7.19487C24.8729 7.5633 24.9527 7.98364 24.9527 8.4559C24.9527 9.55486 24.557 10.4202 23.7657 11.052C22.9744 11.6841 21.9413 11.9997 20.6667 11.9997L20.6673 12Z"
                  fill="#626273"
                />
                <path
                  d="M33.4421 11.7692L32.8651 9.95589H28.5794L28.0023 11.7692H25.1176L29.0408 0.230419H32.4036L36.3269 11.7692H33.4421ZM29.3707 7.48353H32.0741L30.7225 3.2472L29.371 7.48353H29.3707Z"
                  fill="#626273"
                />
                <path
                  d="M44.4697 5.7857C45.4149 6.39026 45.8874 7.25848 45.8874 8.39005C45.8874 9.39026 45.5301 10.2034 44.816 10.8298C44.1016 11.4562 43.2169 11.7692 42.162 11.7692H37.3157V0.230419H41.8321C42.8649 0.230419 43.7303 0.535231 44.4282 1.14517C45.1259 1.75511 45.475 2.54926 45.475 3.527C45.475 4.44998 45.1395 5.20299 44.4694 5.78539L44.4697 5.7857ZM41.8325 2.70309H39.9533V4.74719H41.8325C42.129 4.74719 42.3709 4.65097 42.5576 4.45884C42.7444 4.26671 42.8377 4.02204 42.8377 3.72546C42.8377 3.42888 42.7444 3.18421 42.5576 2.99176C42.3705 2.79963 42.129 2.70341 41.8325 2.70341V2.70309ZM42.162 9.29689C42.4918 9.29689 42.7554 9.19529 42.9533 8.99208C43.1511 8.78887 43.2498 8.52236 43.2498 8.19254C43.2498 7.86273 43.1511 7.59653 42.9533 7.39301C42.7554 7.1898 42.4918 7.08819 42.162 7.08819H39.9533V9.29689H42.162Z"
                  fill="#626273"
                />
                <path
                  d="M49.8433 9.23073H54.4589V11.7692H47.2061V0.230419H54.3766V2.76893H49.8436V4.68104H53.9644V7.18663H49.8436V9.23073H49.8433Z"
                  fill="#626273"
                />
                <path
                  d="M63.69 0.230751V2.76926H60.7229V11.7696H58.0856V2.76926H55.1185V0.230751H63.6903H63.69Z"
                  fill="#626273"
                />
              </svg>
            </span>

            <div className="flex bg-[var(--tab-btn-bg)] rounded-full">
              <ToggleBtn
                active={playMode === "real"}
                onClick={() => setPlayMode("real")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <g clip-path="url(#clip0_161_365)">
                    <path
                      d="M9.22837 3.81346L5.00194 0.625L0.771613 3.81346C0.684156 3.89416 0.631569 4.00573 0.625 4.12453V8.99356C0.625306 9.09431 0.665475 9.19087 0.736737 9.26212C0.807994 9.33337 0.904556 9.3735 1.00533 9.37381H3.54167V7.33362C3.54167 6.94687 3.69531 6.576 3.9688 6.30256C4.24229 6.02909 4.61323 5.87547 5 5.87547C5.38677 5.87547 5.75771 6.02909 6.0312 6.30256C6.30469 6.576 6.45831 6.94687 6.45831 7.33362V9.375H8.99425C9.09506 9.37469 9.19169 9.33456 9.263 9.26331C9.33431 9.19206 9.37456 9.0955 9.375 8.99469V4.12453C9.36825 4.00577 9.31569 3.89426 9.22837 3.81346Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_161_365">
                      <rect width="10" height="10" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Real
              </ToggleBtn>
              <ToggleBtn
                active={playMode === "fun"}
                onClick={() => setPlayMode("fun")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <g clip-path="url(#clip0_161_365)">
                    <path
                      d="M9.22837 3.81346L5.00194 0.625L0.771613 3.81346C0.684156 3.89416 0.631569 4.00573 0.625 4.12453V8.99356C0.625306 9.09431 0.665475 9.19087 0.736737 9.26212C0.807994 9.33337 0.904556 9.3735 1.00533 9.37381H3.54167V7.33362C3.54167 6.94687 3.69531 6.576 3.9688 6.30256C4.24229 6.02909 4.61323 5.87547 5 5.87547C5.38677 5.87547 5.75771 6.02909 6.0312 6.30256C6.30469 6.576 6.45831 6.94687 6.45831 7.33362V9.375H8.99425C9.09506 9.37469 9.19169 9.33456 9.263 9.26331C9.33431 9.19206 9.37456 9.0955 9.375 8.99469V4.12453C9.36825 4.00577 9.31569 3.89426 9.22837 3.81346Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_161_365">
                      <rect width="10" height="10" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Fun
              </ToggleBtn>
            </div>
          </div>
        </div>

        {/* — header — */}
        {game && (
          <header className="mt-12">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--table-cell-primary)] px-8 py-6">
              {/* left: title + chips */}
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-[22px] font-bold leading-[100%]">
                  {game.name}
                </h1>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-[var(--tab-btn-bg)] px-3 py-1 text-sm">
                    {routeProviderId}
                  </span>

                  {/* {game.isPopular && ( */}
                  <span className="rounded bg-[var(--tab-btn-bg)] px-3 py-1 text-sm">
                    Most Popular
                  </span>
                  {/* )} */}

                  {game.recentlyPlayed && (
                    <span className="rounded bg-[var(--tab-btn-bg)] px-3 py-1 text-sm">
                      Recently Played
                    </span>
                  )}
                </div>
              </div>

              {/* right: chevron */}
              <button className="text-white/80 hover:text-white">
                <svg
                  width="16"
                  height="10"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.667 1.333 6 6 1.333 1.333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </header>
        )}

        {/* ███ SAME-PROVIDER CAROUSEL ███ */}
        {sameProvider.length > 0 && (
          <GameCarouselSection
            title={`More Games`}
            games={sameProvider}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.7329 3.58142C18.5889 3.30943 18.4127 2.97669 18.1584 2.65314C17.4741 1.78229 16.1686 1.78229 15.4842 2.65314C15.23 2.97669 15.0538 3.30943 14.9098 3.58142C14.8824 3.63327 14.8561 3.68291 14.8307 3.72986C14.6664 4.03318 14.5027 4.3004 14.2229 4.58022C13.943 4.86003 13.6758 5.02374 13.3725 5.18802C13.3256 5.21343 13.276 5.23969 13.2242 5.26711C12.9522 5.4111 12.6194 5.58731 12.2958 5.84158C11.425 6.52595 11.425 7.83144 12.2958 8.51581C12.6194 8.77008 12.9521 8.94622 13.2241 9.09021C13.276 9.11766 13.3256 9.14394 13.3726 9.16937C13.6759 9.33365 13.9431 9.49737 14.2229 9.77717C14.5027 10.057 14.6664 10.3242 14.8307 10.6275C14.8561 10.6745 14.8824 10.7241 14.9099 10.776C15.0539 11.048 15.23 11.3807 15.4843 11.7042C16.1686 12.5751 17.4741 12.5751 18.1584 11.7042C18.4127 11.3807 18.5889 11.048 18.7329 10.776C18.7603 10.7241 18.7866 10.6745 18.812 10.6275C18.9763 10.3242 19.14 10.057 19.4199 9.77717C19.6996 9.49737 19.9669 9.33365 20.2702 9.16937C20.3172 9.14394 20.3668 9.11766 20.4186 9.09021C20.6906 8.94622 21.0234 8.77008 21.3469 8.51581C22.2177 7.83144 22.2177 6.52595 21.3469 5.84158C21.0234 5.58731 20.6906 5.41117 20.4186 5.26718C20.3668 5.23973 20.3171 5.21345 20.2702 5.18802C19.9669 5.02374 19.6996 4.86003 19.4198 4.58022C19.14 4.3004 18.9763 4.03318 18.812 3.72986C18.7866 3.68291 18.7603 3.63327 18.7329 3.58142ZM9.87482 7.53253C9.9659 8.4314 10.4051 9.3012 11.1924 9.91993C11.5818 10.2259 12.0193 10.4645 12.3011 10.6183C12.3425 10.6408 12.3805 10.6616 12.4145 10.6804C12.7418 10.8618 12.8763 10.9561 12.9602 11.0399C13.0531 11.1328 13.1573 11.2821 13.3316 11.6114L13.3449 11.6366C13.4867 11.9047 13.7258 12.3567 14.0802 12.8077C15.4796 14.5883 18.1633 14.5883 19.5626 12.8077C19.5938 12.768 19.6242 12.7278 19.6541 12.6874C20.0036 13.6479 20.2892 14.659 20.4084 15.551C20.6152 17.1016 20.6908 18.6734 20.2319 19.8804C19.9935 20.5079 19.6035 21.057 19.0059 21.441C18.4144 21.821 17.68 22.0005 16.8157 22.0005C16.652 22.0005 16.4934 21.9443 16.3663 21.8413C15.1257 20.8372 14.4178 19.8193 13.9989 18.9507H8.61439C8.19549 19.8193 7.48764 20.8372 6.24709 21.8413C6.11991 21.9443 5.96125 22.0005 5.79765 22.0005C4.93223 22.0005 4.19378 21.8198 3.59671 21.4412C2.99396 21.0592 2.59272 20.5117 2.34574 19.8814C1.86873 18.6641 1.94768 17.0875 2.2085 15.5277C2.40163 14.3727 2.92498 12.8293 3.48018 11.5233C3.75988 10.8654 4.05555 10.249 4.33375 9.755C4.47262 9.50841 4.61229 9.28309 4.74841 9.09477C4.87615 8.91802 5.03294 8.72805 5.21375 8.59411C5.79772 8.16153 6.77093 7.90397 7.78368 7.74355C8.4265 7.64174 9.13838 7.57169 9.87482 7.53253ZM8.73203 16.1075C8.2389 16.1075 7.83915 15.7078 7.83915 15.2146V14.3219H6.94667C6.45355 14.3219 6.0538 13.9221 6.0538 13.429C6.0538 12.9358 6.45355 12.5361 6.94667 12.5361H7.83915V11.6431C7.83915 11.15 8.2389 10.7503 8.73203 10.7503C9.22516 10.7503 9.62491 11.15 9.62491 11.6431V12.5361H10.5182C11.0113 12.5361 11.4111 12.9358 11.4111 13.429C11.4111 13.9221 11.0113 14.3219 10.5182 14.3219H9.62491V15.2146C9.62491 15.7078 9.22516 16.1075 8.73203 16.1075Z"
                  fill="#4264FF"
                />
              </svg>
            }
            onPlay={handlePlaySame}
            viewAllHref={`/games?provider=${routeProviderId}`}
          />
        )}
      </div>

      {/* ————— drawers  ————— */}
      {statsOpen && (
        <Drawer onClose={() => setStatsOpen(false)}>
          <DrawerHeader
            title="Live Stats"
            onClose={() => setStatsOpen(false)}
          />
          {loadingTxns ? (
            <p className="text-sm text-center text-white/70">
              Loading transactions…
            </p>
          ) : (
            stats && (
              <div className="space-y-4">
                <StatGrid label="Profit" value={stats.profit} />
                <StatGrid label="Wagered" value={stats.wagered} />
                <StatGrid label="Wins" value={stats.wins} />
                <StatGrid label="Losses" value={stats.losses} />
              </div>
            )
          )}
        </Drawer>
      )}

      {kbOpen && (
        <Drawer onClose={() => setKbOpen(false)}>
          <DrawerHeader
            title="Keyboard Shortcuts"
            onClose={() => setKbOpen(false)}
          />
          <ul className="space-y-2 text-sm">
            <li>
              <kbd className="kbd">Space</kbd> – Spin / confirm
            </li>
            <li>
              <kbd className="kbd">Esc</kbd> – Close panels
            </li>
            <li>
              <kbd className="kbd">F</kbd> – Toggle fullscreen
            </li>
          </ul>
        </Drawer>
      )}

      {settingsOpen && (
        <Drawer onClose={() => setSettingsOpen(false)}>
          <DrawerHeader
            title="Game Settings"
            onClose={() => setSettingsOpen(false)}
          />
          <p className="text-sm text-white/70">
            (Put game-specific settings here or send a <code>postMessage</code>{" "}
            into the iframe.)
          </p>
        </Drawer>
      )}
    </MainLayout>
  );
}

/* ————————————————— drawer helpers ————————————————— */
function Drawer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Backdrop"
      />
      <div className="relative h-full w-full max-w-sm overflow-y-auto bg-[var(--surface-l2)] p-6">
        {children}
      </div>
    </div>
  );
}
function DrawerHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-lg font-medium">{title}</h2>
      <button
        onClick={onClose}
        className="text-white/60 hover:text-white"
        aria-label="Close panel"
      >
        <X size={20} />
      </button>
    </div>
  );
}
function StatGrid({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--surface-l3)] px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-semibold">
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
}
