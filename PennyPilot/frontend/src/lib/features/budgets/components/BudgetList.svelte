<script lang="ts">
  import { Wallet } from '@lucide/svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import BudgetCard from './BudgetCard.svelte';
  import type { Budget } from '$lib/api/models';

  let {
    budgets,
    filtered = false,
    hrefBase = '/budgets',
    showCreate = true
  }: { budgets: Budget[]; filtered?: boolean; hrefBase?: string; showCreate?: boolean } = $props();
</script>

{#if budgets.length === 0}
  <EmptyState
    title={filtered ? 'No budgets match your filters' : 'No budgets yet'}
    description={filtered
      ? 'Try adjusting or clearing the filters above.'
      : 'Create your first budget to start tracking spending.'}
  >
    {#snippet icon()}<Wallet class="h-6 w-6" />{/snippet}
    {#snippet action()}
      {#if !filtered && showCreate}<Button href="/budgets/new">New budget</Button>{/if}
    {/snippet}
  </EmptyState>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each budgets as budget (budget.id)}
      <BudgetCard {budget} {hrefBase} />
    {/each}
  </div>
{/if}
