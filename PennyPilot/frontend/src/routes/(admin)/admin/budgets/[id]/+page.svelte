<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ArrowLeft } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import { PERIOD_LABELS } from '$lib/api/models';
  import { budgetQuery, budgetStatusQuery } from '$lib/features/budgets/queries';
  import BudgetStatusPanel from '$lib/features/budgets/components/BudgetStatusPanel.svelte';
  import PerCategoryBreakdown from '$lib/features/budgets/components/PerCategoryBreakdown.svelte';
  import { expensesQuery } from '$lib/features/expenses/queries';
  import ExpenseTable from '$lib/features/expenses/components/ExpenseTable.svelte';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
  const status = budgetStatusQuery(() => id);

  const expensePage = $derived(Math.max(1, Number($page.url.searchParams.get('page') ?? '1')));
  const expenses = expensesQuery(
    () => id,
    () => ({ page: expensePage, pageSize: 20, ordering: '-date' })
  );

  const currency = $derived(budget.data?.currency ?? 'USD');
</script>

<svelte:head><title>Admin · {budget.data?.name ?? 'Budget'} · PennyPilot</title></svelte:head>

<div class="space-y-6">
  <Button href="/admin/budgets" variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to all budgets
  </Button>

  {#if budget.isPending}
    <Skeleton class="h-9 w-64" />
    <Skeleton class="h-40 w-full" />
  {:else if budget.isError}
    <ErrorState error={budget.error} onRetry={() => budget.refetch()} />
  {:else if budget.data}
    {@const b = budget.data}
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold tracking-tight">{b.name}</h1>
        <Badge variant={b.status === 'CLOSED' ? 'secondary' : 'success'}>{b.status}</Badge>
      </div>
      <p class="text-sm text-muted-foreground">{PERIOD_LABELS[b.period ?? 'MONTHLY']} · {b.currency}</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        {#if status.isPending}
          <Skeleton class="h-40 w-full" />
        {:else if status.data}
          <BudgetStatusPanel status={status.data} />
        {/if}

        <div class="space-y-3">
          <h3 class="font-semibold">Expenses</h3>
          {#if expenses.isPending}
            <Skeleton class="h-48 w-full" />
          {:else if expenses.isError}
            <ErrorState error={expenses.error} onRetry={() => expenses.refetch()} />
          {:else if expenses.data}
            {#if expenses.data.items.length === 0}
              <Card class="p-6 text-sm text-muted-foreground">No expenses recorded.</Card>
            {:else}
              <ExpenseTable expenses={expenses.data.items} {currency} budgetId={id} readonly />
              <Pagination
                meta={expenses.data.meta}
                onPage={(p) => goto(`?page=${p}`, { keepFocus: true, noScroll: true })}
              />
            {/if}
          {/if}
        </div>
      </div>

      <div class="space-y-6">
        {#if status.data}
          <PerCategoryBreakdown items={status.data.perCategory} currency={status.data.currency} />
        {/if}
      </div>
    </div>
  {/if}
</div>
