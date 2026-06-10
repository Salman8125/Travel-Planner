import type { BookingStatus, Cabin, PassengerType } from "../../../shared/enums.js";

export interface PassengerInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  type: PassengerType;
  passportNumber?: string;
}

export interface PassengerDTO {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  type: PassengerType;
  passportNumber: string | null;
  seatNumber: string | null;
}

export interface CreateBookingInput {
  flightId: string;
  cabin: Cabin;
  contactEmail: string;
  passengers: PassengerInput[];
}

export interface BookingDTO {
  id: string;
  reference: string;
  status: BookingStatus;
  flightId: string;
  cabin: Cabin;
  totalPrice: string;
  currency: string;
  contactEmail: string;
  passengers: PassengerDTO[];
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
}

export interface CallerContext {
  userId: string;
  role: "USER" | "ADMIN";
}

export interface CreateBookingResult {
  booking: BookingDTO;
  replayed: boolean;
}

export interface CancelResult {
  booking: BookingDTO;
  alreadyCancelled: boolean;
}
