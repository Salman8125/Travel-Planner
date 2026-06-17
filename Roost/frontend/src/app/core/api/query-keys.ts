export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    search: (params: unknown) => ['hotels', 'search', params] as const,
    detail: (id: string, dates: unknown) => ['hotels', 'detail', id, dates] as const,
    rooms: (id: string, dates: unknown) => ['hotels', 'rooms', id, dates] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params: unknown) => ['bookings', 'list', params] as const,
    detail: (reference: string) => ['bookings', 'detail', reference] as const,
  },
} as const;
