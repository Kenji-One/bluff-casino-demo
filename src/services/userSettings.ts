// src/services/userSettings.ts
import { apiClient } from "./api";

/* ────────────────────────────────
   Types
   ──────────────────────────────── */
export interface PreferencesPayload {
  id: string;
  userId: string;
  flatView: boolean;
  oddPreference: "Decimal" | "Fractional";
  privateMode: boolean;
  emailMarketing: boolean;
  streamerMode: boolean;
  hideZeroBalances: boolean;
  createdAt: string;
  updatedAt: string;
}

type UpdatePreferencesPayload = Partial<
  Pick<
    PreferencesPayload,
    | "flatView"
    | "oddPreference"
    | "privateMode"
    | "emailMarketing"
    | "streamerMode"
    | "hideZeroBalances"
  >
>;

/** Helper for responses that may be wrapped like `{ data: T }` */
type MaybeWrapped<T> = T | { data: T };
function unwrapData<T>(val: MaybeWrapped<T>): T {
  if (typeof val === "object" && val !== null && "data" in (val as object)) {
    return (val as { data: T }).data;
  }
  return val as T;
}

/** Upload KYC endpoint can return one of these shapes */
type UploadResult = {
  url?: string;
  cdnUrl?: string;
};

/* ────────────────────────────────
   API helpers
   ──────────────────────────────── */
