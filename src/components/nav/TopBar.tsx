"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import CustomSelect, { SelectOption } from "../settings/shared/CustomSelect";
import Button from "@/components/form/Button";
import { CurrencyIcon } from "../settings/shared";
/* ─── tiny placeholder icons – swap for real SVGs ─────────────── */
const DollarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
  >
    <path
      d="M10.3169 20C15.8397 20 20.3169 15.5228 20.3169 10C20.3169 4.47715 15.8397 0 10.3169 0C4.79405 0 0.316895 4.47715 0.316895 10C0.316895 15.5228 4.79405 20 10.3169 20Z"
      fill="#6CDE07"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.3794 11.9712C14.3794 13.5775 13.0756 14.6438 11.1506 14.8044V16.25H9.83189V14.79C8.52982 14.6432 7.29269 14.1431 6.25439 13.3438L7.22439 12.015C8.08877 12.6869 8.90689 13.125 9.89252 13.2712V10.4087C7.67939 9.85375 6.64877 9.05062 6.64877 7.40062C6.64877 5.82375 7.93689 4.74313 9.83189 4.59688V3.75H11.1506V4.62625C12.1813 4.74074 13.164 5.12346 14.0006 5.73625L13.1513 7.10875C12.4844 6.62687 11.8025 6.32 11.09 6.17437V8.94875C13.3944 9.50375 14.3794 10.3944 14.3794 11.9712ZM9.89189 8.64187V6.07188C8.93752 6.145 8.43752 6.65625 8.43752 7.29875C8.43752 7.91125 8.72502 8.30625 9.89252 8.6425L9.89189 8.64187ZM12.5906 12.0731C12.5906 11.4169 12.2719 11.0225 11.09 10.6862V13.33C12.045 13.2562 12.5906 12.7744 12.5906 12.0738V12.0731Z"
      fill="white"
    />
  </svg>
);
const DepositIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
  >
    <path
      d="M2.21112 4.6877C2.87221 4.10411 3.74065 3.75 4.6918 3.75H15.9418C16.893 3.75 17.7614 4.10412 18.4225 4.6877C18.2688 3.45438 17.2168 2.5 15.9418 2.5H4.6918C3.41686 2.5 2.36481 3.45438 2.21112 4.6877Z"
      fill="white"
    />
    <path
      d="M2.21112 7.1877C2.87221 6.60411 3.74065 6.25 4.6918 6.25H15.9418C16.893 6.25 17.7614 6.60412 18.4225 7.1877C18.2688 5.95438 17.2168 5 15.9418 5H4.6918C3.41686 5 2.36481 5.95438 2.21112 7.1877Z"
      fill="white"
    />
    <path
      d="M4.69189 7.5C3.31118 7.5 2.19189 8.61929 2.19189 10V15C2.19189 16.3807 3.31118 17.5 4.69189 17.5H15.9419C17.3226 17.5 18.4419 16.3807 18.4419 15V10C18.4419 8.61929 17.3226 7.5 15.9419 7.5H12.8169C12.4717 7.5 12.1919 7.77982 12.1919 8.125C12.1919 9.16053 11.3524 10 10.3169 10C9.28136 10 8.44189 9.16053 8.44189 8.125C8.44189 7.77982 8.16207 7.5 7.81689 7.5H4.69189Z"
      fill="white"
    />
  </svg>
);
const CrownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
  >
    <g clip-path="url(#clip0_166_636)">
      <path
        d="M2.05859 11.0927H11.9413C12.116 11.0928 12.2885 11.0191 12.4475 11.1176L13.1723 4.36742C13.1829 4.26593 13.173 4.16243 13.1436 4.06808C13.1142 3.97375 13.0664 3.89219 13.0055 3.83225C12.9444 3.77231 12.8726 3.73627 12.7977 3.72805C12.7227 3.71982 12.6476 3.73972 12.5804 3.78559L10.23 6.22673C10.1858 6.27601 10.1346 6.31223 10.0796 6.33311C10.0247 6.35399 9.96713 6.35906 9.91072 6.34801C9.85423 6.33695 9.80004 6.31002 9.75162 6.2689C9.70319 6.22779 9.66152 6.17339 9.62932 6.10917L7.30961 0.60394C7.27106 0.543588 7.22348 0.495205 7.17007 0.462052C7.11665 0.428898 7.05864 0.411743 6.99996 0.411743C6.94127 0.411743 6.88326 0.428898 6.82985 0.462052C6.77644 0.495205 6.72885 0.543588 6.6903 0.60394L4.3706 6.10917C4.33839 6.17339 4.29675 6.22779 4.24831 6.2689C4.19987 6.31002 4.1457 6.33695 4.08923 6.34801C4.03275 6.35906 3.97521 6.35399 3.92025 6.33311C3.86528 6.31223 3.8141 6.27601 3.76995 6.22673L1.41951 3.78634C1.35228 3.74047 1.27715 3.72057 1.20223 3.7288C1.1273 3.73702 1.05547 3.77305 0.994493 3.833C0.933519 3.89293 0.885738 3.9745 0.856322 4.06883C0.826913 4.16317 0.816992 4.26668 0.827638 4.36817L1.55238 11.1176C1.71133 11.0189 1.88392 11.0931 2.05859 11.0927Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M11.9411 11.1567H2.05878C1.73116 11.1567 1.41695 11.2848 1.1853 11.5128C0.953637 11.7408 0.823486 12.05 0.823486 12.3725C0.823486 12.6949 0.953637 13.0042 1.1853 13.2321C1.41695 13.4602 1.73116 13.5882 2.05878 13.5882H11.9411C12.2687 13.5882 12.583 13.4602 12.8147 13.2321C13.0463 13.0042 13.1764 12.6949 13.1764 12.3725C13.1764 12.05 13.0463 11.7408 12.8147 11.5128C12.583 11.2848 12.2687 11.1567 11.9411 11.1567Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_166_636">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
const WalletIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M2.27307 5.62524C3.06638 4.92494 4.10851 4.5 5.24989 4.5H18.7499C19.8913 4.5 20.9334 4.92494 21.7267 5.62524C21.5423 4.14526 20.2798 3 18.7499 3H5.24989C3.71995 3 2.4575 4.14525 2.27307 5.62524Z"
      fill="white"
    />
    <path
      d="M2.27307 8.62524C3.06638 7.92494 4.10851 7.5 5.24989 7.5H18.7499C19.8913 7.5 20.9334 7.92494 21.7267 8.62524C21.5423 7.14526 20.2798 6 18.7499 6H5.24989C3.71995 6 2.4575 7.14525 2.27307 8.62524Z"
      fill="white"
    />
    <path
      d="M5.25 9C3.59315 9 2.25 10.3431 2.25 12V18C2.25 19.6569 3.59315 21 5.25 21H18.75C20.4069 21 21.75 19.6569 21.75 18V12C21.75 10.3431 20.4069 9 18.75 9H15C14.5858 9 14.25 9.33579 14.25 9.75C14.25 10.9926 13.2426 12 12 12C10.7574 12 9.75 10.9926 9.75 9.75C9.75 9.33579 9.41421 9 9 9H5.25Z"
      fill="white"
    />
  </svg>
);
const HistoryIcon = () => (
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
      d="M12.1097 2.1046C12.0427 2.03763 11.9518 2 11.8571 2C11.7624 2 11.6716 2.03763 11.6046 2.1046L8.84559 4.8636L6.12851 3.23337C6.0073 3.16064 5.85459 3.16625 5.73904 3.24768C5.62349 3.32911 5.56684 3.47104 5.59456 3.60966L6.66566 8.96516H17.0486L18.1197 3.60966C18.1474 3.47104 18.0907 3.32911 17.9751 3.24768C17.8597 3.16625 17.707 3.16064 17.5857 3.23337L14.8687 4.8636L12.1097 2.1046ZM4 15.7545C4 13.6903 4.53996 12.032 5.36121 10.7509H18.3534C19.1733 12.0338 19.7143 13.6945 19.7143 15.7545C19.7143 17.8454 18.7736 19.4609 17.2707 20.515C15.8091 21.5403 13.8756 22 11.8571 22C9.83871 22 7.90516 21.5403 6.44361 20.515C4.94077 19.4609 4 17.8454 4 15.7545ZM6.20881 14.6599C6.16587 15.0038 6.14286 15.3684 6.14286 15.7545C6.14286 17.1204 6.72113 18.0923 7.67421 18.7609C8.66861 19.4583 10.1279 19.8571 11.8571 19.8571C13.5864 19.8571 15.0457 19.4583 16.0401 18.7609C16.9931 18.0923 17.5714 17.1204 17.5714 15.7545C17.5714 15.5853 17.567 15.4202 17.5583 15.2592C15.5036 14.7675 13.7404 13.6739 12.6552 12.3151C11.2041 13.7096 8.81214 14.6866 6.20881 14.6599Z"
      fill="white"
    />
  </svg>
);
const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9.59353 3.94017C9.68394 3.39771 10.1533 3.00012 10.7032 3.00012H13.2972C13.8471 3.00012 14.3165 3.39771 14.4069 3.94017L14.6204 5.22122C14.6827 5.59527 14.9327 5.90683 15.2645 6.09048C15.3386 6.13154 15.412 6.17396 15.4844 6.21769C15.8094 6.41396 16.2048 6.47499 16.5603 6.34178L17.7772 5.8859C18.2922 5.69297 18.8712 5.90063 19.1461 6.3769L20.4431 8.62333C20.7181 9.0996 20.6084 9.70485 20.1839 10.0544L19.1795 10.8812C18.887 11.122 18.742 11.4938 18.749 11.8727C18.7498 11.915 18.7502 11.9575 18.7502 12.0001C18.7502 12.0427 18.7498 12.0852 18.749 12.1276C18.742 12.5064 18.887 12.8782 19.1795 13.119L20.1839 13.9458C20.6084 14.2954 20.7181 14.9006 20.4431 15.3769L19.1461 17.6233C18.8712 18.0996 18.2922 18.3073 17.7772 18.1143L16.5603 17.6585C16.2048 17.5252 15.8094 17.5863 15.4844 17.7825C15.412 17.8263 15.3386 17.8687 15.2645 17.9098C14.9327 18.0934 14.6827 18.405 14.6204 18.779L14.4069 20.0601C14.3165 20.6025 13.8471 21.0001 13.2972 21.0001H10.7032C10.1533 21.0001 9.68394 20.6025 9.59353 20.0601L9.38002 18.779C9.31768 18.405 9.06771 18.0934 8.73594 17.9098C8.66176 17.8687 8.58844 17.8263 8.51601 17.7826C8.19098 17.5863 7.79565 17.5253 7.44008 17.6585L6.22322 18.1143C5.70822 18.3073 5.12923 18.0996 4.85426 17.6233L3.55728 15.3769C3.28231 14.9006 3.39196 14.2954 3.81654 13.9459L4.82089 13.119C5.1134 12.8782 5.2584 12.5064 5.25138 12.1276C5.2506 12.0852 5.2502 12.0427 5.2502 12.0001C5.2502 11.9575 5.2506 11.9151 5.25138 11.8727C5.2584 11.4939 5.1134 11.122 4.82089 10.8812L3.81654 10.0544C3.39196 9.70487 3.28231 9.09961 3.55728 8.62335L4.85426 6.37691C5.12923 5.90065 5.70822 5.69298 6.22321 5.88591L7.44007 6.34179C7.79563 6.475 8.19096 6.41397 8.516 6.2177C8.58843 6.17396 8.66176 6.13154 8.73594 6.09048C9.06771 5.90683 9.31768 5.59527 9.38002 5.22122L9.59353 3.94017Z"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M15 12C15 13.6569 13.6568 15 12 15C10.3431 15 8.99997 13.6569 8.99997 12C8.99997 10.3432 10.3431 9.00004 12 9.00004C13.6568 9.00004 15 10.3432 15 12Z"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
/* ─────────────────────────────────────────────────────────────── */

