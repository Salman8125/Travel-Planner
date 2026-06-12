import type { AxiosError } from "axios";

import type { Flatten } from "./models";

const FORM_KEYS = new Set(["_", "form", "non_field_errors", "__all__"]);

interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  isNetwork?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly isNetwork: boolean;

  constructor(opts: ApiErrorOptions) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.requestId = opts.requestId;
    this.isNetwork = opts.isNetwork ?? false;
  }

  static fromAxios(error: AxiosError): ApiError {
    const response = error.response;
    if (!response) {
      const timedOut = error.code === "ECONNABORTED";
      return new ApiError({
        status: 0,
        code: timedOut ? "timeout" : "network_error",
        message: timedOut
          ? "The request timed out. Please try again."
          : "Unable to reach the server. Check your connection and try again.",
        isNetwork: true,
      });
    }
    const body = response.data as
      | { error?: { code?: string; message?: string; details?: unknown; requestId?: string } }
      | undefined;
    const err = body?.error;
    return new ApiError({
      status: response.status,
      code: err?.code ?? "error",
      message: err?.message ?? `Request failed (${response.status}).`,
      details: err?.details,
      requestId: err?.requestId,
    });
  }

  get flatten(): Flatten | undefined {
    const d = this.details;
    if (!d || typeof d !== "object") return undefined;
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];
    for (const [key, value] of Object.entries(d as Record<string, unknown>)) {
      const message = String(value);
      if (FORM_KEYS.has(key)) formErrors.push(message);
      else fieldErrors[key] = [message];
    }
    if (formErrors.length === 0 && Object.keys(fieldErrors).length === 0) return undefined;
    return { formErrors, fieldErrors };
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
