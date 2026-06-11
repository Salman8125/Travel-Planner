import type { Envelope, PaginatedEnvelope, PaginationMeta } from './models';

export function dataOf<T>(body: Envelope<T>): T {
  return body.data;
}

export function listOf<T>(body: PaginatedEnvelope<T>): { items: T[]; meta: PaginationMeta } {
  return { items: body.data, meta: body.meta };
}
