import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAirlines, useAirports } from "@/features/reference/queries";
import { applyApiError } from "@/lib/applyApiError";
import { CABINS } from "@/types/app";

import type { CreateFlightInput } from "../api";
import { useCreateFlight } from "../mutations";
import { createFlightSchema, type CreateFlightFormValues } from "../schemas";

export function FlightForm() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateFlight();
  const airports = useAirports().data?.data ?? [];
  const airlines = useAirlines().data?.data ?? [];

  const form = useForm<CreateFlightFormValues>({
    resolver: zodResolver(createFlightSchema),
    defaultValues: {
      flightNumber: "",
      airlineIata: "",
      origin: "",
      destination: "",
      scheduledDeparture: "",
      scheduledArrival: "",
      cabins: [{ cabin: "ECONOMY", totalSeats: 150, basePrice: "199.00", currency: "USD" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "cabins" });

  const onSubmit = form.handleSubmit((values) => {
    const input: CreateFlightInput = {
      flightNumber: values.flightNumber,
      airlineIata: values.airlineIata,
      origin: values.origin,
      destination: values.destination,
      scheduledDeparture: new Date(values.scheduledDeparture).toISOString(),
      scheduledArrival: new Date(values.scheduledArrival).toISOString(),
      cabins: values.cabins.map((c) => ({ ...c, totalSeats: Number(c.totalSeats) })),
    };
    mutation.mutate(input, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => applyApiError<CreateFlightFormValues>(error, form.setError),
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Create flight
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create flight</DialogTitle>
          <DialogDescription>Add a flight and its cabin inventory.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight number</FormLabel>
                    <FormControl>
                      <Input placeholder="EK1147" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="airlineIata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select airline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {airlines.map((a) => (
                          <SelectItem key={a.id} value={a.iataCode}>
                            {a.name} ({a.iataCode})
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
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {airports.map((a) => (
                          <SelectItem key={a.id} value={a.iataCode}>
                            {a.city} ({a.iataCode})
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
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {airports.map((a) => (
                          <SelectItem key={a.id} value={a.iataCode}>
                            {a.city} ({a.iataCode})
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
                name="scheduledDeparture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledArrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arrival</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Cabins</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ cabin: "BUSINESS", totalSeats: 40, basePrice: "599.00", currency: "USD" })}
                  disabled={fields.length >= 3}
                >
                  <Plus className="h-4 w-4" /> Add cabin
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-5">
                  <FormField
                    control={form.control}
                    name={`cabins.${index}.cabin`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CABINS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
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
                    name={`cabins.${index}.totalSeats`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" min={1} placeholder="Seats" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`cabins.${index}.basePrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Price" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-start gap-1">
                    <FormField
                      control={form.control}
                      name={`cabins.${index}.currency`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="USD" maxLength={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove cabin">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Create flight
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
