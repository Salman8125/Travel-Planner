import type { components } from "./api";

type Schemas = components["schemas"];

export type Money = string | number;

export type Cabin = NonNullable<Schemas["CabinAvailability"]["cabin"]>;
export type FlightStatus = NonNullable<Schemas["FlightSummary"]["status"]>;
export type BookingStatus = NonNullable<Schemas["Booking"]["status"]>;
export type PassengerType = NonNullable<Schemas["Passenger"]["type"]>;
export type UserRole = NonNullable<NonNullable<Schemas["AuthResult"]["user"]>["role"]>;

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Place {
  iataCode: string;
  city: string;
  timezone: string;
}

export interface CabinAvailability {
  cabin: Cabin;
  basePrice: Money;
  currency: string;
  availableSeats: number;
  totalSeats: number;
}

export interface FlightSummary {
  id: string;
  flightNumber: string;
  airline: { iataCode: string; name: string };
  origin: Place;
  destination: Place;
  scheduledDeparture: string;
  scheduledArrival: string;
  durationMinutes: number;
  status: FlightStatus;
  cabins: CabinAvailability[];
}

export interface FlightPage {
  data: FlightSummary[];
  meta: PaginationMeta;
}

export interface FlightSearchResult {
  outbound: FlightPage;
  inbound: FlightPage | null;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  type: PassengerType;
  passportNumber: string | null;
  seatNumber: string | null;
}

export interface Booking {
  id: string;
  reference: string;
  status: BookingStatus;
  flightId: string;
  cabin: Cabin;
  totalPrice: Money;
  currency: string;
  contactEmail: string;
  passengers: Passenger[];
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
}

export interface Airport {
  id: string;
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface Airline {
  id: string;
  iataCode: string;
  name: string;
}

export interface ZodFlatten {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

export const CABINS: Cabin[] = ["ECONOMY", "BUSINESS", "FIRST"];
export const PASSENGER_TYPES: PassengerType[] = ["ADULT", "CHILD", "INFANT"];
export const FLIGHT_STATUSES: FlightStatus[] = [
  "SCHEDULED",
  "DELAYED",
  "BOARDING",
  "DEPARTED",
  "ARRIVED",
  "CANCELLED",
];

export const CABIN_LABELS: Record<Cabin, string> = {
  ECONOMY: "Economy",
  BUSINESS: "Business",
  FIRST: "First",
};
