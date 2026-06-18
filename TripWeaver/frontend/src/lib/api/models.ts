import type { components } from './types';

type Schemas = components['schemas'];

export type FlightInput = Schemas['FlightInput'];
export type HotelInput = Schemas['HotelInput'];
export type ForecastInput = Schemas['ForecastInput'];
export type BudgetInput = Schemas['BudgetInput'];
export type PreferencesInput = Schemas['PreferencesInput'];
export type BuildItineraryRequest = Schemas['BuildItineraryRequest'];
export type UpdateItineraryRequest = Schemas['UpdateItineraryRequest'];
export type UpdateDayInput = Schemas['UpdateDayInput'];
export type UpdateActivityInput = Schemas['UpdateActivityInput'];
export type RegisterRequest = Schemas['RegisterRequest'];
export type LoginRequest = Schemas['LoginRequest'];

export type Role = 'USER' | 'ADMIN';
export type ItineraryStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface UserDto {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export interface FlightSelection {
  flightId: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  stops: number;
}

export interface HotelSelection {
  hotelId: string;
  name: string;
  starRating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
}

export interface BudgetSummary {
  totalBudget: number;
  spent: number;
  remaining: number;
  currency: string;
}

export interface DailyForecastSnapshot {
  date: string;
  high: number;
  low: number;
  condition: string;
}

export interface ItineraryActivityDto {
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  estimatedCost: number | null;
}

export interface ItineraryDayDto {
  date: string;
  dayNumber: number;
  summary: string;
  highC: number | null;
  lowC: number | null;
  condition: string | null;
  notes: string | null;
  activities: ItineraryActivityDto[];
}

export interface ItineraryDto {
  reference: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: ItineraryStatus;
  totalCost: number;
  currency: string;
  budgetTotal: number;
  budgetRemaining: number;
  withinBudget: boolean;
  rowVersion: string;
  createdAt: string;
  updatedAt: string;
  flight: FlightSelection;
  hotel: HotelSelection;
  budget: BudgetSummary;
  weather: DailyForecastSnapshot[];
  days: ItineraryDayDto[];
}

export interface ItineraryListItemDto {
  reference: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: ItineraryStatus;
  totalCost: number;
  currency: string;
  withinBudget: boolean;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListResult<T> {
  data: T[];
  meta: PageMeta;
}
