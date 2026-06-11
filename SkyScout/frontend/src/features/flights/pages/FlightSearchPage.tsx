import { Plane } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";

import { Filters } from "../components/Filters";
import { ResultsList } from "../components/ResultsList";
import { SearchForm } from "../components/SearchForm";
import { SortControls } from "../components/SortControls";
import { useFlightSearch } from "../queries";
import type { SearchFormValues } from "../schemas";
import { parseSearchParams } from "../urlState";

export default function FlightSearchPage() {
  const [params, setParams] = useSearchParams();
  const input = useMemo(() => parseSearchParams(params), [params]);
  const query = useFlightSearch(input);

  const formDefaults: Partial<SearchFormValues> | undefined = input
    ? {
        origin: input.origin,
        destination: input.destination,
        departureDate: input.departureDate,
        returnDate: input.returnDate ?? "",
        adults: input.passengers.adults,
        children: input.passengers.children,
        infants: input.passengers.infants,
        cabin: input.cabin ?? "ANY",
      }
    : undefined;

  const handleSearch = (record: Record<string, string>) => {
    setParams(record);
  };

  const patchParams = (patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [key, val] of Object.entries(patch)) {
      if (val === undefined || val === "") next.delete(key);
      else next.set(key, val);
    }
    if (resetPage) next.set("page", "1");
    setParams(next);
  };

  const outbound = query.data?.outbound;
  const inbound = query.data?.inbound;

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Find your flight</h1>
        <p className="text-sm text-muted-foreground">Search live availability across the SkyScout network.</p>
      </div>

      <SearchForm defaultValues={formDefaults} onSearch={handleSearch} />

      {!input ? (
        <EmptyState
          icon={Plane}
          title="Start your search"
          description="Pick an origin, destination, and date to see available flights."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Filters
              value={{
                priceMin: input.filters?.priceMin,
                priceMax: input.filters?.priceMax,
                airlines: input.filters?.airlines ?? [],
              }}
              onApply={(patch) => patchParams(patch)}
            />
          </aside>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {outbound ? `${outbound.meta.total} flight${outbound.meta.total === 1 ? "" : "s"}` : "Searching…"}
                {query.isFetching && !query.isLoading && " · updating…"}
              </p>
              <SortControls
                sortBy={input.sortBy}
                order={input.order}
                onChange={(patch) => patchParams(patch)}
              />
            </div>

            {inbound && (
              <h2 className="text-sm font-semibold uppercase text-muted-foreground">Outbound</h2>
            )}
            <ResultsList
              page={outbound}
              isLoading={query.isLoading}
              isError={query.isError}
              error={query.error}
              onRetry={() => query.refetch()}
            />
            {outbound && <Pagination meta={outbound.meta} onPageChange={(p) => patchParams({ page: String(p) }, false)} />}

            {inbound && (
              <div className="space-y-4 pt-4">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground">Return</h2>
                <ResultsList
                  page={inbound}
                  isLoading={query.isLoading}
                  isError={query.isError}
                  error={query.error}
                  onRetry={() => query.refetch()}
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
