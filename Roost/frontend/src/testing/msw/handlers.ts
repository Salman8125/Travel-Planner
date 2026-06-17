import { http, HttpResponse } from 'msw';

import { authResponse, booking, hotelDetail, normalUser, searchItem } from './fixtures';

const base = 'http://localhost:4002';

const pageMeta = { page: 1, pageSize: 20, total: 1, totalPages: 1 };

export const handlers = [
  http.post(`${base}/api/auth/login`, () => HttpResponse.json({ data: authResponse })),

  http.post(`${base}/api/auth/register`, () =>
    HttpResponse.json({ data: authResponse }, { status: 201 }),
  ),

  http.get(`${base}/api/auth/me`, () => HttpResponse.json({ data: normalUser })),

  http.post(`${base}/api/hotels/search`, () =>
    HttpResponse.json({ data: [searchItem], meta: pageMeta }),
  ),

  http.get(`${base}/api/hotels/:id`, () => HttpResponse.json({ data: hotelDetail })),

  http.post(`${base}/api/bookings`, () => HttpResponse.json({ data: booking }, { status: 201 })),

  http.get(`${base}/api/bookings`, () =>
    HttpResponse.json({ data: [booking], meta: pageMeta }),
  ),

  http.get(`${base}/api/bookings/:reference`, () => HttpResponse.json({ data: booking })),
];

export function errorEnvelope(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId = 'req-test',
) {
  return { error: { code, message, details, requestId } };
}
