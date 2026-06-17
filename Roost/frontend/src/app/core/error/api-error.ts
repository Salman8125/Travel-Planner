import { HttpErrorResponse } from '@angular/common/http';

export interface Flatten {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

const FORM_KEYS = new Set(['_', 'form', 'non_field_errors', '__all__']);

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
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.requestId = opts.requestId;
    this.isNetwork = opts.isNetwork ?? false;
  }

  static fromHttp(error: HttpErrorResponse): ApiError {
    if (error.status === 0) {
      return new ApiError({
        status: 0,
        code: 'network_error',
        message: 'Unable to reach the server. Check your connection and try again.',
        isNetwork: true,
      });
    }
    const body = error.error as
      | { error?: { code?: string; message?: string; details?: unknown; requestId?: string } }
      | undefined;
    const err = body?.error;
    const requestId = err?.requestId ?? error.headers?.get('X-Request-Id') ?? undefined;
    return new ApiError({
      status: error.status,
      code: err?.code ?? 'error',
      message: err?.message ?? `Request failed (${error.status}).`,
      details: err?.details,
      requestId,
    });
  }

  get flatten(): Flatten | undefined {
    const d = this.details;
    if (!d || typeof d !== 'object') return undefined;
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
