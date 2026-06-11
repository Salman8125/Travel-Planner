<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft } from '@lucide/svelte';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CenteredSpinner from '$lib/components/common/CenteredSpinner.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import BudgetEditForm from '$lib/features/budgets/components/BudgetEditForm.svelte';
  import { budgetQuery } from '$lib/features/budgets/queries';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
</script>

<svelte:head><title>Edit budget · PennyPilot</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <Button href={`/budgets/${id}`} variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to budget
  </Button>
  <PageHeader title="Edit budget" />

  {#if budget.isPending}
    <CenteredSpinner />
  {:else if budget.isError}
    <ErrorState error={budget.error} onRetry={() => budget.refetch()} />
  {:else if budget.data}
    {#if budget.data.status === 'CLOSED'}
      <Card class="p-6 text-sm text-muted-foreground">
        This budget is closed and can no longer be edited.
      </Card>
    {:else}
      <BudgetEditForm budget={budget.data} />
    {/if}
  {/if}
</div>
