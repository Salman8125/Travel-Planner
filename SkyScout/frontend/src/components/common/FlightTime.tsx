import { formatDay, formatTime } from "@/lib/date";

interface FlightTimeProps {
  iso: string;
  timezone: string;
  showDate?: boolean;
  className?: string;
}

export function FlightTime({ iso, timezone, showDate = false, className }: FlightTimeProps) {
  return (
    <span className={className}>
      <span className="font-semibold tabular-nums">{formatTime(iso, timezone)}</span>
      {showDate && <span className="ml-1 text-xs text-muted-foreground">{formatDay(iso, timezone)}</span>}
    </span>
  );
}
