import type {
  AuthResponse,
  ItineraryDto,
  ItineraryListItemDto,
  UserDto,
} from '@/lib/api/models';

export const normalUser: UserDto = { id: 'u-1', email: 'user@tripweaver.dev', role: 'USER' };
export const adminUser: UserDto = { id: 'u-2', email: 'admin@tripweaver.dev', role: 'ADMIN' };

export const authResponse: AuthResponse = { token: 'test-token-123', user: normalUser };

export const itinerary: ItineraryDto = {
  reference: 'ABC123',
  title: 'London Getaway',
  destination: 'London',
  startDate: '2027-07-01',
  endDate: '2027-07-03',
  status: 'DRAFT',
  totalCost: 1282,
  currency: 'USD',
  budgetTotal: 5000,
  budgetRemaining: 3718,
  withinBudget: true,
  rowVersion: 'BwMAAA==',
  createdAt: '2027-06-01T10:00:00Z',
  updatedAt: '2027-06-01T10:00:00Z',
  flight: {
    flightId: 'FL-1',
    airline: 'Skyline',
    origin: 'JFK',
    destination: 'LHR',
    departureTime: '2027-07-01T06:00:00Z',
    arrivalTime: '2027-07-01T10:00:00Z',
    price: 742,
    currency: 'USD',
    stops: 0,
  },
  hotel: {
    hotelId: 'HT-1',
    name: 'The Thames View',
    starRating: 4,
    pricePerNight: 180,
    totalPrice: 540,
    currency: 'USD',
    checkIn: '2027-07-01',
    checkOut: '2027-07-03',
    amenities: ['WiFi', 'Breakfast'],
  },
  budget: { totalBudget: 5000, spent: 1200, remaining: 3800, currency: 'USD' },
  weather: [{ date: '2027-07-01', high: 24, low: 15, condition: 'SUNNY' }],
  days: [
    {
      date: '2027-07-01',
      dayNumber: 1,
      summary: 'Arrival in London.',
      highC: 24,
      lowC: 15,
      condition: 'SUNNY',
      notes: null,
      activities: [{ time: '10:00:00', title: 'Arrive in London', description: null, location: null, estimatedCost: null }],
    },
  ],
};

export const listItem: ItineraryListItemDto = {
  reference: 'ABC123',
  title: 'London Getaway',
  destination: 'London',
  startDate: '2027-07-01',
  endDate: '2027-07-03',
  status: 'DRAFT',
  totalCost: 1282,
  currency: 'USD',
  withinBudget: true,
  createdAt: '2027-06-01T10:00:00Z',
};
