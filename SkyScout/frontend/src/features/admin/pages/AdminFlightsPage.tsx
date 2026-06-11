import { Plane } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ListSkeleton } from "@/components/common/PageSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { SearchForm } from "@/features/flights/components/SearchForm";
import { useFlightSearch } from "@/features/flights/queries";
import type { SearchFormValues } from "@/features/flights/schemas";
import { parseSearchParams } from "@/features/flights/urlState";

import { FlightAdminTable } from "../components/FlightAdminTable";
import { FlightForm } from "../components/FlightForm";

export default function AdminFlightsPage() {
  const [params, setParams] = useSearchParams();
  const input = useMemo(() => parseSearchParams(params), [params]);
  const query = useFlightSearch(input);

  const formDefaults: Partial<SearchFormValues> | undefined = input
    ? {
        origin: input.origin,
        destination: input.destination,
        departureDate: input.departureDate,
        adults: input.passengers.adults,
        children: input.passengers.children,
        infants: input.passengers.infants,
        cabin: input.cabin ?? "ANY",
      }
    : undefined;

  const setPage = (page: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
  };

  const outbound = query.data?.outbound;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Flights</h2>
        <FlightForm />
      </div>

      <SearchForm defaultValues={formDefaults} onSearch={setParams} />

      {!input ? (
        <EmptyState
          icon={Plane}
          title="Search to manage flights"
          description="Find flights by route and date to change status or delete them."
        />
      ) : query.isLoading ? (
        <ListSkeleton rows={5} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <FlightAdminTable data={outbound?.data ?? []} />
          {outbound && <Pagination meta={outbound.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
