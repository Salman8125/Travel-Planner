import { createSignal, For, Show } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { Plus, Trash2 } from 'lucide-solid';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spinner } from '@/components/ui/Spinner';
import type { ItineraryDayDto } from '@/lib/api/models';
import { useUpdateItinerary } from '../mutations';

interface EditRow {
  time: string;
  title: string;
  location: string;
  estimatedCost: string;
}

export function ActivityEditDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string;
  day: ItineraryDayDto;
  rowVersion: () => string;
}) {
  const update = useUpdateItinerary();
  // eslint-disable-next-line solid/reactivity -- dialog is keyed on the day; initialise once
  const [notes, setNotes] = createSignal(props.day.notes ?? '');
  const [rows, setRows] = createStore<EditRow[]>(
    // eslint-disable-next-line solid/reactivity -- initialise once from the keyed day
    props.day.activities.map((a) => ({
      time: a.time?.slice(0, 5) ?? '',
      title: a.title,
      location: a.location ?? '',
      estimatedCost: a.estimatedCost != null ? String(a.estimatedCost) : '',
    })),
  );

  const addRow = () =>
    setRows(produce((r) => r.push({ time: '', title: '', location: '', estimatedCost: '' })));
  const removeRow = (i: number) => setRows(produce((r) => r.splice(i, 1)));

  const save = async () => {
    const activities = rows
      .filter((r) => r.title.trim())
      .map((r) => ({
        time: r.time ? `${r.time}:00` : null,
        title: r.title.trim(),
        description: null,
        location: r.location.trim() || null,
        estimatedCost: r.estimatedCost.trim() ? Number(r.estimatedCost) : null,
      }));
    try {
      await update.mutateAsync({
        reference: props.reference,
        rowVersion: props.rowVersion(),
        body: { title: null, days: [{ dayNumber: props.day.dayNumber, notes: notes(), activities }] },
      });
      props.onOpenChange(false);
    } catch {
      /* errors handled by the mutation's onError */
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={`Edit day ${props.day.dayNumber}`}
      description="Update the notes and activities for this day."
      footer={
        <>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            <Show when={update.isPending}>
              <Spinner />
            </Show>
            Save changes
          </Button>
        </>
      }
    >
      <div class="flex flex-col gap-4">
        <TextField label="Notes" value={notes()} onInput={(e) => setNotes(e.currentTarget.value)} />
        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium text-slate-700">Activities</span>
          <For each={rows}>
            {(row, i) => (
              <div class="grid grid-cols-12 items-end gap-2">
                <input
                  type="time"
                  aria-label="Time"
                  value={row.time}
                  onInput={(e) => setRows(i(), 'time', e.currentTarget.value)}
                  class="col-span-3 h-10 rounded-md border border-slate-300 px-2 text-sm"
                />
                <input
                  aria-label="Title"
                  placeholder="Title"
                  value={row.title}
                  onInput={(e) => setRows(i(), 'title', e.currentTarget.value)}
                  class="col-span-4 h-10 rounded-md border border-slate-300 px-2 text-sm"
                />
                <input
                  aria-label="Estimated cost"
                  type="number"
                  step="any"
                  placeholder="Cost"
                  value={row.estimatedCost}
                  onInput={(e) => setRows(i(), 'estimatedCost', e.currentTarget.value)}
                  class="col-span-3 h-10 rounded-md border border-slate-300 px-2 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  class="col-span-2"
                  aria-label="Remove activity"
                  onClick={() => removeRow(i())}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>
            )}
          </For>
          <div>
            <Button variant="secondary" size="sm" onClick={addRow}>
              <Plus size={16} aria-hidden="true" /> Add activity
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
