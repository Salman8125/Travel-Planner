export type FieldErrors = Record<string, string[]>;

export interface FlattenedErrors {
  formErrors: string[];
  fieldErrors: FieldErrors;
}

interface ApiErrorInit {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown> | null;
  requestId?: string;
  isNetwork?: boolean;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown> | null;
  readonly requestId?: string;
  readonly isNetwork: boolean;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = 'ApiError';
    this.code = init.code;
    this.status = init.status;
    this.details = init.details ?? undefined;
    this.requestId = init.requestId;
    this.isNetwork = init.isNetwork ?? false;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
      const text = await res.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    const err = (body as { error?: Record<string, unknown> } | null)?.error ?? {};
    const requestId =
      (typeof err.requestId === 'string' ? err.requestId : undefined) ??
      res.headers.get('x-request-id') ??
      undefined;
    return new ApiError({
      message: typeof err.message === 'string' ? err.message : res.statusText || 'Request failed',
      code: typeof err.code === 'string' ? err.code : `http_${res.status}`,
      status: res.status,
      details: (err.details as Record<string, unknown>) ?? undefined,
      requestId,
      isNetwork: false
    });
  }

  static network(_cause?: unknown): ApiError {
    return new ApiError({
      message: 'Unable to reach the server. Check your connection and try again.',
      code: 'network_error',
      status: 0,
      isNetwork: true
    });
  }

  get flatten(): FlattenedErrors {
    const fieldErrors: FieldErrors = {};
    const formErrors: string[] = [];
    const details = this.details;
    if (details && typeof details === 'object') {
      for (const [key, value] of Object.entries(details)) {
        const messages = Array.isArray(value) ? value.map((v) => String(v)) : [String(value)];
        if (key === 'non_field_errors' || key === '__all__') {
          formErrors.push(...messages);
        } else {
          fieldErrors[key] = messages;
        }
      }
    }
    return { formErrors, fieldErrors };
  }
}
