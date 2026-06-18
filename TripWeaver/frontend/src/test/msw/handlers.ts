import { http, HttpResponse } from 'msw';
import { authResponse, itinerary, listItem, normalUser } from './fixtures';

const base = 'http://localhost:4005';
const pageMeta = { page: 1, pageSize: 20, total: 1, totalPages: 1 };

export const handlers = [
  http.post(`${base}/api/auth/login`, () => HttpResponse.json({ data: authResponse })),
  http.post(`${base}/api/auth/register`, () =>
    HttpResponse.json({ data: authResponse }, { status: 201 }),
  ),
  http.get(`${base}/api/auth/me`, () => HttpResponse.json({ data: normalUser })),
  http.get(`${base}/api/itineraries`, () =>
    HttpResponse.json({ data: [listItem], meta: pageMeta }),
  ),
  http.get(`${base}/api/itineraries/:reference`, () => HttpResponse.json({ data: itinerary })),
  http.post(`${base}/api/itineraries`, () => HttpResponse.json({ data: itinerary }, { status: 201 })),
  http.patch(`${base}/api/itineraries/:reference`, () => HttpResponse.json({ data: itinerary })),
  http.post(`${base}/api/itineraries/:reference/cancel`, () =>
    HttpResponse.json({ data: { ...itinerary, status: 'CANCELLED' } }),
  ),
];

export function errorEnvelope(
  code: string,
  message: string,
  details?: Record<string, string>,
  requestId = 'req-test',
) {
  return { error: { code, message, details, requestId } };
}
