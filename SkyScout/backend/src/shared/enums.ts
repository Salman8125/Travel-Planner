export const FLIGHT_STATUS = [
  "SCHEDULED",
  "DELAYED",
  "BOARDING",
  "DEPARTED",
  "ARRIVED",
  "CANCELLED",
] as const;
export type FlightStatus = (typeof FLIGHT_STATUS)[number];

export const CABINS = ["ECONOMY", "BUSINESS", "FIRST"] as const;
export type Cabin = (typeof CABINS)[number];

export const BOOKING_STATUS = ["PENDING", "CONFIRMED", "CANCELLED", "FAILED"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const PASSENGER_TYPES = ["ADULT", "CHILD", "INFANT"] as const;
export type PassengerType = (typeof PASSENGER_TYPES)[number];

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const UNBOOKABLE_FLIGHT_STATUS: readonly FlightStatus[] = ["CANCELLED", "DEPARTED", "ARRIVED"];
