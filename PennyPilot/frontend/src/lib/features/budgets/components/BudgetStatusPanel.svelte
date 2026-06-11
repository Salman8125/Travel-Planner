<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import ProgressMeter from '$lib/components/common/ProgressMeter.svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import type { BudgetStatus } from '$lib/api/models';

  let { status }: { status: BudgetStatus } = $props();
</script>

<Card class="space-y-5 p-6">
  <div class="grid grid-cols-3 gap-4 text-center">
    <div>
      <p class="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
      <p class="mt-1 text-xl font-bold sm:text-2xl">
        <MoneyAmount value={status.totalBudget} currency={status.currency} />
      </p>
    </div>
    <div>
      <p class="text-xs uppercase tracking-wide text-muted-foreground">Spent</p>
      <p class="mt-1 text-xl font-bold sm:text-2xl">
        <MoneyAmount value={status.spent} currency={status.currency} />
      </p>
    </div>
    <div>
      <p class="text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
      <p class="mt-1 text-xl font-bold sm:text-2xl">
        <MoneyAmount value={status.remaining} currency={status.currency} />
      </p>
    </div>
  </div>
  <ProgressMeter spent={status.spent} total={status.totalBudget} currency={status.currency} compact />
</Card>
