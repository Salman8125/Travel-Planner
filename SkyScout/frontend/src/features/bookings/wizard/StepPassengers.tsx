import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingWizardStore } from "@/store/bookingWizardStore";
import { PASSENGER_TYPES, type FlightSummary } from "@/types/app";

import { passengersFormSchema, type PassengersFormValues } from "../schemas";

const TYPE_LABELS: Record<string, string> = { ADULT: "Adult", CHILD: "Child", INFANT: "Infant" };

export function StepPassengers({ flight }: { flight: FlightSummary }) {
  const cabin = useBookingWizardStore((s) => s.cabin);
  const passengers = useBookingWizardStore((s) => s.passengers);
  const setPassengers = useBookingWizardStore((s) => s.setPassengers);
  const setStep = useBookingWizardStore((s) => s.setStep);

  const maxPassengers = Math.min(9, flight.cabins.find((c) => c.cabin === cabin)?.availableSeats ?? 9);

  const form = useForm<PassengersFormValues>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: {
      passengers: passengers.map((p) => ({ ...p, passportNumber: p.passportNumber ?? "" })),
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "passengers" });

  const onSubmit = form.handleSubmit((values) => {
    setPassengers(values.passengers);
    setStep(2);
  });

  const goBack = () => {
    setPassengers(form.getValues("passengers"));
    setStep(0);
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Passenger details</h2>
            <p className="text-sm text-muted-foreground">
              Names must match a government-issued ID. Up to {maxPassengers}.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ firstName: "", lastName: "", dateOfBirth: "", type: "ADULT", passportNumber: "" })}
            disabled={fields.length >= maxPassengers}
          >
            <Plus className="h-4 w-4" /> Add passenger
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Passenger {index + 1}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={`Remove passenger ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.firstName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input autoComplete="given-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.lastName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input autoComplete="family-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.dateOfBirth`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PASSENGER_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {TYPE_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.passportNumber`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Passport number (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
}
