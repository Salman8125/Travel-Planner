<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';
  import PageHeader from '$lib/components/common/PageHeader.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import BudgetCreateForm from '$lib/features/budgets/components/BudgetCreateForm.svelte';
</script>

<svelte:head><title>New budget · PennyPilot</title></svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
  <Button href="/budgets" variant="ghost" size="sm" class="-ml-2 w-fit">
    <ArrowLeft class="h-4 w-4" /> Back to budgets
  </Button>
  <PageHeader title="New budget" description="Set a total, period, and optional categories." />
  <BudgetCreateForm />
</div>
