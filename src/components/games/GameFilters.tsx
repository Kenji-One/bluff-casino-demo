"use client";

import CustomSelect, { SelectOption } from "../settings/shared/CustomSelect";

/* ---------- types ---------- */
interface Filters {
  search: string;
  type: string;
  category: string;
  provider: string;
}
interface Props {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  providers: string[];
}

/* ---------- external “Sort” icon (never inside <option>) ---------- */
const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M15.625 10.625L16.875 10.625C17.2202 10.625 17.5 10.3452 17.5 9.99999C17.5 9.65482 17.2202 9.375 16.875 9.375L15.625 9.37501C15.2798 9.37502 15 9.65484 15 10C15 10.3452 15.2798 10.625 15.625 10.625Z"
      fill="white"
    />
    <path
      d="M10 5C10 4.65482 10.2798 4.375 10.625 4.375L16.875 4.37501C17.2202 4.37501 17.5 4.65484 17.5 5.00001C17.5 5.34519 17.2202 5.62501 16.875 5.62501L10.625 5.625C10.2798 5.625 10 5.34518 10 5Z"
      fill="white"
    />
    <path
      d="M10 15C10 14.6548 10.2798 14.375 10.625 14.375L16.875 14.375C17.2202 14.375 17.5 14.6548 17.5 15C17.5 15.3452 17.2202 15.625 16.875 15.625L10.625 15.625C10.2798 15.625 10 15.3452 10 15Z"
      fill="white"
    />
    <path
      d="M3.12501 5.62501L4.37501 5.625C4.72018 5.625 5 5.34517 5 4.99999C5 4.65482 4.72017 4.375 4.37499 4.375L3.12499 4.37501C2.77982 4.37502 2.5 4.65484 2.5 5.00002C2.5 5.3452 2.77983 5.62502 3.12501 5.62501Z"
      fill="white"
    />
    <path
      d="M4.37501 15.625L3.12501 15.625C2.77983 15.625 2.5 15.3452 2.5 15C2.5 14.6548 2.77982 14.375 3.12499 14.375L4.37499 14.375C4.72017 14.375 5 14.6548 5 15C5 15.3452 4.72018 15.625 4.37501 15.625Z"
      fill="white"
    />
    <path
      d="M2.5 10C2.5 9.65482 2.77982 9.375 3.125 9.375H9.375C9.72018 9.375 10 9.65482 10 10C10 10.3452 9.72018 10.625 9.375 10.625H3.125C2.77982 10.625 2.5 10.3452 2.5 10Z"
      fill="white"
    />
    <path
      d="M7.5 3.125C6.46447 3.125 5.625 3.96447 5.625 5C5.625 6.03553 6.46447 6.875 7.5 6.875C8.53553 6.875 9.375 6.03553 9.375 5C9.375 3.96447 8.53553 3.125 7.5 3.125Z"
      fill="white"
    />
    <path
      d="M10.625 10C10.625 8.96447 11.4645 8.125 12.5 8.125C13.5355 8.125 14.375 8.96447 14.375 10C14.375 11.0355 13.5355 11.875 12.5 11.875C11.4645 11.875 10.625 11.0355 10.625 10Z"
      fill="white"
    />
    <path
      d="M7.5 13.125C6.46447 13.125 5.625 13.9645 5.625 15C5.625 16.0355 6.46447 16.875 7.5 16.875C8.53553 16.875 9.375 16.0355 9.375 15C9.375 13.9645 8.53553 13.125 7.5 13.125Z"
      fill="white"
    />
  </svg>
);

/* ---------- component ---------- */
export default function GameFilters({
  filters,
  onFilterChange,
  providers,
}: Props) {
  const providerOptions: SelectOption[] = [
    { label: "All Providers", value: "" },
    ...providers.map((p) => ({ label: p, value: p })),
  ];

  const sortOptions: SelectOption[] = [
    { label: "Sort by: Featured", value: "featured" },
  ];

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
      {/* SEARCH */}
      <div className="relative flex-1">
        <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--secondary-text)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M17.5 17.5L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <input
          placeholder="Search"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-full bg-[var(--surface-l3)] text-sm text-white placeholder-[var(--secondary-text)] focus:outline-none"
        />
      </div>

      {/* PROVIDER SELECT */}
      <div className="relative min-w-[9.5rem]">
        <CustomSelect
          value={filters.provider}
          onChange={(v) => onFilterChange("provider", v)}
          options={providerOptions}
          boxClassName="w-full"
          className="!py-2 !bg-[var(--surface-l3)]"
        />
      </div>

      {/* SORT SELECT WITH ICON OUTSIDE */}
      <div className="relative min-w-[9.5rem]">
        {/* icon ON TOP of the button */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
          <SortIcon />
        </div>

        {/* text shifted by pl-12 so it clears the icon */}
        <CustomSelect
          value="featured"
          onChange={() => {}}
          options={sortOptions}
          className="pl-12 !py-2 !bg-[var(--surface-l3)]"
        />
      </div>
    </div>
  );
}
