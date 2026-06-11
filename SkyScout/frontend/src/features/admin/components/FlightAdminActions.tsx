import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FLIGHT_STATUSES, type FlightStatus, type FlightSummary } from "@/types/app";

import { useDeleteFlight, useSetFlightStatus } from "../mutations";

export function FlightAdminActions({ flight }: { flight: FlightSummary }) {
  const setStatus = useSetFlightStatus();
  const del = useDeleteFlight();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={flight.status}
        onValueChange={(value) => setStatus.mutate({ id: flight.id, status: value as FlightStatus })}
        disabled={setStatus.isPending}
      >
        <SelectTrigger className="w-[140px]" aria-label="Flight status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FLIGHT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete flight {flight.flightNumber}?</DialogTitle>
            <DialogDescription>
              Flights with active bookings can&apos;t be deleted. Otherwise it is soft-deleted and removed
              from search.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={del.isPending}>
              Keep
            </Button>
            <Button
              variant="destructive"
              loading={del.isPending}
              onClick={() => del.mutate(flight.id, { onSuccess: () => setOpen(false) })}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
