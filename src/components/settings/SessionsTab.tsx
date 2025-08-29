// src/components/settings/SessionsTab.tsx
"use client";

import { Laptop, Smartphone, LogOut, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Header, Toggle, ButtonSecondary } from "./shared";
import userSettingsApi from "@/services/userSettings";

/* ===================== Types ===================== */

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiDeviceInfo {
  browser: { name?: string; version?: string; major?: string };
  device: {
    type?:
      | "desktop"
      | "mobile"
      | "tablet"
      | "smarttv"
      | "wearable"
      | "embedded"
      | "console"
      | "unknown"
      | string;
    vendor?: string;
    model?: string;
  };
  os: { name?: string; version?: string };
  cpu: { architecture?: string };
}

interface ApiSession {
  id: string;
  deviceInfo: ApiDeviceInfo;
  ipAddress: string;
  location: string | null;
  userAgent: string;
  isActive: boolean;
  lastUsedAt: string; // ISO
  createdAt: string; // ISO
}

/** View model */
interface SessionVM {
  id: string;
  deviceLabel: string;
  locationLabel: string;
  ip: string;
  lastUsedLabel: string;
  isCurrent: boolean;
  isActive: boolean;
  deviceType: NonNullable<ApiDeviceInfo["device"]["type"]>;
}

/* ===================== Helpers ===================== */

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

/** Envelope guard */
function isEnvelope<T>(v: unknown): v is ApiResponse<T> {
  return isRecord(v) && "success" in v && "data" in v;
}

/** Axios-like guard (has data but no success on the same level) */
function isAxiosLike<T>(v: unknown): v is { data: T } {
  return isRecord(v) && "data" in v && !("success" in v);
}

/** First unwrap Axios if needed; otherwise return the value as-is */
function unwrapAxios<T>(res: unknown): T {
  if (isAxiosLike<T>(res)) return res.data;
  return res as T;
}

function normalizeSession(raw: any): ApiSession | null {
  try {
    const id = String(raw?.id ?? "");
    if (!id) return null;

    const device = raw?.deviceInfo ?? {};
    const dDevice = device.device ?? {};
    const dBrowser = device.browser ?? {};
    const dOS = device.os ?? {};
    const dCPU = device.cpu ?? {};

    const ip = String(raw?.ipAddress ?? raw?.ip ?? "");
    const created = String(raw?.createdAt ?? new Date().toISOString());
    const lastUsed = String(
      raw?.lastUsedAt ?? raw?.lastUsed ?? raw?.updatedAt ?? created
    );

    const isActive =
      typeof raw?.isActive === "boolean"
        ? raw.isActive
        : String(raw?.status ?? "").toLowerCase() === "active";

    const safe: ApiSession = {
      id,
      deviceInfo: {
        browser: {
          name: dBrowser?.name ?? "",
          version: String(dBrowser?.version ?? ""),
          major: String(dBrowser?.major ?? ""),
        },
        device: {
          type: String(dDevice?.type ?? "unknown").toLowerCase(),
          vendor: dDevice?.vendor ?? "Unknown",
          model: dDevice?.model ?? "Unknown",
        },
        os: {
          name: dOS?.name ?? "Device",
          version: String(dOS?.version ?? ""),
        },
        cpu: { architecture: String(dCPU?.architecture ?? "") },
      },
      ipAddress: ip,
      location: typeof raw?.location === "string" ? raw.location : null,
      userAgent: String(raw?.userAgent ?? ""),
      isActive: !!isActive,
      lastUsedAt: lastUsed,
      createdAt: created,
    };

    return safe;
  } catch {
    return null;
  }
}

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "in the future";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;

  return d.toLocaleString();
}

function makeDeviceLabel(s: ApiSession): string {
  const os = s.deviceInfo.os?.name ? `${s.deviceInfo.os.name}` : "Device";
  const browser = s.deviceInfo.browser?.name ?? "";
  return browser ? `${os} (${browser})` : os;
}

function pickDeviceType(
  s: ApiSession
): NonNullable<ApiDeviceInfo["device"]["type"]> {
  const t = String(s.deviceInfo.device?.type ?? "unknown").toLowerCase();
  return t === "desktop" || t === "mobile" || t === "tablet"
    ? (t as any)
    : "unknown";
}

/* ===================== Component ===================== */

