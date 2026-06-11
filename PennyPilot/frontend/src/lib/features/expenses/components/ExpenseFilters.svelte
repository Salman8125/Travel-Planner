<script lang="ts">
  import Select from '$lib/components/ui/Select.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import { EXPENSE_STATES, type Category } from '$lib/api/models';

  interface Props {
    status: string;
    category: string;
    dateFrom: string;
    dateTo: string;
    categories: Category[];
    onChange: (patch: Record<string, string>) => void;
  }

  let { status, category, dateFrom, dateTo, categories, onChange }: Props = $props();

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...EXPENSE_STATES.map((s) => ({ value: s, label: s }))
  ];
  const categoryOptions = $derived([
    { value: '', label: 'All categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name }))
  ]);

  const value = (e: Event) => (e.currentTarget as HTMLInputElement | HTMLSelectElement).value;
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
  <Select
    value={status}
    options={statusOptions}
    aria-label="Filter by status"
    onchange={(e) => onChange({ status: value(e) })}
  />
  <Select
    value={category}
    options={categoryOptions}
    aria-label="Filter by category"
    onchange={(e) => onChange({ category: value(e) })}
  />
  <Input
    type="date"
    value={dateFrom}
    aria-label="From date"
    onchange={(e) => onChange({ date_from: value(e) })}
  />
  <Input
    type="date"
    value={dateTo}
    aria-label="To date"
    onchange={(e) => onChange({ date_to: value(e) })}
  />
</div>
