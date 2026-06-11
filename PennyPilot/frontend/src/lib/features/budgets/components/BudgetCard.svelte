<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import ProgressMeter from '$lib/components/common/ProgressMeter.svelte';
  import { PERIOD_LABELS, type Budget } from '$lib/api/models';

  let { budget, hrefBase = '/budgets' }: { budget: Budget; hrefBase?: string } = $props();
</script>

<a
  href={`${hrefBase}/${budget.id}`}
  class="block rounded-lg transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  <Card class="h-full space-y-4 p-5">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="truncate font-semibold">{budget.name}</h3>
        <p class="text-xs text-muted-foreground">
          {PERIOD_LABELS[budget.period ?? 'MONTHLY']} · {budget.currency}
        </p>
      </div>
      <Badge variant={budget.status === 'CLOSED' ? 'secondary' : 'success'}>{budget.status}</Badge>
    </div>
    <ProgressMeter spent={budget.spent_amount} total={budget.total_amount} currency={budget.currency} />
  </Card>
</a>
