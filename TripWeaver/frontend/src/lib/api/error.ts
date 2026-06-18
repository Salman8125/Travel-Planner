export interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string>;
    requestId?: string;
  };
}

export interface Flatten {
  formErrors: string[];
  fieldErrors: Record<string, string>;
}

const FORM_KEYS = new Set(['_', 'form', 'non_field_errors', '__all__']);

interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string>;
  requestId?: string;
  isNetwork?: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;
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

  static network(): ApiError {
    return new ApiError({
      status: 0,
      code: 'network_error',
      message: 'Unable to reach the server. Check your connection and try again.',
      isNetwork: true,
    });
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: ErrorEnvelope | undefined;
    try {
      body = (await res.json()) as ErrorEnvelope;
    } catch {
      body = undefined;
    }
    const err = body?.error;
    const requestId = err?.requestId ?? res.headers.get('X-Request-Id') ?? undefined;
    return new ApiError({
      status: res.status,
      code: err?.code ?? 'error',
      message: err?.message ?? `Request failed (${res.status}).`,
      details: err?.details,
      requestId,
    });
  }

  get flatten(): Flatten | undefined {
    if (!this.details) return undefined;
    const fieldErrors: Record<string, string> = {};
    const formErrors: string[] = [];
    for (const [key, value] of Object.entries(this.details)) {
      if (FORM_KEYS.has(key)) formErrors.push(String(value));
      else fieldErrors[key] = String(value);
    }
    if (!formErrors.length && Object.keys(fieldErrors).length === 0) return undefined;
    return { formErrors, fieldErrors };
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
