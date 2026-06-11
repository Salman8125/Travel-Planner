import { useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFlight } from "@/features/flights/queries";
import { isBookable } from "@/features/flights/fares";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import type { Cabin } from "@/types/app";

import { StepCabin } from "../wizard/StepCabin";
import { StepConfirmation } from "../wizard/StepConfirmation";
import { StepPassengers } from "../wizard/StepPassengers";
import { StepPayment } from "../wizard/StepPayment";
import { StepReview } from "../wizard/StepReview";
import { WizardStepper } from "../wizard/WizardStepper";

export default function BookingWizardPage() {
  const { flightId } = useParams<{ flightId: string }>();
  const [params] = useSearchParams();
  const cabinParam = params.get("cabin") as Cabin | null;

  const query = useFlight(flightId);
  const init = useBookingWizardStore((s) => s.init);
  const step = useBookingWizardStore((s) => s.step);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flightId) init(flightId, cabinParam);
  }, [flightId, cabinParam, init]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="container py-8">
        <ErrorState error={query.error} title="Flight not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const flight = query.data;

  if (step !== 4 && !isBookable(flight)) {
    return (
      <div className="container max-w-2xl py-8">
        <EmptyState
          title="This flight can't be booked"
          description="It may be sold out, cancelled, or already departed."
          action={
            <Button asChild>
              <Link to="/flights">Search other flights</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl space-y-8 py-8">
      <WizardStepper current={step} />
      <Card>
        <CardContent className="p-6">
          <div ref={headingRef} tabIndex={-1} className="outline-none">
            {step === 0 && <StepCabin flight={flight} />}
            {step === 1 && <StepPassengers flight={flight} />}
            {step === 2 && <StepReview flight={flight} />}
            {step === 3 && <StepPayment flight={flight} />}
            {step === 4 && <StepConfirmation />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
