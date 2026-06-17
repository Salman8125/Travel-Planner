import type { components } from './types';

type Schemas = components['schemas'];

type WithRequired<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export type Role = 'USER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type UserDto = WithRequired<Schemas['UserDto'], 'id' | 'email' | 'role'> & { role: Role };
export type AuthResponse = WithRequired<Schemas['AuthResponse'], 'token' | 'user'> & { user: UserDto };

export type HotelDto = WithRequired<
  Schemas['HotelDto'],
  'id' | 'name' | 'city' | 'country' | 'starRating' | 'latitude' | 'longitude' | 'timezone'
>;

export type RoomTypeDto = WithRequired<
  Schemas['RoomTypeDto'],
  'id' | 'name' | 'capacity' | 'basePricePerNight' | 'currency'
>;

export type RoomTypeOffer = WithRequired<
  Schemas['RoomTypeOffer'],
  'roomTypeId' | 'name' | 'capacity' | 'currency' | 'pricePerNight' | 'totalPrice' | 'availableRooms'
>;

export type HotelSearchItem = WithRequired<
  Schemas['HotelSearchItem'],
  | 'hotelId'
  | 'name'
  | 'city'
  | 'country'
  | 'starRating'
  | 'timezone'
  | 'currency'
  | 'pricePerNight'
  | 'totalPrice'
> & { roomTypes: RoomTypeOffer[] };

export interface HotelDetailDto {
  hotel: HotelDto;
  roomTypes: RoomTypeDto[];
  availability?: RoomTypeOffer[];
}

export type AvailabilityNightDto = WithRequired<
  Schemas['AvailabilityNightDto'],
  'date' | 'totalRooms' | 'availableRooms'
>;

export type GuestDto = WithRequired<Schemas['GuestDto'], 'id' | 'firstName' | 'lastName'>;

export type BookingDto = WithRequired<
  Schemas['BookingDto'],
  | 'id'
  | 'reference'
  | 'userId'
  | 'hotelId'
  | 'roomTypeId'
  | 'checkInDate'
  | 'checkOutDate'
  | 'numberOfRooms'
  | 'numberOfGuests'
  | 'status'
  | 'totalPrice'
  | 'currency'
  | 'contactEmail'
> & { status: BookingStatus; guests: GuestDto[] };

export type HotelSearchRequest = Schemas['HotelSearchRequest'];
export type CreateBookingRequest = Schemas['CreateBookingRequest'];
export type GuestRequest = Schemas['GuestRequest'];
export type RegisterRequest = Schemas['RegisterRequest'];
export type LoginRequest = Schemas['LoginRequest'];
export type CreateHotelRequest = Schemas['CreateHotelRequest'];
export type UpdateHotelRequest = Schemas['UpdateHotelRequest'];
export type CreateRoomTypeRequest = Schemas['CreateRoomTypeRequest'];
export type UpdateRoomTypeRequest = Schemas['UpdateRoomTypeRequest'];
export type AvailabilityUpsertRequest = Schemas['AvailabilityUpsertRequest'];

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Envelope<T> {
  data: T;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PageMeta;
}
