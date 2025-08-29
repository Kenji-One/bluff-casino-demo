// src/utils/parseApiError.ts
import axios from "axios";

export interface ParsedApiError {
  message: string; // generic banner / toast
  fieldErrors?: Record<string, string>; // { username: "msg" }
}

type ApiErrorPayload = {
  message?: string;
  error?: string;
  errors?: unknown[];
  // allow extra fields without using `any`
  [key: string]: unknown;
};

export function parseApiError(err: unknown): ParsedApiError {
  const parsed: ParsedApiError = { message: "Something went wrong" };

  if (axios.isAxiosError(err)) {
    const data = (err.response?.data ?? {}) as ApiErrorPayload;

    /* DUPLICATE_USER but which field?  ─────────────────────────── */
    if (data.error === "DUPLICATE_USER") {
      const emailLike = /mail/i.test(data.message || "");
      parsed.fieldErrors = {
        [emailLike ? "email" : "username"]: data.message ?? "Already taken",
      };
      parsed.message = "";
      return parsed;
    }

    /* Validation-failed list ───────────────────────────────────── */
    if (Array.isArray(data.errors) && data.errors.length) {
      const fe: Record<string, string> = {};

      for (const e of data.errors as unknown[]) {
        // narrow unknown safely
        if (e && typeof e === "object") {
          const maybePath = (e as { path?: unknown }).path;
          const maybeMsg = (e as { message?: unknown }).message;
          if (typeof maybePath === "string" && typeof maybeMsg === "string") {
            fe[maybePath] = maybeMsg;
          }
        }
      }

      if (Object.keys(fe).length > 0) {
        parsed.fieldErrors = fe;
        parsed.message =
          !data.message || data.message === "Validation failed"
            ? ""
            : data.message;
        return parsed;
      }
    }

    /* Fallback */
    if (data.message) parsed.message = data.message;
  }

  return parsed;
}
