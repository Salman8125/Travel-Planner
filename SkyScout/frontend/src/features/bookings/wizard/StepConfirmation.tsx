import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import { CABIN_LABELS } from "@/types/app";

export function StepConfirmation() {
  const navigate = useNavigate();
  const confirmation = useBookingWizardStore((s) => s.confirmation);
  const reset = useBookingWizardStore((s) => s.reset);

  if (!confirmation) return null;

  const go = (path: string) => {
    reset();
    navigate(path);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
        <h2 className="text-2xl font-bold">Booking confirmed</h2>
        <p className="text-sm text-muted-foreground">Your seats are reserved. A confirmation was sent to your email.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 p-6 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Booking reference (PNR)</span>
            <span className="font-mono text-lg font-bold tracking-wider">{confirmation.reference}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Cabin</span>
            <span>{CABIN_LABELS[confirmation.cabin]}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Passengers</span>
            <span>{confirmation.passengers.length}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-semibold">
              <Money value={confirmation.totalPrice} currency={confirmation.currency} />
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={() => go(`/bookings/${confirmation.reference}`)}>View booking</Button>
        <Button variant="outline" onClick={() => go("/flights")}>
          Book another flight
        </Button>
      </div>
    </div>
  );
}
