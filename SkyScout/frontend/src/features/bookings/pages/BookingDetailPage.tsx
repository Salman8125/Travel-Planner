import { format, parseISO } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/common/ErrorState";
import { FlightTime } from "@/components/common/FlightTime";
import { Money } from "@/components/common/Money";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFlight } from "@/features/flights/queries";
import { CABIN_LABELS } from "@/types/app";

import { BookingStatusBadge, isCancellable } from "../components/BookingStatusBadge";
import { CancelDialog } from "../components/CancelDialog";
import { useBooking } from "../queries";

export default function BookingDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const query = useBooking(reference);
  const flightQuery = useFlight(query.data?.flightId);

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="container py-8">
        <ErrorState error={query.error} title="Booking not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const booking = query.data;
  const flight = flightQuery.data;

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/bookings">
          <ChevronLeft className="h-4 w-4" /> All bookings
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Booking reference</p>
              <CardTitle className="font-mono text-2xl tracking-wider">{booking.reference}</CardTitle>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {flight && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FlightTime iso={flight.scheduledDeparture} timezone={flight.origin.timezone} showDate />
                <p className="text-xs text-muted-foreground">
                  {flight.origin.city} ({flight.origin.iataCode})
                </p>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                <p>{flight.airline.name}</p>
                <p>{flight.flightNumber}</p>
              </div>
              <div className="text-right">
                <FlightTime iso={flight.scheduledArrival} timezone={flight.destination.timezone} showDate />
                <p className="text-xs text-muted-foreground">
                  {flight.destination.city} ({flight.destination.iataCode})
                </p>
              </div>
            </div>
          )}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Cabin</dt>
              <dd>{CABIN_LABELS[booking.cabin]}</dd>
            </div>
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Total paid</dt>
              <dd className="font-semibold">
                <Money value={booking.totalPrice} currency={booking.currency} />
              </dd>
            </div>
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="truncate">{booking.contactEmail}</dd>
            </div>
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Booked</dt>
              <dd>{format(parseISO(booking.createdAt), "d MMM yyyy, HH:mm")}</dd>
            </div>
            {booking.cancelledAt && (
              <div className="flex justify-between border-t py-2">
                <dt className="text-muted-foreground">Cancelled</dt>
                <dd>{format(parseISO(booking.cancelledAt), "d MMM yyyy, HH:mm")}</dd>
              </div>
            )}
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Passengers ({booking.passengers.length})</h3>
            <ul className="space-y-1 text-sm">
              {booking.passengers.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span>
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.type}
                    {p.seatNumber ? ` · Seat ${p.seatNumber}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {isCancellable(booking.status) && (
            <div className="flex justify-end border-t pt-4">
              <CancelDialog reference={booking.reference} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
