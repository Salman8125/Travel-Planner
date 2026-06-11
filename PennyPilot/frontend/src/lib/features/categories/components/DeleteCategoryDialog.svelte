<script lang="ts">
  import { untrack } from 'svelte';
  import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
  import type { Category } from '$lib/api/models';
  import { deleteCategoryMutation } from '../mutations';

  let {
    open = $bindable(false),
    budgetId,
    category
  }: { open?: boolean; budgetId: string; category?: Category | null } = $props();

  const del = deleteCategoryMutation(untrack(() => budgetId));

  async function confirm() {
    if (!category) return;
    try {
      await del.mutateAsync(category.id);
      open = false;
    } catch {}
  }
</script>

<ConfirmDialog
  bind:open
  title="Remove category?"
  description={`Remove "${category?.name ?? ''}"? Existing expenses keep their amounts but lose this category.`}
  confirmLabel="Remove"
  variant="destructive"
  loading={del.isPending}
  onConfirm={confirm}
/>
