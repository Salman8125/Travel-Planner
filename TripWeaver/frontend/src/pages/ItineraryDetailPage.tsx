import { createSignal, For, Show, Suspense } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { ArrowLeft, Ban, Pencil } from 'lucide-solid';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRange } from '@/lib/utils/date';
import type { ItineraryDayDto } from '@/lib/api/models';
import { useItinerary } from '@/features/itineraries/queries';
import { BudgetBar } from '@/features/itineraries/components/BudgetBar';
import { DayCard } from '@/features/itineraries/components/DayCard';
import { StatusBadge, WithinBudgetBadge } from '@/features/itineraries/components/badges';
import { CancelDialog } from '@/features/itineraries/components/CancelDialog';
import { ActivityEditDialog } from '@/features/itineraries/components/ActivityEditDialog';
import { RenameDialog } from '@/features/itineraries/components/RenameDialog';

export default function ItineraryDetailPage() {
  const params = useParams();
  const reference = () => params.reference ?? '';
  const query = useItinerary(reference);
  const rowVersion = () => query.data?.rowVersion ?? '';

  const [cancelOpen, setCancelOpen] = createSignal(false);
  const [renameOpen, setRenameOpen] = createSignal(false);
  const [editDay, setEditDay] = createSignal<ItineraryDayDto | null>(null);

  return (
    <div>
      <A
        href="/itineraries"
        class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} aria-hidden="true" /> All itineraries
      </A>

      <Suspense fallback={<Skeleton class="h-96 w-full" />}>
        <Show
          when={!query.isError}
          fallback={<ErrorState message={query.error?.message} onRetry={() => query.refetch()} />}
        >
          <Show when={query.data} keyed>
            {(it) => (
              <div>
                <PageHeader
                  title={it.title}
                  subtitle={`${it.destination} · ${formatRange(it.startDate, it.endDate)}`}
                  actions={
                    <Show when={it.status !== 'CANCELLED'}>
                      <div class="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setRenameOpen(true)}>
                          <Pencil size={16} aria-hidden="true" /> Rename
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                          <Ban size={16} aria-hidden="true" /> Cancel trip
                        </Button>
                      </div>
                    </Show>
                  }
                />

                <div class="mb-5 flex items-center gap-2">
                  <StatusBadge status={it.status} />
                  <WithinBudgetBadge withinBudget={it.withinBudget} />
                </div>

                <BudgetBar
                  totalCost={it.totalCost}
                  budgetTotal={it.budgetTotal}
                  budgetRemaining={it.budgetRemaining}
                  withinBudget={it.withinBudget}
                  currency={it.currency}
                />

                <h2 class="mb-3 mt-6 text-lg font-semibold text-slate-900">Day-by-day plan</h2>
                <div class="grid grid-cols-1 gap-3">
                  <For each={it.days}>
                    {(day) => (
                      <DayCard
                        day={day}
                        currency={it.currency}
                        action={
                          <Show when={it.status !== 'CANCELLED'}>
                            <Button variant="ghost" size="sm" onClick={() => setEditDay(day)}>
                              <Pencil size={14} aria-hidden="true" /> Edit
                            </Button>
                          </Show>
                        }
                      />
                    )}
                  </For>
                </div>

                <CancelDialog
                  open={cancelOpen()}
                  onOpenChange={setCancelOpen}
                  reference={it.reference}
                />
                <RenameDialog
                  open={renameOpen()}
                  onOpenChange={setRenameOpen}
                  reference={it.reference}
                  currentTitle={it.title}
                  rowVersion={rowVersion}
                />
                <Show when={editDay()} keyed>
                  {(day) => (
                    <ActivityEditDialog
                      open={true}
                      onOpenChange={(o) => !o && setEditDay(null)}
                      reference={it.reference}
                      day={day}
                      rowVersion={rowVersion}
                    />
                  )}
                </Show>
              </div>
            )}
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}
