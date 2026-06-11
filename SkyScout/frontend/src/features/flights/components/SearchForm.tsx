import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

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
import { useAirports } from "@/features/reference/queries";
import { todayISODate } from "@/lib/date";

import { searchFormSchema, type SearchFormValues } from "../schemas";

interface SearchFormProps {
  defaultValues?: Partial<SearchFormValues>;
  onSearch: (params: Record<string, string>) => void;
}

function toParams(v: SearchFormValues): Record<string, string> {
  const out: Record<string, string> = {
    origin: String(v.origin).toUpperCase(),
    destination: String(v.destination).toUpperCase(),
    departureDate: v.departureDate,
    adults: String(Number(v.adults)),
    children: String(Number(v.children)),
    infants: String(Number(v.infants)),
    page: "1",
    pageSize: "10",
  };
  if (v.returnDate) out.returnDate = v.returnDate;
  if (v.cabin && v.cabin !== "ANY") out.cabin = v.cabin;
  return out;
}

export function SearchForm({ defaultValues, onSearch }: SearchFormProps) {
  const airportsQuery = useAirports();
  const airports = airportsQuery.data?.data ?? [];

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureDate: todayISODate(),
      returnDate: "",
      adults: 1,
      children: 0,
      infants: 0,
      cabin: "ANY",
      ...defaultValues,
    },
  });

  const onSubmit = form.handleSubmit((values) => onSearch(toParams(values)));

  const renderAirportField = (name: "origin" | "destination", label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {airports.length > 0 ? (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select airport" />
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
          ) : (
            <FormControl>
              <Input placeholder="IATA code" maxLength={3} className="uppercase" {...field} />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {renderAirportField("origin", "From")}
              {renderAirportField("destination", "To")}
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure</FormLabel>
                    <FormControl>
                      <Input type="date" min={todayISODate()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" min={form.watch("departureDate")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {(["adults", "children", "infants"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{name}</FormLabel>
                      <FormControl>
                        <Input type="number" min={name === "adults" ? 1 : 0} max={9} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="cabin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabin</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ANY">Any cabin</SelectItem>
                        <SelectItem value="ECONOMY">Economy</SelectItem>
                        <SelectItem value="BUSINESS">Business</SelectItem>
                        <SelectItem value="FIRST">First</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4" /> Search
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
