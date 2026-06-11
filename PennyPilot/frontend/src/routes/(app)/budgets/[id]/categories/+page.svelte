<script lang="ts">
  import { page } from '$app/stores';
  import { ArrowLeft } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import ErrorState from '$lib/components/common/ErrorState.svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import { toNumber } from '$lib/utils/money';
  import type { Category } from '$lib/api/models';
  import { budgetQuery } from '$lib/features/budgets/queries';
  import { categoriesQuery } from '$lib/features/categories/queries';
  import CategoryForm from '$lib/features/categories/components/CategoryForm.svelte';
  import CategoryList from '$lib/features/categories/components/CategoryList.svelte';
  import DeleteCategoryDialog from '$lib/features/categories/components/DeleteCategoryDialog.svelte';

  const id = $derived($page.params.id!);
  const budget = budgetQuery(() => id);
  const categories = categoriesQuery(() => id);

  const currency = $derived(budget.data?.currency ?? 'USD');
  const allocated = $derived(
    (categories.data ?? []).reduce((sum, c) => sum + toNumber(c.allocated_amount), 0)
  );

  let editTarget = $state<Category | null>(null);
  let editOpen = $state(false);
  let deleteTarget = $state<Category | null>(null);
  let deleteOpen = $state(false);

  function startEdit(category: Category) {
    editTarget = category;
    editOpen = true;
  }
  function startDelete(category: Category) {
    deleteTarget = category;
    deleteOpen = true;
  }
</script>

<svelte:head><title>Categories · PennyPilot</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <Button href={`/budgets/${id}`} variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to budget
  </Button>

  <PageHeader title="Categories" description={budget.data?.name} />

  <Card class="space-y-4 p-6">
    <h3 class="font-semibold">Add a category</h3>
    <CategoryForm budgetId={id} />
  </Card>

  <Card class="space-y-3 p-6">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">Categories</h3>
      {#if budget.data}
        <span class="text-sm text-muted-foreground">
          Allocated <MoneyAmount value={allocated} {currency} /> of
          <MoneyAmount value={budget.data.total_amount} {currency} />
        </span>
      {/if}
    </div>

    {#if categories.isPending}
      <Skeleton class="h-24 w-full" />
    {:else if categories.isError}
      <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
    {:else if categories.data}
      <CategoryList categories={categories.data} {currency} onEdit={startEdit} onDelete={startDelete} />
    {/if}
  </Card>
</div>

<Modal bind:open={editOpen} title="Edit category">
  {#if editTarget}
    <CategoryForm
      budgetId={id}
      category={editTarget}
      showLabels={false}
      onDone={() => (editOpen = false)}
    />
  {/if}
</Modal>

<DeleteCategoryDialog bind:open={deleteOpen} budgetId={id} category={deleteTarget} />
