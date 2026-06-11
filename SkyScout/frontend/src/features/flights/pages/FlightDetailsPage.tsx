import { ArrowRight, ChevronLeft, Clock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ErrorState } from "@/components/common/ErrorState";
import { FlightTime } from "@/components/common/FlightTime";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatDuration } from "@/lib/date";
import type { Cabin } from "@/types/app";

import { CabinPicker } from "../components/CabinPicker";
import { FlightStatusBadge } from "../components/FlightStatusBadge";
import { isBookable } from "../fares";
import { useFlight } from "../queries";

export default function FlightDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const query = useFlight(id);
  const [cabin, setCabin] = useState<Cabin | undefined>();

  if (query.isLoading) return <PageSkeleton />;
  if (query.isError || !query.data) {
    return (
      <div className="container py-8">
        <ErrorState error={query.error} title="Flight not found" onRetry={() => query.refetch()} />
      </div>
    );
  }

  const flight = query.data;
  const bookable = isBookable(flight);

  const continueToBooking = () => {
    const search = cabin ? `?cabin=${cabin}` : "";
    navigate(`/booking/${flight.id}${search}`);
  };

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/flights">
          <ChevronLeft className="h-4 w-4" /> Back to results
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              {flight.airline.name}
              <span className="text-sm font-normal text-muted-foreground">{flight.flightNumber}</span>
            </CardTitle>
            <FlightStatusBadge status={flight.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <FlightTime
                iso={flight.scheduledDeparture}
                timezone={flight.origin.timezone}
                className="text-2xl"
              />
              <p className="mt-1 text-sm font-medium">{flight.origin.city}</p>
              <p className="text-xs text-muted-foreground">{flight.origin.iataCode}</p>
            </div>
            <div className="flex flex-col items-center text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden />
              <span className="text-xs">{formatDuration(flight.durationMinutes)}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-right">
              <FlightTime
                iso={flight.scheduledArrival}
                timezone={flight.destination.timezone}
                className="text-2xl"
              />
              <p className="mt-1 text-sm font-medium">{flight.destination.city}</p>
              <p className="text-xs text-muted-foreground">{flight.destination.iataCode}</p>
            </div>
          </div>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Departs</dt>
              <dd>{formatDateTime(flight.scheduledDeparture, flight.origin.timezone)}</dd>
            </div>
            <div className="flex justify-between border-t py-2">
              <dt className="text-muted-foreground">Arrives</dt>
              <dd>{formatDateTime(flight.scheduledArrival, flight.destination.timezone)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select a cabin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookable ? (
            <>
              <CabinPicker
                cabins={flight.cabins}
                totalPassengers={1}
                value={cabin}
                onChange={setCabin}
              />
              <div className="flex justify-end">
                <Button onClick={continueToBooking} disabled={!cabin}>
                  Continue to booking
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This flight is not available for booking.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
