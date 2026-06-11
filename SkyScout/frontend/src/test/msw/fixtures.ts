import type { Airline, Airport, AuthResult, Booking, FlightSummary } from "@/types/app";

export const userFixture = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@skyscout.dev",
  role: "USER" as const,
};

export const adminFixture = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "admin@skyscout.dev",
  role: "ADMIN" as const,
};

export const authResultFixture: AuthResult = {
  token: "test.jwt.token",
  user: userFixture,
};

export const flightFixture: FlightSummary = {
  id: "33333333-3333-3333-3333-333333333333",
  flightNumber: "EK1147",
  airline: { iataCode: "EK", name: "Emirates" },
  origin: { iataCode: "ISB", city: "Islamabad", timezone: "Asia/Karachi" },
  destination: { iataCode: "DXB", city: "Dubai", timezone: "Asia/Dubai" },
  scheduledDeparture: "2026-06-20T12:30:00.000Z",
  scheduledArrival: "2026-06-20T15:30:00.000Z",
  durationMinutes: 180,
  status: "SCHEDULED",
  cabins: [
    { cabin: "ECONOMY", basePrice: 188, currency: "USD", availableSeats: 180, totalSeats: 180 },
    { cabin: "BUSINESS", basePrice: 564, currency: "USD", availableSeats: 20, totalSeats: 20 },
  ],
};

export const bookingFixture: Booking = {
  id: "44444444-4444-4444-4444-444444444444",
  reference: "4XHN36",
  status: "CONFIRMED",
  flightId: flightFixture.id,
  cabin: "ECONOMY",
  totalPrice: "188.00",
  currency: "USD",
  contactEmail: "user@skyscout.dev",
  passengers: [
    {
      id: "55555555-5555-5555-5555-555555555555",
      firstName: "Ada",
      lastName: "Lovelace",
      dateOfBirth: "1990-12-10",
      type: "ADULT",
      passportNumber: null,
      seatNumber: null,
    },
  ],
  createdAt: "2026-06-10T09:00:00.000Z",
  updatedAt: "2026-06-10T09:00:00.000Z",
  cancelledAt: null,
};

export const airportsFixture: Airport[] = [
  { id: "a1", iataCode: "ISB", name: "Islamabad Intl", city: "Islamabad", country: "PK", timezone: "Asia/Karachi" },
  { id: "a2", iataCode: "DXB", name: "Dubai Intl", city: "Dubai", country: "AE", timezone: "Asia/Dubai" },
];

export const airlinesFixture: Airline[] = [
  { id: "l1", iataCode: "EK", name: "Emirates" },
  { id: "l2", iataCode: "QR", name: "Qatar Airways" },
];
