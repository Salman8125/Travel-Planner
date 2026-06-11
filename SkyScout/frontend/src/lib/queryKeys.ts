import type { SearchInput } from "@/features/flights/schemas";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  flights: {
    all: ["flights"] as const,
    search: (input: SearchInput) => ["flights", "search", input] as const,
    detail: (id: string) => ["flights", "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (page: number, pageSize: number) => ["bookings", "list", page, pageSize] as const,
    detail: (reference: string) => ["bookings", "detail", reference] as const,
  },
  reference: {
    airports: (page: number, pageSize: number) => ["reference", "airports", page, pageSize] as const,
    airlines: (page: number, pageSize: number) => ["reference", "airlines", page, pageSize] as const,
    airlinesAll: ["reference", "airlines", "all"] as const,
  },
} as const;
