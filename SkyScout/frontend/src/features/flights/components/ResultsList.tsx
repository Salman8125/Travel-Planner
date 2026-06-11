import { PlaneTakeoff } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/PageSkeleton";
import type { FlightPage } from "@/types/app";

import { FlightCard } from "./FlightCard";

interface ResultsListProps {
  page?: FlightPage;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function ResultsList({ page, isLoading, isError, error, onRetry }: ResultsListProps) {
  if (isLoading) return <ListSkeleton rows={5} />;
  if (isError) return <ErrorState error={error} title="Couldn't load flights" onRetry={onRetry} />;
  if (!page || page.data.length === 0) {
    return (
      <EmptyState
        icon={PlaneTakeoff}
        title="No flights found"
        description="Try different dates, a nearby airport, or relax your filters."
      />
    );
  }
  return (
    <div className="space-y-3">
      {page.data.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
