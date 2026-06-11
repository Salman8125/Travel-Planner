import { create } from "zustand";

import { newIdempotencyKey } from "@/lib/idempotency";
import type { Booking, Cabin, PassengerType } from "@/types/app";

export interface DraftPassenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  type: PassengerType;
  passportNumber?: string;
}

export const WIZARD_STEPS = ["Cabin", "Passengers", "Review", "Payment", "Confirmation"] as const;

function emptyPassenger(): DraftPassenger {
  return { firstName: "", lastName: "", dateOfBirth: "", type: "ADULT", passportNumber: "" };
}

interface WizardState {
  flightId: string | null;
  step: number;
  cabin: Cabin | null;
  passengers: DraftPassenger[];
  contactEmail: string;
  idempotencyKey: string | null;
  confirmation: Booking | null;

  init: (flightId: string, cabin?: Cabin | null) => void;
  setStep: (step: number) => void;
  setCabin: (cabin: Cabin) => void;
  setPassengers: (passengers: DraftPassenger[]) => void;
  setContactEmail: (email: string) => void;
  ensureIdempotencyKey: () => string;
  resetIdempotencyKey: () => void;
  setConfirmation: (booking: Booking) => void;
  reset: () => void;
}

const initialDraft = {
  step: 0,
  cabin: null as Cabin | null,
  passengers: [emptyPassenger()],
  contactEmail: "",
  idempotencyKey: null as string | null,
  confirmation: null as Booking | null,
};

export const useBookingWizardStore = create<WizardState>((set, get) => ({
  flightId: null,
  ...initialDraft,

  init: (flightId, cabin) =>
    set((state) => {
      if (state.flightId === flightId) {
        return cabin && !state.cabin ? { cabin } : {};
      }
      return { flightId, ...initialDraft, cabin: cabin ?? null };
    }),

  setStep: (step) => set({ step }),

  setCabin: (cabin) => set({ cabin, idempotencyKey: null }),
  setPassengers: (passengers) => set({ passengers, idempotencyKey: null }),
  setContactEmail: (contactEmail) => set({ contactEmail, idempotencyKey: null }),

  ensureIdempotencyKey: () => {
    const existing = get().idempotencyKey;
    if (existing) return existing;
    const key = newIdempotencyKey();
    set({ idempotencyKey: key });
    return key;
  },
  resetIdempotencyKey: () => set({ idempotencyKey: null }),

  setConfirmation: (confirmation) => set({ confirmation, idempotencyKey: null, step: 4 }),

  reset: () => set({ flightId: null, ...initialDraft }),
}));
