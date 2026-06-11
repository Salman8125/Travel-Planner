import { useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/PageSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { BookingTable } from "@/features/bookings/components/BookingTable";
import { useBookings } from "@/features/bookings/queries";

export default function AdminBookingsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const query = useBookings(page, 10);

  const setPage = (next: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(next));
    setParams(nextParams);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">All bookings</h2>
      {query.isLoading ? (
        <ListSkeleton rows={6} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data || query.data.data.length === 0 ? (
        <EmptyState title="No bookings" description="There are no bookings in the system yet." />
      ) : (
        <>
          <BookingTable data={query.data.data} />
          <Pagination meta={query.data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
