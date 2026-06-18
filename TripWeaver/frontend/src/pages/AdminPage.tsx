import { createSignal, Show, Suspense } from 'solid-js';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useItineraries } from '@/features/itineraries/queries';
import { ItineraryTable } from '@/features/itineraries/components/ItineraryTable';

export default function AdminPage() {
  const [status, setStatus] = createSignal('');
  const [page, setPage] = createSignal(1);
  const query = useItineraries(() => ({
    status: status() || undefined,
    page: page(),
    pageSize: 20,
    scope: 'admin',
  }));

  return (
    <div>
      <PageHeader title="Admin · all itineraries" subtitle="Oversight of every user's itineraries." />

      <div class="mb-4 flex items-center gap-2">
        <label for="admin-status" class="text-sm text-slate-600">
          Status
        </label>
        <select
          id="admin-status"
          value={status()}
          onChange={(e) => {
            setStatus(e.currentTarget.value);
            setPage(1);
          }}
          class="h-9 rounded-md border border-slate-300 px-2 text-sm"
        >
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <Suspense fallback={<Skeleton class="h-64 w-full" />}>
        <Show
          when={!query.isError}
          fallback={<ErrorState message={query.error?.message} onRetry={() => query.refetch()} />}
        >
          <Show when={query.data} keyed fallback={<EmptyState title="No itineraries" />}>
            {(data) => (
              <Show when={data.data.length > 0} fallback={<EmptyState title="No itineraries" />}>
                <ItineraryTable items={data.data} />
                <Pagination meta={data.meta} onPage={setPage} />
              </Show>
            )}
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}
