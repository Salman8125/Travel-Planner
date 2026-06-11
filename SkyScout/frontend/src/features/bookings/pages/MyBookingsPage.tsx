import { Ticket } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/PageSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";

import { BookingTable } from "../components/BookingTable";
import { useBookings } from "../queries";

export default function MyBookingsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const query = useBookings(page, 10);

  const setPage = (next: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(next));
    setParams(nextParams);
  };

  return (
    <div className="container space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My bookings</h1>
          <p className="text-sm text-muted-foreground">View and manage your trips.</p>
        </div>
        <Button asChild>
          <Link to="/flights">Book a flight</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <ListSkeleton rows={5} />
      ) : query.isError ? (
        <ErrorState error={query.error} title="Couldn't load bookings" onRetry={() => query.refetch()} />
      ) : !query.data || query.data.data.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings yet"
          description="Once you book a flight, it'll show up here."
          action={
            <Button asChild>
              <Link to="/flights">Search flights</Link>
            </Button>
          }
        />
      ) : (
        <>
          <BookingTable data={query.data.data} />
          <Pagination meta={query.data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
