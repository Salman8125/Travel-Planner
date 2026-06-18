import { For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { ItineraryListItemDto } from '@/lib/api/models';
import { formatMoney } from '@/lib/utils/money';
import { formatRange } from '@/lib/utils/date';
import { StatusBadge, WithinBudgetBadge } from './badges';

export function ItineraryTable(props: { items: ItineraryListItemDto[] }) {
  const navigate = useNavigate();
  const open = (reference: string) => navigate(`/itineraries/${reference}`);

  return (
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="w-full text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-2.5">Reference</th>
            <th class="px-4 py-2.5">Trip</th>
            <th class="px-4 py-2.5">Dates</th>
            <th class="px-4 py-2.5">Status</th>
            <th class="px-4 py-2.5 text-right">Cost</th>
            <th class="px-4 py-2.5">Budget</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.items}>
            {(it) => (
              <tr
                class="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                tabindex="0"
                onClick={() => open(it.reference)}
                onKeyDown={(e) => e.key === 'Enter' && open(it.reference)}
              >
                <td class="px-4 py-3 font-mono text-xs text-slate-500">{it.reference}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-slate-800">{it.title}</div>
                  <div class="text-xs text-slate-500">{it.destination}</div>
                </td>
                <td class="px-4 py-3 text-slate-600">{formatRange(it.startDate, it.endDate)}</td>
                <td class="px-4 py-3">
                  <StatusBadge status={it.status} />
                </td>
                <td class="px-4 py-3 text-right text-slate-700">
                  {formatMoney(it.totalCost, it.currency)}
                </td>
                <td class="px-4 py-3">
                  <WithinBudgetBadge withinBudget={it.withinBudget} />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
