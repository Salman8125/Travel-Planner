<script lang="ts">
  import Select from '$lib/components/ui/Select.svelte';
  import { BUDGET_STATES, CURRENCIES, PERIODS, PERIOD_LABELS } from '$lib/api/models';

  interface Props {
    status: string;
    period: string;
    currency: string;
    ordering: string;
    onChange: (patch: Record<string, string>) => void;
  }

  let { status, period, currency, ordering, onChange }: Props = $props();

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...BUDGET_STATES.map((s) => ({ value: s, label: s }))
  ];
  const periodOptions = [
    { value: '', label: 'All periods' },
    ...PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }))
  ];
  const currencyOptions = [
    { value: '', label: 'All currencies' },
    ...CURRENCIES.map((c) => ({ value: c, label: c }))
  ];
  const orderingOptions = [
    { value: '-created_at', label: 'Newest first' },
    { value: 'created_at', label: 'Oldest first' },
    { value: '-total_amount', label: 'Largest total' },
    { value: 'total_amount', label: 'Smallest total' },
    { value: '-start_date', label: 'Start date (newest)' },
    { value: 'start_date', label: 'Start date (oldest)' }
  ];

  const value = (e: Event) => (e.currentTarget as HTMLSelectElement).value;
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
  <Select
    value={status}
    options={statusOptions}
    aria-label="Filter by status"
    onchange={(e) => onChange({ status: value(e) })}
  />
  <Select
    value={period}
    options={periodOptions}
    aria-label="Filter by period"
    onchange={(e) => onChange({ period: value(e) })}
  />
  <Select
    value={currency}
    options={currencyOptions}
    aria-label="Filter by currency"
    onchange={(e) => onChange({ currency: value(e) })}
  />
  <Select
    value={ordering}
    options={orderingOptions}
    aria-label="Sort order"
    onchange={(e) => onChange({ ordering: value(e) })}
  />
</div>