const userSettingsApi = {
  // 📦 Preferences
  // ────────────────────────────────
  getPreferences: () =>
    apiClient.get<{ success: true; data: PreferencesPayload }>(
      "/user-settings/preferences"
    ),

  updatePreferences: (prefs: UpdatePreferencesPayload) =>
    apiClient.put("/user-settings/preferences", prefs),

  resetPreferences: () => apiClient.post("/user-settings/preferences/reset"),

  hasCustomPreferences: () =>
    apiClient.get("/user-settings/preferences/custom"),

  // 🔐 Security (Password & 2FA)
  // ────────────────────────────────
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) =>
    apiClient.post("/user-settings/security/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    }),

  get2FAStatus: () => apiClient.get("/user-settings/security/2fa/status"),
  generate2FASecret: () =>
    apiClient.post("/user-settings/security/2fa/generate"),
  enable2FA: (verificationCode: string) =>
    apiClient.post("/user-settings/security/2fa/enable", { verificationCode }),
  disable2FA: (payload: { password?: string; verificationCode?: string }) =>
    apiClient.post("/user-settings/security/2fa/disable", payload),
  generateBackupCodes: () =>
    apiClient.post("/user-settings/security/2fa/backup-codes"),
  verify2FACode: (code: string) =>
    apiClient.post("/user-settings/security/2fa/verify", { code }),

  // 🧾 Sessions
  // ────────────────────────────────
  getSessions: (
    params: {
      page?: number;
      limit?: number;
      includeLoggedOut?: boolean;
      grouped?: boolean;
    } = {}
  ) => {
    const qs = new URLSearchParams();
    if (typeof params.page === "number") qs.set("page", String(params.page));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (typeof params.includeLoggedOut === "boolean")
      qs.set("includeLoggedOut", String(params.includeLoggedOut));
    if (typeof params.grouped === "boolean")
      qs.set("grouped", String(params.grouped));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiClient.get(`/user-settings/sessions${suffix}`);
  },
  getCurrentSession: () => apiClient.get("/user-settings/sessions/current"),
  removeSession: (sessionId: string) =>
    apiClient.delete(`/user-settings/sessions/${sessionId}`),
  logoutAllOtherSessions: () => apiClient.delete("/user-settings/sessions"),
  bulkRemoveSessions: (sessionIds: string[]) =>
    apiClient.post("/user-settings/sessions/bulk-remove", { sessionIds }),
  getSessionStats: () => apiClient.get("/user-settings/sessions/stats"),

  // 👤 Account
  // ────────────────────────────────
  getAccountProfile: () => apiClient.get("/user-settings/account"),
  getAccountStats: () => apiClient.get("/user-settings/account/stats"),
  updateEmail: (email: string) =>
    apiClient.put("/user-settings/account/email", { email }),
  updateUsername: (username: string) =>
    apiClient.put("/user-settings/account/username", { username }),
  checkUsernameAvailability: (username: string) =>
    apiClient.get(`/user-settings/account/check-username/${username}`),
  deleteAccount: (password: string) =>
    apiClient.delete("/user-settings/account", {
      data: { password, confirmDeletion: "DELETE" },
    }),

  // 🖼️ Avatar
  // ────────────────────────────────
  generateAvatar: () =>
    apiClient.post<{ success: boolean; data: { url?: string } }>(
      "/user-settings/account/generate-avatar"
    ),
  uploadProfilePicture: (file: File) => {
    const fd = new FormData();
    fd.append("profilePicture", file);
    return apiClient.patch<{ success: boolean; data: { url?: string } }>(
      "/user-settings/account/profile-picture",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
  deleteProfilePicture: () =>
    apiClient.delete<{ success: boolean }>(
      "/user-settings/account/profile-picture"
    ),

  // 💰 Transactions
  // ────────────────────────────────
  getUserTransactions: (queryParams: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      qs.set(key, String(value));
    }
    return apiClient.get(`/user-settings/transactions?${qs.toString()}`);
  },

  getTransactionSummary: (period: string = "30d") =>
    apiClient.get(`/user-settings/transactions/summary?period=${period}`),

  exportTransactions: (queryParams: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      qs.set(key, String(value));
    }
    return apiClient.download(
      `/user-settings/transactions/export?${qs.toString()}`,
      {
        responseType: "blob",
      }
    );
  },

  getTransactionDashboard: () =>
    apiClient.get("/user-settings/transactions/dashboard"),

  // ✅ Verification
  // ────────────────────────────────
  getVerificationStatus: () =>
    apiClient.get("/user-settings/verification/status"),

  // --- EMAIL verification (new endpoints) ---
  startEmailVerification: (email?: string) =>
    apiClient.post(
      "/user-settings/verification/email/start",
      email ? { email } : {}
    ),
  verifyEmailCode: (code: string) =>
    apiClient.post("/user-settings/verification/email/verify-code", { code }),
  verifyEmailToken: (token: string) =>
    apiClient.post("/user-settings/verification/email/verify", { token }),
  resendEmailVerification: (email?: string) =>
    apiClient.post(
      "/user-settings/verification/email/resend",
      email ? { email } : {}
    ),
  getEmailVerificationStatus: () =>
    apiClient.get("/user-settings/verification/email/status"),

  // --- BASIC info (L2) ---
  submitBasicInformation: (payload: {
    country: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    occupation: string;
  }) => apiClient.post("/user-settings/verification/basic-info", payload),

  submitBasicInfo: (payload: {
    country: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    occupation: string;
  }) => apiClient.post("/user-settings/verification/basic-info", payload),

  // --- Identity uploads + submit (NEW) ---
  /** Uploads a KYC document and returns its CDN URL. */
  uploadKycFile: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await apiClient.post<MaybeWrapped<UploadResult>>(
      "/user-settings/verification/upload-document",
      fd
    );

    const d = unwrapData(res);
    const url = d?.url ?? d?.cdnUrl;
    if (!url) throw new Error("Upload failed");
    return url;
  },

  /** Submits identity verification payload (JSON with URLs). */
  submitIdentity: (payload: {
    documentType: string; // "passport" | "id_card" | "drivers_license" | "residence_permit"
    documentNumber: string;
    documentUrl: string;
    documentBackUrl?: string;
    country?: string;
  }) => apiClient.post("/user-settings/verification/identity", payload),

  // (back-compat)
  submitIdentityVerification: (payload: FormData | Record<string, unknown>) =>
    apiClient.post("/user-settings/verification/identity", payload),

  getVerificationRequirements: () =>
    apiClient.get("/user-settings/verification/requirements"),
  getVerificationHistory: () =>
    apiClient.get("/user-settings/verification/history"),
};

export default userSettingsApi;
