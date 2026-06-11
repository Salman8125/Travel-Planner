import type { ApiError } from '$lib/api/ApiError';

declare global {
  namespace App {
    interface Error {
      code?: string;
      message: string;
      requestId?: string;
    }
    interface Locals {}
    interface PageData {}
    interface PageState {}
    interface Platform {}
  }
}

export type { ApiError };
