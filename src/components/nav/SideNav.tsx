"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  Menu as MenuIcon,
  Search,
  MessageSquare,
  Crown,
  Volleyball as Baseball,
} from "lucide-react";

export default function SideNav({
  onOpenSearch,
}: {
  onOpenSearch: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"casino" | "sport">("casino");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileTabs: {
    key: "menu" | "search" | "chat" | "rewards" | "sports";
    label: string;
    href?: string;
    icon: React.ReactNode;
  }[] = [
    { key: "menu", label: "Menu", icon: <MenuIcon size={20} /> },
    {
      key: "search",
      label: "Search",
      href: "/search",
      icon: <Search size={20} />,
    },
    {
      key: "chat",
      label: "Chat",
      href: "/chat",
      icon: <MessageSquare size={20} />,
    },
    {
      key: "rewards",
      label: "Rewards",
      href: "/promotions",
      icon: <Crown size={20} />,
    },
    {
      key: "sports",
      label: "Sports",
      href: "/sports",
      icon: <Baseball size={20} />,
    },
  ];

  return (
    <>
      {/* ───────── DESKTOP SIDENAV (unchanged design) ───────── */}
      <aside
        className={clsx(
          "hidden lg:flex text-white pb-[10px] pt-[20px] flex-col transition-all duration-300 bg-[var(--sidenav-background)] rounded-xl m-2 mt-0 self-start",
          collapsed ? "items-center" : "w-60"
        )}
      >
        {/* Top: Logo and Collapse Toggle */}
        <div
          className={clsx(
            "flex items-center gap-4 mb-6 w-full border-b border-[var(--border-b-color)] pb-[20px] px-4",
            collapsed && "justify-center"
          )}
        >
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="bg-[var(--burger-btn-bg)] hover:bg-[var(--burger-btn-bg-hover)] p-[7px] rounded-full transition cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M2 2.66669H14V4.00002H2V2.66669ZM2 7.33335H10V8.66669H2V7.33335ZM2 12H14V13.3334H2V12Z"
                fill="#A0A0E1"
              />
            </svg>
          </button>
          {!collapsed ? (
            <div className="flex bg-[var(--burger-btn-bg)] w-full rounded-full overflow-hidden">
              <button
                onClick={() => setActiveTab("casino")}
                className={clsx(
                  "flex-1 text-center py-2 px-3 text-sm font-semibold leading-[100%] rounded-l-full transition-all cursor-pointer",
                  activeTab === "casino"
                    ? "bg-[var(--color-blue)] text-white"
                    : "text-[var(--color-accent)]"
                )}
              >
                Casino
              </button>
              <button
                onClick={() => setActiveTab("sport")}
                className={clsx(
                  "flex-1 text-center py-2 px-3 text-sm font-semibold leading-[100%] rounded-r-full transition-all cursor-pointer",
                  activeTab === "sport"
                    ? "bg-[var(--color-blue)] text-white"
                    : "text-[var(--color-accent)]"
                )}
              >
                Sport
              </button>
            </div>
          ) : (
            ""
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 w-full space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isLink = !item.children && item.href && item.href !== "#";

            return (
              <div
                key={index}
                className={clsx(
                  "relative group",
                  collapsed && "flex justify-center",
                  item.label === "Promotions" &&
                    "border-y border-[var(--border-b-color)] py-4 my-4",
                  item.label === "Providers" &&
                    "border-b border-[var(--border-b-color)] pb-4 mb-4"
                )}
              >
                {isLink ? (
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-4 text-sm font-medium text-white hover:text-[var(--color-brand)] p-3 mx-4 rounded-full hover:bg-[#A361FF1A] transition-all",
                      isActive && "bg-[#201c2c]",
                      collapsed && "p-[8px]"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-[22px] h-[22px] transition",
                        isActive ? "text-[var(--color-brand)]" : "text-white",
                        "group-hover:text-[var(--color-brand)]"
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={clsx(
                          "flex-1 truncate text-[15px] font-medium leading-full transition-all",
                          isActive ? "text-[var(--color-brand)]" : "text-white",
                          "group-hover:text-[var(--color-brand)]"
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                ) : (
                  <div
                    className={clsx(
                      "flex items-center gap-4 text-sm font-medium text-white hover:text-[var(--color-brand)] p-3 mx-4 rounded-full hover:bg-[#A361FF1A] transition-all cursor-pointer",
                      isActive && "bg-[#201c2c]",
                      collapsed && "p-[8px]"
                    )}
                    onClick={() => item.children && setPromoOpen(!promoOpen)}
                  >
                    <Icon
                      className={clsx(
                        "w-[22px] h-[22px] transition",
                        isActive ? "text-[var(--color-brand)]" : "text-white",
                        "group-hover:text-[var(--color-brand)]"
                      )}
                    />
                    {!collapsed && (
                      <span
                        className={clsx(
                          "flex-1 truncate text-[15px] font-medium leading-full transition-all",
                          isActive ? "text-[var(--color-brand)]" : "text-white",
                          "group-hover:text-[var(--color-brand)]"
                        )}
                      >
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.label === "Promotions" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12.6666 6L7.99992 10.6667L3.33325 6"
                          stroke="#626273"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}

                {/* Dropdown for Promotions */}
                {item.children && promoOpen && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, cIndex) => (
                      <div
                        key={cIndex}
                        className="flex items-center justify-between text-sm font-medium text-white hover:text-[var(--color-brand)] p-3 rounded-full hover:bg-[#A361FF1A] transition-all cursor-pointer"
                      >
                        <span>{child.label}</span>
                        <span className="text-blue-400">{child.badge}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ───────── MOBILE BOTTOM TABS (Shuffle-style) ───────── */}
      <div className="lg:hidden">
        {/* spacer so content isn't hidden behind the bar */}
        {/* <div className="h-14" /> */}
        <nav
          className={clsx(
            "fixed inset-x-0 bottom-0 z-50",
            "bg-[var(--sidenav-background)] border-t border-[var(--border-b-color)]",
            "grid grid-cols-5 divide-x divide-[var(--border-b-color)]"
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {mobileTabs.map((t) => {
            const isActive = false; // no active state for search modal
            const content = (
              <div className="flex flex-col items-center justify-center py-3">
                <div
                  className={clsx(
                    "leading-none",
                    isActive ? "text-[var(--color-brand)]" : "text-white"
                  )}
                >
                  {t.icon}
                </div>
                <span
                  className={clsx(
                    "mt-1 text-xs font-medium",
                    isActive ? "text-[var(--color-brand)]" : "text-white"
                  )}
                >
                  {t.label}
                </span>
              </div>
            );

            if (t.key === "menu") {
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setMobileMenuOpen((s) => !s)}
                  className="w-full text-center cursor-pointer"
                >
                  {content}
                </button>
              );
            }

            if (t.key === "search") {
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={onOpenSearch}
                  className="w-full text-center cursor-pointer"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link key={t.key} href={t.href!} className="w-full text-center">
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Mobile full menu (opens from Menu tab) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl bg-[var(--sidenav-background)] border-t border-[var(--border-b-color)] py-4 flex flex-col">
              {/* Casino/Sport switch (fixed at top) */}
              <div className=" px-4 pb-4">
                <div className="flex bg-[var(--burger-btn-bg)] rounded-full overflow-hidden">
                  <button
                    onClick={() => setActiveTab("casino")}
                    className={clsx(
                      "flex-1 text-center py-4 px-3 text-sm font-semibold leading-[100%] rounded-l-full transition-all cursor-pointer",
                      activeTab === "casino"
                        ? "bg-[var(--color-blue)] text-white"
                        : "text-[var(--color-accent)]"
                    )}
                  >
                    Casino
                  </button>
                  <button
                    onClick={() => setActiveTab("sport")}
                    className={clsx(
                      "flex-1 text-center py-4 px-3 text-sm font-semibold leading-[100%] rounded-r-full transition-all cursor-pointer",
                      activeTab === "sport"
                        ? "bg-[var(--color-blue)] text-white"
                        : "text-[var(--color-accent)]"
                    )}
                  >
                    Sport
                  </button>
                </div>
              </div>

              {/* Scrollable nav (only this part scrolls) */}
              <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-2 border-t border-[var(--border-b-color)] pt-4">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const isLink =
                    !item.children && item.href && item.href !== "#";
                  return isLink ? (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "relative flex items-center gap-3 py-4 pl-[25px] pr-6 rounded-xl transition",
                        "bg-transparent hover:bg-[#A361FF1A]",
                        isActive &&
                          "bg-[#201c2c] text-[var(--color-brand)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[var(--color-brand)]"
                      )}
                    >
                      <Icon
                        className={clsx(
                          "w-[22px] h-[22px]",
                          isActive ? "text-[var(--color-brand)]" : "text-white"
                        )}
                      />
                      <span
                        className={clsx(
                          "text-[14px] font-medium",
                          isActive ? "text-[var(--color-brand)]" : "text-white"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={index}
                      className={clsx(
                        "py-2 border-y border-[var(--border-b-color)]",
                        promoOpen && "bg-[var(--color-bg)]"
                      )}
                    >
                      <div
                        className={clsx(
                          "flex items-center justify-between py-2 pl-[25px] pr-6 rounded-xl transition cursor-pointer",
                          "bg-transparent hover:bg-[#A361FF1A]"
                        )}
                        onClick={() => setPromoOpen((s) => !s)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-[22px] h-[22px] text-white" />
                          <span className="text-[15px] font-medium text-white">
                            {item.label}
                          </span>
                        </div>
                        <div className="border border-[var(--border-b-color)] p-2 bg-[var(--border-b-color)] rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M12.6666 6L7.99992 10.6667L3.33325 6"
                              stroke="#626273"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Promotions children on mobile */}
                      <div
                        className={clsx(
                          "ml-2 mt-1 space-y-1 overflow-hidden transition-all duration-300",
                          promoOpen
                            ? "max-h-40 opacity-100"
                            : "max-h-0 opacity-0"
                        )}
                      >
                        {navItems
                          .find((i) => i.children)
                          ?.children?.map((child, cIndex) => (
                            <div
                              key={cIndex}
                              className="flex items-center justify-between text-sm font-medium text-white p-3 rounded-xl hover:bg-[#A361FF1A] transition"
                            >
                              <span>{child.label}</span>
                              <span className="text-blue-400">
                                {child.badge}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Close button (fixed at bottom) */}
              <div className="pt-4 px-4 border-t border-[var(--border-b-color)]">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#A361FF1A] text-white font-semibold cursor-pointer "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
