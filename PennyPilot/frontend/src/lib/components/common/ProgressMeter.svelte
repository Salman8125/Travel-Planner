<script lang="ts">
  import Progress from '$lib/components/ui/Progress.svelte';
  import MoneyAmount from './MoneyAmount.svelte';
  import { difference, percentOf, toNumber } from '$lib/utils/money';
  import type { Money } from '$lib/api/models';

  interface Props {
    spent: Money;
    total: Money;
    currency?: string;
    label?: string;
    compact?: boolean;
  }

  let { spent, total, currency = 'USD', label, compact = false }: Props = $props();

  const pct = $derived(percentOf(spent, total));
  const remaining = $derived(difference(total, spent));
  const over = $derived(toNumber(spent) > toNumber(total));
  const indicator = $derived(over ? 'bg-destructive' : pct >= 80 ? 'bg-warning' : 'bg-primary');
</script>

<div class="space-y-1.5">
  {#if label}
    <div class="flex items-center justify-between gap-2 text-sm">
      <span class="font-medium">{label}</span>
      <span class="text-muted-foreground">
        <MoneyAmount value={spent} {currency} /> / <MoneyAmount value={total} {currency} />
      </span>
    </div>
  {/if}
  <Progress value={pct} indicatorClass={indicator} />
  {#if !compact}
    <div class="flex items-center justify-between text-xs">
      <span class={over ? 'font-medium text-destructive' : 'text-muted-foreground'}>
        {#if over}
          Over by <MoneyAmount value={Math.abs(remaining)} {currency} />
        {:else}
          <MoneyAmount value={remaining} {currency} /> remaining
        {/if}
      </span>
      <span class="text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  {/if}
</div>
