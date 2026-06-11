import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Info } from "lucide-react";

import { Money } from "@/components/common/Money";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/ApiError";
import { estimateTotal } from "@/lib/money";
import { queryKeys } from "@/lib/queryKeys";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import { toast } from "sonner";
import type { FlightSummary } from "@/types/app";

import type { CreateBookingInput } from "../api";
import { useCreateBooking } from "../mutations";
import { WizardNav } from "./WizardNav";

export function StepPayment({ flight }: { flight: FlightSummary }) {
  const queryClient = useQueryClient();
  const cabin = useBookingWizardStore((s) => s.cabin);
  const passengers = useBookingWizardStore((s) => s.passengers);
  const contactEmail = useBookingWizardStore((s) => s.contactEmail);
  const ensureIdempotencyKey = useBookingWizardStore((s) => s.ensureIdempotencyKey);
  const resetIdempotencyKey = useBookingWizardStore((s) => s.resetIdempotencyKey);
  const setConfirmation = useBookingWizardStore((s) => s.setConfirmation);
  const setStep = useBookingWizardStore((s) => s.setStep);

  const mutation = useCreateBooking();
  const selectedCabin = flight.cabins.find((c) => c.cabin === cabin);

  const pay = () => {
    if (!cabin) {
      setStep(0);
      return;
    }
    const input: CreateBookingInput = {
      flightId: flight.id,
      cabin,
      contactEmail,
      passengers: passengers.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        type: p.type,
        ...(p.passportNumber?.trim() ? { passportNumber: p.passportNumber.trim() } : {}),
      })),
    };
    const idempotencyKey = ensureIdempotencyKey();

    mutation.mutate(
      { input, idempotencyKey },
      {
        onSuccess: (booking) => {
          toast.success(`Booking confirmed — ${booking.reference}`);
          setConfirmation(booking);
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.status === 409) {
              toast.error(error.message || "Those seats are no longer available.");
              queryClient.invalidateQueries({ queryKey: queryKeys.flights.detail(flight.id) });
              resetIdempotencyKey();
              setStep(0);
              return;
            }
            if (error.status === 402) {
              toast.error("Payment was declined. Try a different contact email.");
              resetIdempotencyKey();
              return;
            }
            if (error.status === 400) {
              toast.error(error.message || "Please check the passenger details.");
              setStep(1);
              return;
            }
          }
          toast.error(error instanceof ApiError ? error.message : "Couldn't complete the booking.");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Payment</h2>
        <p className="text-sm text-muted-foreground">This is a mock payment — no card is charged.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="card-number">Card number</Label>
              <Input id="card-number" placeholder="4242 4242 4242 4242" disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="card-exp">Expiry</Label>
                <Input id="card-exp" placeholder="12 / 30" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input id="card-cvc" placeholder="123" disabled />
              </div>
            </div>
          </div>
          <p className="flex items-start gap-2 rounded-md bg-secondary p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Tip: use a contact email containing <code className="font-mono">+fail</code> (e.g.
            you+fail@example.com) to simulate a declined payment.
          </p>
        </CardContent>
      </Card>

      {selectedCabin && (
        <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
          <span className="font-medium">Total due</span>
          <span className="text-xl font-bold">
            <Money
              value={estimateTotal(selectedCabin.basePrice, passengers.length)}
              currency={selectedCabin.currency}
            />
          </span>
        </div>
      )}

      <WizardNav
        onBack={() => setStep(2)}
        onNext={pay}
        nextLabel={
          selectedCabin
            ? `Pay ${estimateTotal(selectedCabin.basePrice, passengers.length).toFixed(2)} ${selectedCabin.currency}`
            : "Pay"
        }
        nextLoading={mutation.isPending}
      />
      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <CreditCard className="h-3 w-3" /> Secured mock checkout
      </p>
    </div>
  );
}
