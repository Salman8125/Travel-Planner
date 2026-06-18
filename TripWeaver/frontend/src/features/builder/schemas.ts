import { z } from 'zod';
import { MAX_TRIP_DAYS } from '@/lib/config/env';
import { datePart, todayIso, tripSpanDays } from '@/lib/utils/date';

const currency = z.string().trim().length(3, 'Use a 3-letter currency code');

export const FlightSchema = z.object({
  flightId: z.string().min(1, 'Required'),
  airline: z.string().min(1, 'Required'),
  origin: z.string().min(1, 'Required'),
  destination: z.string().min(1, 'Required'),
  departureTime: z.string().min(1, 'Required'),
  arrivalTime: z.string().min(1, 'Required'),
  price: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  currency,
  stops: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
});

export const HotelSchema = z.object({
  hotelId: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  starRating: z.number({ message: 'Required' }).min(1, '1–5').max(5, '1–5'),
  pricePerNight: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  totalPrice: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  currency,
  checkIn: z.string().min(1, 'Required'),
  checkOut: z.string().min(1, 'Required'),
  amenities: z.string().optional(),
});

export const ForecastSchema = z.object({
  date: z.string().min(1, 'Required'),
  high: z.number({ message: 'Required' }),
  low: z.number({ message: 'Required' }),
  condition: z.string().min(1, 'Required').max(32),
});

export const BudgetSchema = z.object({
  totalBudget: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  spent: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  remaining: z.number({ message: 'Required' }).min(0, 'Must be ≥ 0'),
  currency,
});

export const BuildFormSchema = z
  .object({
    title: z.string().max(200).optional(),
    destination: z.string().max(200).optional(),
    flight: FlightSchema,
    hotel: HotelSchema,
    weather: z.array(ForecastSchema),
    budget: BudgetSchema,
    preferences: z.object({ strictBudget: z.boolean() }),
  })
  .superRefine((v, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    if (v.flight.origin.trim().toUpperCase() === v.flight.destination.trim().toUpperCase()) {
      issue(['flight', 'destination'], 'Must differ from the origin');
    }
    if (v.flight.departureTime && v.flight.arrivalTime && v.flight.arrivalTime <= v.flight.departureTime) {
      issue(['flight', 'arrivalTime'], 'Must be after the departure time');
    }

    const cur = v.budget.currency.trim().toUpperCase();
    if (v.flight.currency.trim().toUpperCase() !== cur) {
      issue(['flight', 'currency'], 'Flight, hotel and budget currencies must match');
    }
    if (v.hotel.currency.trim().toUpperCase() !== cur) {
      issue(['hotel', 'currency'], 'Flight, hotel and budget currencies must match');
    }

    const startIso = datePart(v.flight.arrivalTime);
    const endIso = v.hotel.checkOut;
    if (startIso && endIso) {
      if (endIso < startIso) {
        issue(['hotel', 'checkOut'], 'Must be on or after the flight arrival date');
      } else if (tripSpanDays(startIso, endIso) > MAX_TRIP_DAYS) {
        issue(['hotel', 'checkOut'], `The trip exceeds the maximum of ${MAX_TRIP_DAYS} days`);
      }
      if (startIso < todayIso()) {
        issue(['flight', 'arrivalTime'], 'The trip cannot start in the past');
      }
      if (v.hotel.checkIn && v.hotel.checkIn > startIso) {
        issue(['hotel', 'checkIn'], 'Must be on or before the flight arrival date');
      }
      if (tripSpanDays(startIso, endIso) > 1 && v.weather.length === 0) {
        issue(['weather'], 'A forecast is required for multi-day trips');
      }
    }
  });

export type BuildForm = z.infer<typeof BuildFormSchema>;

export const emptyBuildForm = (): BuildForm => ({
  title: '',
  destination: '',
  flight: {
    flightId: '',
    airline: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: 0,
    currency: 'USD',
    stops: 0,
  },
  hotel: {
    hotelId: '',
    name: '',
    starRating: 4,
    pricePerNight: 0,
    totalPrice: 0,
    currency: 'USD',
    checkIn: '',
    checkOut: '',
    amenities: '',
  },
  weather: [],
  budget: { totalBudget: 0, spent: 0, remaining: 0, currency: 'USD' },
  preferences: { strictBudget: false },
});
