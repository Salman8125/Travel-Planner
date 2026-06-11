<script lang="ts">
  import { goto } from '$app/navigation';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ApiError } from '$lib/api/ApiError';
  import { deleteBudgetMutation } from '../mutations';

  let {
    open = $bindable(false),
    budgetId,
    budgetName
  }: { open?: boolean; budgetId: string; budgetName?: string } = $props();

  const del = deleteBudgetMutation();
  let errorMsg = $state<string | null>(null);

  async function confirm() {
    errorMsg = null;
    try {
      await del.mutateAsync(budgetId);
      open = false;
      await goto('/budgets');
    } catch (err) {
      errorMsg = err instanceof ApiError ? err.message : 'Failed to delete budget.';
    }
  }
</script>

<Modal
  bind:open
  title="Delete budget?"
  description={`This permanently removes ${budgetName ?? 'this budget'}. Budgets that already have recorded expenses can't be deleted.`}
  onClose={() => (errorMsg = null)}
>
  {#if errorMsg}
    <div class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {errorMsg}
    </div>
  {/if}
  {#snippet footer()}
    <Button variant="outline" onclick={() => (open = false)} disabled={del.isPending}>Cancel</Button>
    <Button variant="destructive" onclick={confirm} loading={del.isPending}>Delete</Button>
  {/snippet}
</Modal>
