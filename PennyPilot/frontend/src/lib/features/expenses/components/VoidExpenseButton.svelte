<script lang="ts">
  import { untrack } from 'svelte';
  import { Ban } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
  import { voidExpenseMutation } from '../mutations';

  let { budgetId, expenseId }: { budgetId: string; expenseId: string } = $props();

  const voidExpense = voidExpenseMutation(untrack(() => budgetId));
  let open = $state(false);

  function confirm() {
    voidExpense.mutate(expenseId);
    open = false;
  }
</script>

<Button variant="ghost" size="icon" aria-label="Void expense" onclick={() => (open = true)}>
  <Ban class="h-4 w-4" />
</Button>

<ConfirmDialog
  bind:open
  title="Void this expense?"
  description="Voiding returns the amount to the budget."
  confirmLabel="Void"
  variant="destructive"
  loading={voidExpense.isPending}
  onConfirm={confirm}
/>
