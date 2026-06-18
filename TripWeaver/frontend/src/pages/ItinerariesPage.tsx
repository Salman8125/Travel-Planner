import { createSignal, Show, Suspense } from 'solid-js';
import { A } from '@solidjs/router';
import { MapPinned, Plus } from 'lucide-solid';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useItineraries } from '@/features/itineraries/queries';
import { ItineraryTable } from '@/features/itineraries/components/ItineraryTable';

export default function ItinerariesPage() {
  const [status, setStatus] = createSignal('');
  const [page, setPage] = createSignal(1);
  const query = useItineraries(() => ({ status: status() || undefined, page: page(), pageSize: 20 }));

  return (
    <div>
      <PageHeader
        title="My itineraries"
        actions={
          <A href="/itineraries/new">
            <Button>
              <Plus size={16} aria-hidden="true" /> New trip
            </Button>
          </A>
        }
      />

      <div class="mb-4 flex items-center gap-2">
        <label for="status-filter" class="text-sm text-slate-600">
          Status
        </label>
        <select
          id="status-filter"
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
          <Show when={query.data} keyed fallback={<EmptyState title="No itineraries yet" />}>
            {(data) => (
              <Show
                when={data.data.length > 0}
                fallback={
                  <EmptyState
                    title="No itineraries"
                    message="Build your first trip to see it here."
                    icon={<MapPinned size={32} class="text-slate-300" aria-hidden="true" />}
                    action={
                      <A href="/itineraries/new">
                        <Button>New trip</Button>
                      </A>
                    }
                  />
                }
              >
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
