import { ArrowRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";

import { FlightTime } from "@/components/common/FlightTime";
import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/date";
import type { FlightSummary } from "@/types/app";

import { isBookable, lowestFare, totalSeatsAvailable } from "../fares";
import { FlightStatusBadge } from "./FlightStatusBadge";

export function FlightCard({ flight }: { flight: FlightSummary }) {
  const fare = lowestFare(flight);
  const seats = totalSeatsAvailable(flight);
  const bookable = isBookable(flight);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
            <Plane className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{flight.airline.name}</span>
              <span className="text-xs text-muted-foreground">{flight.flightNumber}</span>
              <FlightStatusBadge status={flight.status} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <div>
                <FlightTime iso={flight.scheduledDeparture} timezone={flight.origin.timezone} />
                <span className="ml-1 text-muted-foreground">{flight.origin.iataCode}</span>
              </div>
              <div className="flex flex-col items-center text-xs text-muted-foreground">
                <span>{formatDuration(flight.durationMinutes)}</span>
                <ArrowRight className="h-3 w-3" aria-hidden />
              </div>
              <div>
                <FlightTime iso={flight.scheduledArrival} timezone={flight.destination.timezone} />
                <span className="ml-1 text-muted-foreground">{flight.destination.iataCode}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {flight.origin.city} → {flight.destination.city}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="text-right">
            {fare ? (
              <>
                <p className="text-xs text-muted-foreground">from</p>
                <p className="text-lg font-bold">
                  <Money value={fare.basePrice} currency={fare.currency} />
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Sold out</p>
            )}
            {bookable && seats <= 9 && (
              <p className="text-xs text-warning">Only {seats} seats left</p>
            )}
          </div>
          <Button asChild disabled={!bookable}>
            <Link to={`/flights/${flight.id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
