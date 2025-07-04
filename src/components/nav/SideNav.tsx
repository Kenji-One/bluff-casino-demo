"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/navigation";
import { useState } from "react";
import clsx from "clsx";

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"casino" | "sport">("casino");
  const pathname = usePathname();

  // // inside component
  // const [isHydrated, setIsHydrated] = useState(false);

  // useEffect(() => {
  //   setIsHydrated(true);
  // }, []);

  // if (!isHydrated) return null;
  return (
    <aside
      className={clsx(
        " text-white pb-[10px] pt-[20px] flex flex-col transition-all duration-300 bg-[var(--sidenav-background)] rounded-xl m-2 mt-0 self-start",
        collapsed ? "items-center" : "w-60"
        // h-screen/
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
  );
}
