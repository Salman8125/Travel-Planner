import { api } from '@/lib/api/client';
import type { BuildItineraryRequest, ItineraryDto } from '@/lib/api/models';
import type { BuildForm } from './schemas';

function toInstant(local: string): string {
  if (!local) return local;
  return local.length === 16 ? `${local}:00Z` : local;
}

export function toBuildRequest(form: BuildForm): BuildItineraryRequest {
  const amenities = (form.hotel.amenities ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: form.title?.trim() ? form.title.trim() : null,
    destination: form.destination?.trim() ? form.destination.trim() : null,
    flight: {
      flightId: form.flight.flightId,
      airline: form.flight.airline,
      origin: form.flight.origin.trim().toUpperCase(),
      destination: form.flight.destination.trim().toUpperCase(),
      departureTime: toInstant(form.flight.departureTime),
      arrivalTime: toInstant(form.flight.arrivalTime),
      price: form.flight.price,
      currency: form.flight.currency.trim().toUpperCase(),
      stops: form.flight.stops,
    },
    hotel: {
      hotelId: form.hotel.hotelId,
      name: form.hotel.name,
      starRating: form.hotel.starRating,
      pricePerNight: form.hotel.pricePerNight,
      totalPrice: form.hotel.totalPrice,
      currency: form.hotel.currency.trim().toUpperCase(),
      checkIn: form.hotel.checkIn,
      checkOut: form.hotel.checkOut,
      amenities: amenities.length ? amenities : null,
    },
    weather: form.weather.map((w) => ({
      date: w.date,
      high: w.high,
      low: w.low,
      condition: w.condition,
    })),
    budget: {
      totalBudget: form.budget.totalBudget,
      spent: form.budget.spent,
      remaining: form.budget.remaining,
      currency: form.budget.currency.trim().toUpperCase(),
    },
    preferences: { strictBudget: form.preferences.strictBudget },
  };
}

export const builderApi = {
  build: (body: BuildItineraryRequest, idempotencyKey: string) =>
    api.post<ItineraryDto>('/api/itineraries', body, { 'Idempotency-Key': idempotencyKey }),
};
