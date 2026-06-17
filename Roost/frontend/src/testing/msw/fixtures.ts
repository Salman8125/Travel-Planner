import type {
  AuthResponse,
  BookingDto,
  HotelDetailDto,
  HotelSearchItem,
  RoomTypeOffer,
  UserDto,
} from '@core/api/models';

export const adminUser: UserDto = {
  id: 'u-admin',
  email: 'admin@roost.dev',
  role: 'ADMIN',
};

export const normalUser: UserDto = {
  id: 'u-user',
  email: 'user@roost.dev',
  role: 'USER',
};

export const authResponse: AuthResponse = {
  token: 'test-token-123',
  user: normalUser,
};

export const roomOffer: RoomTypeOffer = {
  roomTypeId: 'rt-1',
  name: 'Deluxe King',
  capacity: 2,
  currency: 'GBP',
  pricePerNight: 120,
  totalPrice: 240,
  availableRooms: 4,
};

export const searchItem: HotelSearchItem = {
  hotelId: 'h-1',
  name: 'The Thames View',
  city: 'London',
  country: 'GB',
  starRating: 4,
  timezone: 'Europe/London',
  currency: 'GBP',
  pricePerNight: 120,
  totalPrice: 240,
  roomTypes: [roomOffer],
};

export const hotelDetail: HotelDetailDto = {
  hotel: {
    id: 'h-1',
    name: 'The Thames View',
    city: 'London',
    country: 'GB',
    starRating: 4,
    latitude: 51.5,
    longitude: -0.12,
    timezone: 'Europe/London',
    description: 'A riverside hotel.',
  },
  roomTypes: [
    {
      id: 'rt-1',
      name: 'Deluxe King',
      capacity: 2,
      basePricePerNight: 120,
      currency: 'GBP',
    },
  ],
  availability: [roomOffer],
};

export const booking: BookingDto = {
  id: 'b-1',
  reference: 'RST-ABC123',
  userId: 'u-user',
  hotelId: 'h-1',
  roomTypeId: 'rt-1',
  checkInDate: '2026-07-01',
  checkOutDate: '2026-07-03',
  numberOfRooms: 1,
  numberOfGuests: 2,
  status: 'CONFIRMED',
  totalPrice: 240,
  currency: 'GBP',
  contactEmail: 'user@roost.dev',
  guests: [{ id: 'g-1', firstName: 'Ada', lastName: 'Lovelace' }],
};
