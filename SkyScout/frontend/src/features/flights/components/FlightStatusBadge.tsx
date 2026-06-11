import { Badge } from "@/components/ui/badge";
import type { FlightStatus } from "@/types/app";

const VARIANT: Record<FlightStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  SCHEDULED: "secondary",
  DELAYED: "warning",
  BOARDING: "default",
  DEPARTED: "outline",
  ARRIVED: "outline",
  CANCELLED: "destructive",
};

const LABEL: Record<FlightStatus, string> = {
  SCHEDULED: "Scheduled",
  DELAYED: "Delayed",
  BOARDING: "Boarding",
  DEPARTED: "Departed",
  ARRIVED: "Arrived",
  CANCELLED: "Cancelled",
};

export function FlightStatusBadge({ status }: { status: FlightStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
