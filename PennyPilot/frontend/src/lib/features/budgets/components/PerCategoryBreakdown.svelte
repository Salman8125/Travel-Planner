<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import ProgressMeter from '$lib/components/common/ProgressMeter.svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import { toNumber } from '$lib/utils/money';
  import type { PerCategoryStatus } from '$lib/api/models';

  let { items, currency }: { items: PerCategoryStatus[]; currency: string } = $props();
</script>

<Card class="p-6">
  <h3 class="mb-4 font-semibold">By category</h3>
  {#if items.length === 0}
    <p class="text-sm text-muted-foreground">No categories yet. Add some to track allocations.</p>
  {:else}
    <div class="space-y-4">
      {#each items as item (item.categoryId)}
        {#if toNumber(item.allocated) > 0}
          <ProgressMeter
            label={item.category}
            spent={item.spent}
            total={item.allocated}
            {currency}
          />
        {:else}
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium">{item.category}</span>
            <span class="text-muted-foreground">
              <MoneyAmount value={item.spent} {currency} /> spent · no allocation
            </span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</Card>
