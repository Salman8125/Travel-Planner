import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/app";

const VARIANT: Record<BookingStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "secondary",
  FAILED: "destructive",
};

const LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}

export function isCancellable(status: BookingStatus): boolean {
  return status === "CONFIRMED" || status === "PENDING";
}
