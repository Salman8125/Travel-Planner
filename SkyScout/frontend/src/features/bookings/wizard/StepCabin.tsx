import { CabinPicker } from "@/features/flights/components/CabinPicker";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import type { FlightSummary } from "@/types/app";

import { WizardNav } from "./WizardNav";

export function StepCabin({ flight }: { flight: FlightSummary }) {
  const cabin = useBookingWizardStore((s) => s.cabin);
  const setCabin = useBookingWizardStore((s) => s.setCabin);
  const setStep = useBookingWizardStore((s) => s.setStep);
  const passengerCount = useBookingWizardStore((s) => s.passengers.length);

  const selected = flight.cabins.find((c) => c.cabin === cabin);
  const canContinue = !!selected && selected.availableSeats >= passengerCount;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Choose your cabin</h2>
        <p className="text-sm text-muted-foreground">
          Prices are per passenger. {passengerCount} passenger{passengerCount === 1 ? "" : "s"} selected.
        </p>
      </div>
      <CabinPicker
        cabins={flight.cabins}
        totalPassengers={passengerCount}
        value={cabin ?? undefined}
        onChange={setCabin}
      />
      <WizardNav
        onNext={() => setStep(1)}
        nextDisabled={!canContinue}
        backLabel="Back to flight"
        backTo={`/flights/${flight.id}`}
      />
    </div>
  );
}