interface Props {
  /* needed for NOT-logged-in modal buttons */
  setIsModalOpen?: Dispatch<SetStateAction<boolean>>;
  setMode?: (m: "register" | "login") => void;
}

export default function TopBar({ setIsModalOpen, setMode }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  /* ===== logged-in view data ===== */
  const [balance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  // const currOpts: SelectOption<string>[] = [
  //   { label: "USD", value: "USD" },
  //   { label: "EUR", value: "EUR" },
  //   { label: "THB", value: "THB" },
  // ];

  /* avatar pop-over */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) =>
      menuRef.current && !menuRef.current.contains(e.target as Node)
        ? setMenuOpen(false)
        : null;
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ═══════════ RENDER ═══════════ */
  return (
    <header className="flex items-center justify-between px-6 pb-2 pt-0">
      {/* logo */}
      <Link href="/">
        <img src="/logo.svg" alt="Visabet" className="h-[22px] w-auto" />
      </Link>

      {user ? (
        /* ───────────── LOGGED-IN VIEW ───────────── */
        <>
          {/* wallet & deposit block */}
          <div className="flex items-center gap-2">
            {/* balance pill */}
            <div className="flex items-center gap-2 bg-[var(--surface-l3)] rounded-full pl-3 pr-4 py-[6px]">
              {/* currency icon – visible */}
              <DollarIcon />

              {/* balance */}
              <span className="text-sm font-semibold">
                {balance.toFixed(2)}
              </span>

              {/* arrow only (no icon, no label) */}
              <CustomSelect
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "USD", label: "USD", icon: <DollarIcon /> },
                  {
                    value: "EUR",
                    label: "EUR",
                    icon: <CurrencyIcon symbol="€" />,
                  },
                  {
                    value: "THB",
                    label: "THB",
                    icon: <CurrencyIcon symbol="£" />,
                  },
                ]}
                hideSelectedIcon // 👈 hide icon in trigger
                hideSelectedLabel // 👈 hide label in trigger
                className="bg-transparent pl-0 !py-[14px] !h-full" // no extra padding
                boxClassName="w-6" // just wide enough for the caret
              />
            </div>

            {/* deposit button */}
            <button
              onClick={() => router.push("/deposit")}
              className="flex items-center gap-[6px] bg-[var(--color-blue)] text-white text-sm font-semibold rounded-full px-3 py-[10px]"
            >
              <DepositIcon />
              Deposit
            </button>
          </div>

          {/* avatar & menu */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((o) => !o)}>
              <img
                src={user.avatarUrl || "images/zd.jpg"}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-4 w-60 rounded-2xl overflow-hidden bg-[var(--profile-img-modal-bg)] shadow-xl z-50">
                {/* header */}
                <div className="bg-[var(--surface-l3)] px-5 py-4 flex items-center gap-3">
                  <img
                    src={user.avatarUrl || "images/zd.jpg"}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-semibold">{user.username}</span>
                </div>

                {/* rank */}
                <div className="px-5 py-3 border-b border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-white/80">
                      <CrownIcon /> Unranked
                    </div>
                    <span className="text-white/60">0.00%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                </div>

                {/* links */}
                <nav className="flex flex-col">
                  <MenuItem href="/wallet" icon={<WalletIcon />}>
                    Wallet
                  </MenuItem>
                  <MenuItem href="/transactions" icon={<HistoryIcon />}>
                    Transaction History
                  </MenuItem>
                  <MenuItem href="/settings" icon={<CogIcon />}>
                    Settings
                  </MenuItem>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-5 py-3 text-left text-sm hover:bg-white/5"
                  >
                    <span className="text-red-500 font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ───────────── GUEST VIEW (old design) ───────────── */
        <>
          {/* search (desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--burger-btn-bg)] p-[14px] rounded-full w-full max-w-[415px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="18"
              viewBox="0 0 19 18"
              fill="none"
            >
              <path
                d="M12.9866 12.69L15.2966 15M14.5669 8.625C14.5669 10.1168 13.9743 11.5476 12.9194 12.6025C11.8645 13.6574 10.4337 14.25 8.94189 14.25C7.45005 14.25 6.01931 13.6574 4.96442 12.6025C3.90953 11.5476 3.31689 10.1168 3.31689 8.625C3.31689 7.13316 3.90953 5.70242 4.96442 4.64752C6.01931 3.59263 7.45005 3 8.94189 3C10.4337 3 11.8645 3.59263 12.9194 4.64752C13.9743 5.70242 14.5669 7.13316 14.5669 8.625Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="search slots.."
              className="bg-transparent text-sm tracking-[-0.28px] leading-[100%] text-[var(--input-text-color)] placeholder:text-[var(--input-text-color)] outline-none w-full"
            />
          </div>

          {/* auth buttons */}
          <div className="flex items-center gap-2 w-full max-w-[248px] justify-end">
            <Button
              variant="login"
              label="Log in"
              fullWidth
              onClick={() => {
                setMode?.("login");
                setIsModalOpen?.(true);
              }}
            />
            <Button
              variant="signup"
              label="Sign up"
              fullWidth
              onClick={() => {
                setMode?.("register");
                setIsModalOpen?.(true);
              }}
            />
          </div>
        </>
      )}
    </header>
  );
}

/* helper row in avatar pop-over */
function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-white/5"
    >
      {icon}
      {children}
    </Link>
  );
}