export default function SessionsTab() {
  const [showLoggedOut, setShowLoggedOut] = useState(false);
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [allLoading, setAllLoading] = useState(false);

  // from /current (may be null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // selection for bulk remove
  const [selected, setSelected] = useState<string[]>([]);
  const isSelected = (id: string) => selected.includes(id);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await userSettingsApi.getSessions({
        includeLoggedOut: showLoggedOut,
        grouped: false,
      });

      // Step 1: unwrap Axios if needed
      const first = unwrapAxios<unknown>(raw);

      // Step 2: accept either an envelope or a bare array
      const listUnknown: unknown[] = isEnvelope<unknown[]>(first)
        ? first.data
        : Array.isArray(first)
        ? first
        : (() => {
            throw new Error("Unexpected sessions response");
          })();

      const normalized = listUnknown
        .map(normalizeSession)
        .filter(Boolean) as ApiSession[];

      setSessions(normalized);
      setSelected((prev) =>
        prev.filter((id) => normalized.some((s) => s.id === id))
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load sessions";
      toast.error(msg);
      setSessions([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [showLoggedOut]);

  const fetchCurrent = useCallback(async () => {
    try {
      const raw = await userSettingsApi.getCurrentSession();
      const first = unwrapAxios<unknown>(raw);

      // { success:true, data:null } OR { success:true, data:{ id: string }} OR raw object with id
      let id: string | null = null;
      if (isEnvelope<any>(first)) {
        id =
          first.data && typeof first.data.id === "string"
            ? first.data.id
            : null;
      } else if (isRecord(first) && typeof (first as any).id === "string") {
        id = String((first as any).id);
      }
      setCurrentSessionId(id);
    } catch {
      setCurrentSessionId(null);
    }
  }, []);

  useEffect(() => {
    void fetchCurrent();
  }, [fetchCurrent]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  // Fallback: if backend returns current=null, mark the most recent as current
  const fallbackCurrentId = useMemo(() => {
    if (currentSessionId) return currentSessionId;
    if (sessions.length === 0) return null;
    return sessions
      .slice()
      .sort(
        (a, b) =>
          new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      )[0].id;
  }, [currentSessionId, sessions]);

  const viewModels: SessionVM[] = useMemo(
    () =>
      sessions.map((s) => ({
        id: s.id,
        deviceLabel: makeDeviceLabel(s),
        locationLabel: s.location ?? "Unknown",
        ip: s.ipAddress,
        lastUsedLabel: formatTimeAgo(s.lastUsedAt),
        isCurrent: !!fallbackCurrentId && s.id === fallbackCurrentId,
        isActive: s.isActive,
        deviceType: pickDeviceType(s),
      })),
    [sessions, fallbackCurrentId]
  );

  const handleRemove = async (id: string): Promise<void> => {
    setActionLoading(id);
    try {
      await userSettingsApi.removeSession(id);
      toast.success("Session removed");
      await Promise.all([fetchSessions(), fetchCurrent()]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not remove session";
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRemove = async (): Promise<void> => {
    if (selected.length === 0) return;
    setAllLoading(true);
    try {
      await userSettingsApi.bulkRemoveSessions(selected);
      toast.success("Selected sessions removed");
      setSelected([]);
      await Promise.all([fetchSessions(), fetchCurrent()]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not remove selected";
      toast.error(msg);
    } finally {
      setAllLoading(false);
    }
  };

  const handleLogoutAll = async (): Promise<void> => {
    setAllLoading(true);
    try {
      await userSettingsApi.logoutAllOtherSessions();
      toast.success("Logged out of all other sessions");
      setSelected([]);
      await Promise.all([fetchSessions(), fetchCurrent()]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not log out of all sessions";
      toast.error(msg);
    } finally {
      setAllLoading(false);
    }
  };

  const toggleOne = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const selectable = viewModels
      .filter((s) => !s.isCurrent && s.isActive)
      .map((s) => s.id);
    const allSelected = selectable.every((id) => selected.includes(id));
    setSelected(allSelected ? [] : selectable);
  };

  return (
    <section className="space-y-6">
      <Header
        title="Sessions"
        subtitle="All the usage sessions related to your account"
      />

      {/* Column headers (desktop only) */}
      <div className="hidden md:grid grid-cols-6 text-xs text-[var(--secondary-text)] px-2 mb-4">
        <span className="pl-2">Select</span>
        <span>Device</span>
        <span>Near</span>
        <span>IP Address</span>
        <span>Last Used</span>
        <span className="ml-auto pr-2 text-right">Action</span>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-[#2A2A2F] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {viewModels.map((s) => {
            const disabled = s.isCurrent || !s.isActive;
            return (
              <div
                key={s.id}
                className="rounded-lg bg-[#1C1C22] px-4 py-4 text-sm text-[var(--secondary-text)]"
              >
                {/* Mobile layout */}
                <div className="md:hidden space-y-3">
                  {/* top row: checkbox + device + action */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        aria-label="Select session"
                        className="h-4 w-4 accent-[var(--color-brand)]"
                        disabled={disabled}
                        checked={isSelected(s.id)}
                        onChange={() => toggleOne(s.id, disabled)}
                      />
                      <div className="flex items-center gap-2">
                        {s.deviceType === "desktop" ? (
                          <Laptop size={16} />
                        ) : (
                          <Smartphone size={16} />
                        )}
                        <span className="text-white">{s.deviceLabel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {s.isCurrent ? (
                        <span className="text-white font-bold">
                          Current session
                        </span>
                      ) : s.isActive ? (
                        <button
                          disabled={actionLoading === s.id}
                          onClick={() => void handleRemove(s.id)}
                          className="text-white text-sm hover:underline hover:text-[var(--color-blue)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {actionLoading === s.id
                            ? "Removing..."
                            : "Remove session"}
                        </button>
                      ) : (
                        <span className="text-gray-400">Logged Out</span>
                      )}
                    </div>
                  </div>

                  {/* info chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-md bg-white/5 px-3 py-2 flex items-center justify-between">
                      <span>Near</span>
                      <span className="text-white">{s.locationLabel}</span>
                    </div>
                    <div className="rounded-md bg-white/5 px-3 py-2 flex items-center justify-between">
                      <span>IP</span>
                      <span className="text-white">{s.ip}</span>
                    </div>
                    <div className="rounded-md bg-white/5 px-3 py-2 flex items-center justify-between">
                      <span>Last Used</span>
                      <span className="text-white">{s.lastUsedLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid md:grid-cols-6 md:items-center">
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      aria-label="Select session"
                      className="h-4 w-4 accent-[var(--color-brand)]"
                      disabled={disabled}
                      checked={isSelected(s.id)}
                      onChange={() => toggleOne(s.id, disabled)}
                    />
                  </div>

                  {/* Device */}
                  <div className="flex items-center gap-2">
                    {s.deviceType === "desktop" ? (
                      <Laptop size={16} />
                    ) : (
                      <Smartphone size={16} />
                    )}
                    <span className="text-white">{s.deviceLabel}</span>
                  </div>

                  {/* Location */}
                  <div>{s.locationLabel}</div>

                  {/* IP */}
                  <div>{s.ip}</div>

                  {/* Last used */}
                  <div>{s.lastUsedLabel}</div>

                  {/* Action */}
                  <div className="text-right">
                    {s.isCurrent ? (
                      <span className="text-white font-bold">
                        Current session
                      </span>
                    ) : s.isActive ? (
                      <button
                        disabled={actionLoading === s.id}
                        onClick={() => void handleRemove(s.id)}
                        className="text-white text-sm hover:underline hover:text-[var(--color-blue)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {actionLoading === s.id
                          ? "Removing..."
                          : "Remove session"}
                      </button>
                    ) : (
                      <span className="text-gray-400">Logged Out</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {viewModels.length === 0 && (
            <div className="rounded-lg bg-[#1C1C22] px-4 py-6 text-sm text-center text-[var(--secondary-text)]">
              No sessions found.
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <Toggle
          checked={showLoggedOut}
          onChange={() => setShowLoggedOut((v) => !v)}
        />
        <span className="text-sm">Display logged out sessions</span>

        <button
          type="button"
          onClick={toggleSelectAllVisible}
          className="ml-2 text-xs underline text-[var(--secondary-text)] hover:text-white"
        >
          {viewModels
            .filter((s) => !s.isCurrent && s.isActive)
            .every((s) => selected.includes(s.id))
            ? "Clear selection"
            : "Select all visible active"}
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <ButtonSecondary
            onClick={() => void handleBulkRemove()}
            disabled={allLoading || selected.length === 0}
            className="flex items-center gap-2 disabled:opacity-50"
          >
            {allLoading ? "Working..." : `Remove selected (${selected.length})`}
            <Trash2 size={16} />
          </ButtonSecondary>

          <ButtonSecondary
            onClick={() => void handleLogoutAll()}
            disabled={allLoading}
            className="flex items-center gap-2 disabled:opacity-50"
          >
            {allLoading ? "Logging out..." : "Log out of all other sessions"}
            <LogOut size={16} />
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
