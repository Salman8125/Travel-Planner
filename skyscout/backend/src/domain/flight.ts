// Flight domain layer — pure business logic. MUST NOT touch HTTP.
// A later A2A phase will wrap these functions directly (the HTTP layer and a future A2A
// executor both call into here).

export interface FlightOption {
  flightId: string;
  airline: string;
  origin: string; // IATA 3-letter code
  destination: string; // IATA 3-letter code
  departureTime: string; // ISO-8601
  arrivalTime: string; // ISO-8601
  price: number; // USD
  stops: number; // 0 = direct
}

export interface SearchFlightsCriteria {
  origin?: string;
  destination?: string;
}

// Hardcoded mock data. Zero external API calls.
const FLIGHTS: FlightOption[] = [
  {
    flightId: "FL-1001",
    airline: "Skyline Airways",
    origin: "JFK",
    destination: "LHR",
    departureTime: "2026-07-01T08:30:00Z",
    arrivalTime: "2026-07-01T20:15:00Z",
    price: 742.0,
    stops: 0,
  },
  {
    flightId: "FL-1002",
    airline: "Atlantic Wings",
    origin: "JFK",
    destination: "LHR",
    departureTime: "2026-07-01T13:00:00Z",
    arrivalTime: "2026-07-02T03:40:00Z",
    price: 588.5,
    stops: 1,
  },
  {
    flightId: "FL-1003",
    airline: "Polar Air",
    origin: "SFO",
    destination: "NRT",
    departureTime: "2026-07-03T11:20:00Z",
    arrivalTime: "2026-07-04T15:05:00Z",
    price: 965.0,
    stops: 0,
  },
  {
    flightId: "FL-1004",
    airline: "Sunsetter",
    origin: "LAX",
    destination: "CDG",
    departureTime: "2026-07-05T18:45:00Z",
    arrivalTime: "2026-07-06T14:30:00Z",
    price: 812.75,
    stops: 1,
  },
];

const eq = (a: string | undefined, b: string): boolean =>
  a === undefined || a.trim().toLowerCase() === b.toLowerCase();

/** Search flights. Empty/omitted criteria returns all mock flights. */
export function searchFlights(criteria: SearchFlightsCriteria = {}): FlightOption[] {
  return FLIGHTS.filter(
    (f) => eq(criteria.origin, f.origin) && eq(criteria.destination, f.destination)
  );
}

/** Look up a single flight by id. Returns an array (0 or 1) to keep the skill return uniform. */
export function getFlightDetails(flightId: string): FlightOption[] {
  return FLIGHTS.filter((f) => f.flightId === flightId);
}
