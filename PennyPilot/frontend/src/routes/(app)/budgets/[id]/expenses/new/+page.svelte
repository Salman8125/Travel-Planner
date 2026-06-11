<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import CenteredSpinner from '$lib/components/common/CenteredSpinner.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import { budgetQuery } from '$lib/features/budgets/queries';
  import { categoriesQuery } from '$lib/features/categories/queries';
  import ExpenseRecordForm from '$lib/features/expenses/components/ExpenseRecordForm.svelte';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
  const categories = categoriesQuery(() => id);
</script>

<svelte:head><title>Record expense · PennyPilot</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <Button href={`/budgets/${id}/expenses`} variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to expenses
  </Button>
  <PageHeader title="Record expense" description={budget.data?.name} />

  {#if budget.isPending || categories.isPending}
    <CenteredSpinner />
  {:else if budget.isError}
    <ErrorState error={budget.error} onRetry={() => budget.refetch()} />
  {:else if budget.data}
    {#if budget.data.status === 'CLOSED'}
      <Card class="p-6 text-sm text-muted-foreground">
        This budget is closed and can no longer record expenses.
      </Card>
    {:else}
      <ExpenseRecordForm
        budgetId={id}
        currency={budget.data.currency}
        categories={categories.data ?? []}
      />
    {/if}
  {/if}
</div>
