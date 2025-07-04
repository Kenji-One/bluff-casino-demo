"use client";

import { Card, Header, Stat } from "./shared";
import { useAuth } from "@/context/AuthContext";

export default function AccountTab() {
  const { user } = useAuth(); // user is now flat again
  if (!user) return null;
  const { email, username, joinDate } = user ?? {};

  // Format join date to DD/MM/YYYY – fallback to "Unknown" if parse fails
  let formattedJoinDate = "Unknown";
  if (joinDate) {
    const d = new Date(joinDate);
    if (!isNaN(d.getTime())) {
      formattedJoinDate = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }
  return (
    <section className="space-y-6">
      <Header
        title="User Information"
        subtitle="View and edit your user information"
      />

      {/* Username + stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Card className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="images/zd.jpg"
              alt="avatar"
              className="w-[44px] h-[44px] rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{username ?? "Unknown"}</p>
              <p className="text-xs text-gray-500">Unranked</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-[#2A2A30] transition-colors cursor-pointer">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.7312 2.26884C20.706 1.24372 19.044 1.24372 18.0188 2.26884L16.8617 3.42599L20.574 7.1383L21.7312 5.98116C22.7563 4.95603 22.7563 3.29397 21.7312 2.26884Z"
                fill="white"
              />
              <path
                d="M19.5133 8.19896L15.801 4.48665L7.40019 12.8875C6.78341 13.5043 6.33002 14.265 6.081 15.101L5.28122 17.7859C5.2026 18.0498 5.27494 18.3356 5.46967 18.5303C5.6644 18.725 5.95019 18.7974 6.21412 18.7188L8.89901 17.919C9.73498 17.67 10.4957 17.2166 11.1125 16.5998L19.5133 8.19896Z"
                fill="white"
              />
              <path
                d="M5.25 5.24999C3.59315 5.24999 2.25 6.59314 2.25 8.24999V18.75C2.25 20.4068 3.59315 21.75 5.25 21.75H15.75C17.4069 21.75 18.75 20.4068 18.75 18.75V13.5C18.75 13.0858 18.4142 12.75 18 12.75C17.5858 12.75 17.25 13.0858 17.25 13.5V18.75C17.25 19.5784 16.5784 20.25 15.75 20.25H5.25C4.42157 20.25 3.75 19.5784 3.75 18.75V8.24999C3.75 7.42156 4.42157 6.74999 5.25 6.74999H10.5C10.9142 6.74999 11.25 6.41421 11.25 5.99999C11.25 5.58578 10.9142 5.24999 10.5 5.24999H5.25Z"
                fill="white"
              />
            </svg>
          </button>
        </Card>

        <Card className="flex-1 min-w-[260px] grid grid-cols-3 gap-4 text-sm text-gray-300">
          <Stat label="Join Date" value={formattedJoinDate} />
          <Stat label="Total Bets" value="1000" />
          <Stat
            label="Total Wagered"
            value={
              <span className="flex items-center gap-2 ">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_42_30901)">
                    <path
                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                      fill="#6CDE07"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.25 9.577C11.25 10.862 10.207 11.715 8.667 11.8435V13H7.612V11.832C6.57034 11.7145 5.58064 11.3144 4.75 10.675L5.526 9.612C6.2175 10.1495 6.872 10.5 7.6605 10.617V8.327C5.89 7.883 5.0655 7.2405 5.0655 5.9205C5.0655 4.659 6.096 3.7945 7.612 3.6775V3H8.667V3.701C9.49156 3.79259 10.2777 4.09877 10.947 4.589L10.2675 5.687C9.734 5.3015 9.1885 5.056 8.6185 4.9395V7.159C10.462 7.603 11.25 8.3155 11.25 9.577ZM7.66 6.9135V4.8575C6.8965 4.916 6.4965 5.325 6.4965 5.839C6.4965 6.329 6.7265 6.645 7.6605 6.914L7.66 6.9135ZM9.819 9.6585C9.819 9.1335 9.564 8.818 8.6185 8.549V10.664C9.3825 10.605 9.819 10.2195 9.819 9.659V9.6585Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_42_30901">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                $10,000.00
              </span>
            }
          />
        </Card>
        {/* Email */}
        <Card className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white text-sm mb-2">Email</p>
            <div className="w-full bg-[var(--surface-l3)] py-[10px] px-4 rounded-full flex items-center justify-between gap-2">
              <p>{email ?? "Not available"}</p>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.875 10C1.875 5.51269 5.51269 1.875 10 1.875C14.4873 1.875 18.125 5.51269 18.125 10C18.125 14.4873 14.4873 18.125 10 18.125C5.51269 18.125 1.875 14.4873 1.875 10ZM13.0086 8.48827C13.2092 8.20739 13.1442 7.81705 12.8633 7.61642C12.5824 7.41579 12.192 7.48084 11.9914 7.76173L9.29525 11.5364L7.94194 10.1831C7.69786 9.93898 7.30214 9.93898 7.05806 10.1831C6.81398 10.4271 6.81398 10.8229 7.05806 11.0669L8.93306 12.9419C9.06297 13.0719 9.24346 13.138 9.42655 13.1229C9.60964 13.1077 9.7768 13.0128 9.88358 12.8633L13.0086 8.48827Z"
                  fill="#C0FF03"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
