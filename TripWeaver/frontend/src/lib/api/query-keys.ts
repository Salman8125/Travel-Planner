export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  itineraries: {
    all: ['itineraries'] as const,
    list: (params: unknown) => ['itineraries', 'list', params] as const,
    detail: (reference: string) => ['itineraries', 'detail', reference] as const,
  },
} as const;
