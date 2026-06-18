import { Show } from 'solid-js';
import { AlertTriangle } from 'lucide-solid';
import { formatMoney } from '@/lib/utils/money';

export function BudgetBar(props: {
  totalCost: number;
  budgetTotal: number;
  budgetRemaining: number;
  withinBudget: boolean;
  currency: string;
}) {
  const pct = () =>
    props.budgetTotal > 0 ? Math.min(100, Math.round((props.totalCost / props.budgetTotal) * 100)) : 0;
  const overage = () => Math.max(0, props.totalCost - props.budgetTotal);

  return (
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Budget reconciliation</h2>
        <Show when={!props.withinBudget}>
          <span class="flex items-center gap-1 text-sm font-medium text-over">
            <AlertTriangle size={16} aria-hidden="true" />
            Over by {formatMoney(overage(), props.currency)}
          </span>
        </Show>
      </div>
      <div
        class="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(props.totalCost)}
        aria-valuemin={0}
        aria-valuemax={Math.round(props.budgetTotal)}
        aria-label={`Total cost ${formatMoney(props.totalCost, props.currency)} of budget ${formatMoney(props.budgetTotal, props.currency)}`}
      >
        <div
          class={`h-3 rounded-full ${props.withinBudget ? 'bg-within' : 'bg-over'}`}
          style={{ width: `${pct()}%` }}
        />
      </div>
      <div class="mt-2 flex justify-between text-sm text-slate-600">
        <span>Cost {formatMoney(props.totalCost, props.currency)}</span>
        <span>Budget {formatMoney(props.budgetTotal, props.currency)}</span>
      </div>
      <p class="mt-1 text-sm text-slate-600">
        Remaining:{' '}
        <span class={`font-semibold ${props.withinBudget ? 'text-within' : 'text-over'}`}>
          {formatMoney(props.budgetRemaining, props.currency)}
        </span>
      </p>
      <p class="sr-only">
        {props.withinBudget
          ? 'This trip is within budget.'
          : `This trip is over budget by ${formatMoney(overage(), props.currency)}.`}
      </p>
    </div>
  );
}
