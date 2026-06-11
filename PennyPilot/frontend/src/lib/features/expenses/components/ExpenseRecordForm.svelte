<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import Card from '$lib/components/ui/Card.svelte';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ApiError } from '$lib/api/ApiError';
  import { expenseDraft } from '$lib/stores/expenseDraft.svelte';
  import { debounce } from '$lib/utils/debounce';
  import { todayISO } from '$lib/utils/date';
  import type { Category, CheckBody, ExpenseCreateBody } from '$lib/api/models';
  import { expenseRecordSchema } from '../schemas';
  import { recordExpenseMutation } from '../mutations';
  import { checkPreviewQuery } from '../queries';
  import CheckPreview from './CheckPreview.svelte';

  interface Props {
    budgetId: string;
    currency: string;
    categories: Category[];
  }

  let { budgetId, currency, categories }: Props = $props();

  const record = recordExpenseMutation(untrack(() => budgetId));

  let errors = $state<Record<string, string[] | undefined>>({});
  let formError = $state<string | null>(null);
  let categoryValue = $state('');
  let debouncedBody = $state<CheckBody | null>(null);

  const setDebounced = debounce((body: CheckBody | null) => (debouncedBody = body), 350);

  onMount(() => {
    expenseDraft.reset({ date: todayISO(), currency });
    categoryValue = '';
  });

  $effect(() => {
    expenseDraft.draft.categoryId = categoryValue || null;
  });

  $effect(() => {
    const draft = expenseDraft.draft;
    expenseDraft.invalidateKey();
    if (draft.amount && Number(draft.amount) > 0) {
      setDebounced({ amount: draft.amount, category_id: draft.categoryId ?? undefined });
    } else {
      setDebounced(null);
    }
  });

  const check = checkPreviewQuery(
    () => budgetId,
    () => debouncedBody
  );

  const categoryOptions = $derived([
    { value: '', label: 'No category' },
    ...categories.map((c) => ({ value: c.id, label: c.name }))
  ]);

  function validate(): ExpenseCreateBody | null {
    const parsed = expenseRecordSchema.safeParse({
      amount: expenseDraft.draft.amount,
      date: expenseDraft.draft.date,
      description: expenseDraft.draft.description,
      category_id: expenseDraft.draft.categoryId
    });
    if (!parsed.success) {
      errors = parsed.error.flatten().fieldErrors;
      return null;
    }
    errors = {};
    return {
      amount: parsed.data.amount,
      date: parsed.data.date,
      description: parsed.data.description,
      category_id: parsed.data.category_id
    };
  }

  function handleError(err: unknown) {
    if (!(err instanceof ApiError)) {
      formError = 'Something went wrong. Please try again.';
      return;
    }
    if (err.code === 'validation_error') {
      const flat = err.flatten;
      const next: Record<string, string[] | undefined> = { ...flat.fieldErrors };
      if (flat.fieldErrors.category) next.category_id = flat.fieldErrors.category;
      errors = next;
      formError = flat.formErrors.length ? flat.formErrors.join(' ') : null;
    } else {
      formError = err.message;
      if (err.code === 'insufficient_funds') check.refetch();
    }
  }

  async function submit(event: Event) {
    event.preventDefault();
    formError = null;
    const body = validate();
    if (!body) return;
    const key = expenseDraft.beginAttempt();
    try {
      await record.mutateAsync({ body, idempotencyKey: key });
      expenseDraft.succeed();
      toast.success('Expense recorded.');
      await goto(`/budgets/${budgetId}/expenses`);
    } catch (err) {
      handleError(err);
    }
  }
</script>

<form onsubmit={submit} class="space-y-6">
  <Card class="space-y-4 p-6">
    <div class="grid gap-4 sm:grid-cols-2">
      <Field label="Amount" id="amount" errors={errors.amount} required>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-muted-foreground">{currency}</span>
          <Input id="amount" inputmode="decimal" placeholder="0.00" bind:value={expenseDraft.draft.amount} />
        </div>
      </Field>
      <Field label="Date" id="date" errors={errors.date} required>
        <Input id="date" type="date" bind:value={expenseDraft.draft.date} />
      </Field>
    </div>

    <Field label="Category" id="category" errors={errors.category_id ?? errors.category}>
      <Select id="category" options={categoryOptions} bind:value={categoryValue} />
    </Field>

    <Field label="Description" id="description" errors={errors.description} description="Optional">
      <Textarea id="description" placeholder="What was this for?" bind:value={expenseDraft.draft.description} />
    </Field>

    {#if debouncedBody}
      <CheckPreview result={check.data} {currency} loading={check.isFetching} />
    {/if}
  </Card>

  {#if formError}
    <div class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {formError}
    </div>
  {/if}

  <div class="flex justify-end gap-2">
    <Button type="button" variant="outline" href={`/budgets/${budgetId}/expenses`}>Cancel</Button>
    <Button type="submit" loading={record.isPending}>Record expense</Button>
  </div>
</form>
