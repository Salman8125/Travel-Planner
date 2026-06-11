import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { applyApiError } from "@/lib/applyApiError";

import { useCreateAirport } from "../mutations";
import { airportSchema, type AirportFormValues } from "../schemas";

export function AirportForm() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateAirport();
  const form = useForm<AirportFormValues>({
    resolver: zodResolver(airportSchema),
    defaultValues: { iataCode: "", name: "", city: "", country: "", timezone: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => applyApiError<AirportFormValues>(error, form.setError),
    });
  });

  const FIELDS: { name: keyof AirportFormValues; label: string; placeholder: string }[] = [
    { name: "iataCode", label: "IATA code", placeholder: "DXB" },
    { name: "name", label: "Name", placeholder: "Dubai International" },
    { name: "city", label: "City", placeholder: "Dubai" },
    { name: "country", label: "Country (2-letter)", placeholder: "AE" },
    { name: "timezone", label: "Timezone (IANA)", placeholder: "Asia/Dubai" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Add airport
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add airport</DialogTitle>
          <DialogDescription>Create a new airport reference record.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {FIELDS.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={f.placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
