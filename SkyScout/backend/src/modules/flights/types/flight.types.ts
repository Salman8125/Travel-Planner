import type { Cabin, FlightStatus } from "../../../shared/enums.js";
import type { PaginationMeta } from "../../../shared/pagination.js";

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchFilters {
  priceMin?: string;
  priceMax?: string;
  maxStops?: number;
  airlines?: string[];
  departureWindow?: { from?: string; to?: string };
}

export interface SearchFlightsInput {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
  cabin?: Cabin;
  filters?: SearchFilters;
  sortBy?: "price" | "departure" | "duration";
  order?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface CabinAvailabilityDTO {
  cabin: Cabin;
  basePrice: string;
  currency: string;
  availableSeats: number;
  totalSeats: number;
}

export interface FlightSummaryDTO {
  id: string;
  flightNumber: string;
  airline: { iataCode: string; name: string };
  origin: { iataCode: string; city: string; timezone: string };
  destination: { iataCode: string; city: string; timezone: string };
  scheduledDeparture: string;
  scheduledArrival: string;
  durationMinutes: number;
  status: FlightStatus;
  cabins: CabinAvailabilityDTO[];
}

export interface FlightSearchResult {
  outbound: { data: FlightSummaryDTO[]; meta: PaginationMeta };
  inbound?: { data: FlightSummaryDTO[]; meta: PaginationMeta };
}

export interface CabinInput {
  cabin: Cabin;
  totalSeats: number;
  basePrice: string;
  currency: string;
}

export interface CreateFlightInput {
  flightNumber: string;
  airlineIata: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  aircraftId?: string;
  cabins: CabinInput[];
}

export interface UpdateFlightInput {
  flightNumber?: string;
  scheduledDeparture?: string;
  scheduledArrival?: string;
  aircraftId?: string | null;
  status?: FlightStatus;
}

export interface SetStatusInput {
  status: FlightStatus;
}
