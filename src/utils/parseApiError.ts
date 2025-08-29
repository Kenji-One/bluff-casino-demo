// utils/parseApiError.ts
import axios from "axios";

export interface ParsedApiError {
  message: string; // generic banner / toast
  fieldErrors?: Record<string, string>; // { username: "msg" }
}

export function parseApiError(err: unknown): ParsedApiError {
  let parsed: ParsedApiError = { message: "Something went wrong" };

  if (axios.isAxiosError(err)) {
    const data = err.response?.data ?? {};

    /* DUPLICATE_USER but which field?  ─────────────────────────── */
    if (data.error === "DUPLICATE_USER") {
      const emailLike = /mail/i.test(data.message || "");
      parsed.fieldErrors = {
        [emailLike ? "email" : "username"]: data.message,
      };
      parsed.message = "";
      return parsed;
    }

    /* Validation-failed list ───────────────────────────────────── */
    if (Array.isArray(data.errors) && data.errors.length) {
      const fe: Record<string, string> = {};
      data.errors.forEach((e: any) => (fe[e.path] = e.message));
      parsed.fieldErrors = fe;
      parsed.message =
        !data.message || data.message === "Validation failed"
          ? ""
          : data.message;
      return parsed;
    }

    /* Fallback */
    if (data.message) parsed.message = data.message;
  }

  return parsed;
}
