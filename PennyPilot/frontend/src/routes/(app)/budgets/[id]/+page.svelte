<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft, Pencil, Lock, Trash2, FolderTree, Plus, ReceiptText } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import { formatDate } from '$lib/utils/date';
  import { PERIOD_LABELS } from '$lib/api/models';
  import { budgetQuery, budgetStatusQuery } from '$lib/features/budgets/queries';
  import BudgetStatusPanel from '$lib/features/budgets/components/BudgetStatusPanel.svelte';
  import PerCategoryBreakdown from '$lib/features/budgets/components/PerCategoryBreakdown.svelte';
  import CloseBudgetDialog from '$lib/features/budgets/components/CloseBudgetDialog.svelte';
  import DeleteBudgetDialog from '$lib/features/budgets/components/DeleteBudgetDialog.svelte';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
  const status = budgetStatusQuery(() => id);

  let closeOpen = $state(false);
  let deleteOpen = $state(false);

  const isClosed = $derived(budget.data?.status === 'CLOSED');
</script>

<svelte:head><title>{budget.data?.name ?? 'Budget'} · PennyPilot</title></svelte:head>

<div class="space-y-6">
  <Button href="/budgets" variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to budgets
  </Button>

  {#if budget.isPending}
    <Skeleton class="h-9 w-64" />
    <Skeleton class="h-40 w-full" />
  {:else if budget.isError}
    <ErrorState error={budget.error} onRetry={() => budget.refetch()} />
  {:else if budget.data}
    {@const b = budget.data}
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight">{b.name}</h1>
          <Badge variant={isClosed ? 'secondary' : 'success'}>{b.status}</Badge>
        </div>
        <p class="text-sm text-muted-foreground">
          {PERIOD_LABELS[b.period ?? 'MONTHLY']} · {b.currency}
          {#if b.allow_overspend}· overspend allowed{/if}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button href={`/budgets/${id}/categories`} variant="outline" size="sm">
          <FolderTree class="h-4 w-4" /> Categories
        </Button>
        <Button href={`/budgets/${id}/expenses`} variant="outline" size="sm">
          <ReceiptText class="h-4 w-4" /> Expenses
        </Button>
        {#if !isClosed}
          <Button href={`/budgets/${id}/edit`} variant="outline" size="sm">
            <Pencil class="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" onclick={() => (closeOpen = true)}>
            <Lock class="h-4 w-4" /> Close
          </Button>
        {/if}
        <Button variant="outline" size="sm" onclick={() => (deleteOpen = true)}>
          <Trash2 class="h-4 w-4" /> Delete
        </Button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        {#if status.isPending}
          <Skeleton class="h-40 w-full" />
        {:else if status.isError}
          <ErrorState error={status.error} onRetry={() => status.refetch()} />
        {:else if status.data}
          <BudgetStatusPanel status={status.data} />
        {/if}

        <Card class="flex flex-col items-start justify-between gap-3 p-6 sm:flex-row sm:items-center">
          <div>
            <h3 class="font-semibold">Expenses</h3>
            <p class="text-sm text-muted-foreground">Record spending and review history.</p>
          </div>
          <div class="flex gap-2">
            <Button href={`/budgets/${id}/expenses`} variant="outline" size="sm">View all</Button>
            <Button href={`/budgets/${id}/expenses/new`} size="sm" disabled={isClosed}>
              <Plus class="h-4 w-4" /> Record expense
            </Button>
          </div>
        </Card>
      </div>

      <div class="space-y-6">
        {#if status.isPending}
          <Skeleton class="h-48 w-full" />
        {:else if status.data}
          <PerCategoryBreakdown items={status.data.perCategory} currency={status.data.currency} />
        {/if}

        <Card class="space-y-2 p-6 text-sm">
          <h3 class="mb-2 font-semibold">Details</h3>
          <div class="flex justify-between"><span class="text-muted-foreground">Period</span><span>{PERIOD_LABELS[b.period ?? 'MONTHLY']}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Start</span><span>{formatDate(b.start_date)}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">End</span><span>{b.end_date ? formatDate(b.end_date) : '—'}</span></div>
          <div class="flex justify-between"><span class="text-muted-foreground">Currency</span><span>{b.currency}</span></div>
        </Card>
      </div>
    </div>

    <CloseBudgetDialog bind:open={closeOpen} budgetId={id} />
    <DeleteBudgetDialog bind:open={deleteOpen} budgetId={id} budgetName={b.name} />
  {/if}
</div>
