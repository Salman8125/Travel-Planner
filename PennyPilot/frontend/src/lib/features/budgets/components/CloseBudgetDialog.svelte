<script lang="ts">
  import { untrack } from 'svelte';
  import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
  import { applyApiError } from '$lib/utils/applyApiError';
  import { closeBudgetMutation } from '../mutations';

  let { open = $bindable(false), budgetId }: { open?: boolean; budgetId: string } = $props();

  const close = closeBudgetMutation(untrack(() => budgetId));

  async function confirm() {
    try {
      await close.mutateAsync();
      open = false;
    } catch (err) {
      applyApiError(err);
    }
  }
</script>

<ConfirmDialog
  bind:open
  title="Close this budget?"
  description="Closed budgets can no longer record expenses. You can still view their history."
  confirmLabel="Close budget"
  loading={close.isPending}
  onConfirm={confirm}
/>
