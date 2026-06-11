<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ArrowLeft, Plus, ReceiptText } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import type { Expense } from '$lib/api/models';
  import { budgetQuery } from '$lib/features/budgets/queries';
  import { categoriesQuery } from '$lib/features/categories/queries';
  import { expensesQuery } from '$lib/features/expenses/queries';
  import ExpenseFilters from '$lib/features/expenses/components/ExpenseFilters.svelte';
  import ExpenseTable from '$lib/features/expenses/components/ExpenseTable.svelte';
  import ExpenseEditForm from '$lib/features/expenses/components/ExpenseEditForm.svelte';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
  const categories = categoriesQuery(() => id);

  const current = $derived.by(() => {
    const sp = $page.url.searchParams;
    return {
      status: sp.get('status') ?? '',
      category: sp.get('category') ?? '',
      date_from: sp.get('date_from') ?? '',
      date_to: sp.get('date_to') ?? '',
      page: Math.max(1, Number(sp.get('page') ?? '1'))
    };
  });

  const hasFilters = $derived(
    !!(current.status || current.category || current.date_from || current.date_to)
  );

  const expenses = expensesQuery(
    () => id,
    () => ({
      page: current.page,
      pageSize: 20,
      ordering: '-date',
      status: current.status || undefined,
      category: current.category || undefined,
      date_from: current.date_from || undefined,
      date_to: current.date_to || undefined
    })
  );

  const currency = $derived(budget.data?.currency ?? 'USD');
  const isClosed = $derived(budget.data?.status === 'CLOSED');

  let editTarget = $state<Expense | null>(null);
  let editOpen = $state(false);

  function updateUrl(patch: Record<string, string | number>) {
    const sp = new URLSearchParams($page.url.searchParams);
    for (const [key, val] of Object.entries(patch)) {
      if (val === '' || val === undefined || val === null) sp.delete(key);
      else sp.set(key, String(val));
    }
    goto(`?${sp.toString()}`, { keepFocus: true, noScroll: true });
  }

  function startEdit(expense: Expense) {
    editTarget = expense;
    editOpen = true;
  }
</script>

<svelte:head><title>Expenses · PennyPilot</title></svelte:head>

<div class="space-y-6">
  <Button href={`/budgets/${id}`} variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to budget
  </Button>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Expenses</h1>
      <p class="text-sm text-muted-foreground">{budget.data?.name ?? ''}</p>
    </div>
    <Button href={`/budgets/${id}/expenses/new`} disabled={isClosed}>
      <Plus class="h-4 w-4" /> Record expense
    </Button>
  </div>

  <ExpenseFilters
    status={current.status}
    category={current.category}
    dateFrom={current.date_from}
    dateTo={current.date_to}
    categories={categories.data ?? []}
    onChange={(patch) => updateUrl({ ...patch, page: 1 })}
  />

  {#if expenses.isPending}
    <Skeleton class="h-64 w-full" />
  {:else if expenses.isError}
    <ErrorState error={expenses.error} onRetry={() => expenses.refetch()} />
  {:else if expenses.data}
    {#if expenses.data.items.length === 0}
      <EmptyState
        title={hasFilters ? 'No expenses match your filters' : 'No expenses yet'}
        description={hasFilters
          ? 'Try adjusting the filters above.'
          : 'Record your first expense to see it here.'}
      >
        {#snippet icon()}<ReceiptText class="h-6 w-6" />{/snippet}
        {#snippet action()}
          {#if !hasFilters && !isClosed}
            <Button href={`/budgets/${id}/expenses/new`}>Record expense</Button>
          {/if}
        {/snippet}
      </EmptyState>
    {:else}
      <ExpenseTable expenses={expenses.data.items} {currency} budgetId={id} onEdit={startEdit} />
      <Pagination meta={expenses.data.meta} onPage={(p) => updateUrl({ page: p })} />
    {/if}
  {/if}
</div>

<Modal bind:open={editOpen} title="Edit expense">
  {#if editTarget}
    <ExpenseEditForm
      budgetId={id}
      expense={editTarget}
      categories={categories.data ?? []}
      onDone={() => (editOpen = false)}
    />
  {/if}
</Modal>
