import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FlightTime } from "@/components/common/FlightTime";
import { Money } from "@/components/common/Money";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { estimateTotal } from "@/lib/money";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import { CABIN_LABELS, type FlightSummary } from "@/types/app";

import { contactSchema, type ContactFormValues } from "../schemas";
import { WizardNav } from "./WizardNav";

export function StepReview({ flight }: { flight: FlightSummary }) {
  const { user } = useAuth();
  const cabin = useBookingWizardStore((s) => s.cabin);
  const passengers = useBookingWizardStore((s) => s.passengers);
  const contactEmail = useBookingWizardStore((s) => s.contactEmail);
  const setContactEmail = useBookingWizardStore((s) => s.setContactEmail);
  const setStep = useBookingWizardStore((s) => s.setStep);

  const selectedCabin = flight.cabins.find((c) => c.cabin === cabin);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { contactEmail: contactEmail || user?.email || "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setContactEmail(values.contactEmail);
    setStep(3);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div>
          <h2 className="text-lg font-semibold">Review your trip</h2>
          <p className="text-sm text-muted-foreground">Confirm the details before payment.</p>
        </div>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{flight.airline.name}</p>
                <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
              </div>
              {selectedCabin && (
                <p className="text-sm font-medium">{CABIN_LABELS[selectedCabin.cabin]}</p>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <FlightTime iso={flight.scheduledDeparture} timezone={flight.origin.timezone} showDate />
                <p className="text-xs text-muted-foreground">{flight.origin.city}</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-right">
                <FlightTime iso={flight.scheduledArrival} timezone={flight.destination.timezone} showDate />
                <p className="text-xs text-muted-foreground">{flight.destination.city}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Passengers ({passengers.length})</h3>
          <ul className="space-y-1 text-sm">
            {passengers.map((p, i) => (
              <li key={i} className="flex justify-between rounded-md border px-3 py-2">
                <span>
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-muted-foreground">{p.type}</span>
              </li>
            ))}
          </ul>
        </div>

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormDescription>We&apos;ll send the booking confirmation here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCabin && (
          <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
            <span className="font-medium">Estimated total</span>
            <span className="text-xl font-bold">
              <Money
                value={estimateTotal(selectedCabin.basePrice, passengers.length)}
                currency={selectedCabin.currency}
              />
            </span>
          </div>
        )}

        <WizardNav onBack={() => setStep(1)} nextLabel="Continue to payment" onNext={() => onSubmit()} />
      </form>
    </Form>
  );
}
