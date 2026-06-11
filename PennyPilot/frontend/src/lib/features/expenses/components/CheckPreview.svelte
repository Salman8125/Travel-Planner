<script lang="ts">
  import { CircleCheck, TriangleAlert, Ban } from '@lucide/svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import { toNumber } from '$lib/utils/money';
  import type { CheckResult } from '$lib/api/models';

  interface Props {
    result?: CheckResult;
    currency: string;
    loading?: boolean;
  }

  let { result, currency, loading = false }: Props = $props();

  const reasons: Record<string, string> = {
    budget_closed: 'This budget is closed and cannot accept expenses.',
    currency_mismatch: 'The expense currency does not match this budget.',
    insufficient_funds: 'This would exceed the remaining budget.'
  };

  const overBy = $derived(result ? Math.max(0, -toNumber(result.remaining)) : 0);
</script>

{#if loading && !result}
  <div class="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
    <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    Checking…
  </div>
{:else if result}
  {#if result.approved && !result.wouldOverspend}
    <div class="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm">
      <CircleCheck class="mt-0.5 h-4 w-4 shrink-0 text-success" />
      <span>This leaves <MoneyAmount value={result.remaining} {currency} /> remaining.</span>
    </div>
  {:else if result.approved && result.wouldOverspend}
    <div class="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
      <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <span>Allowed, but this puts you <MoneyAmount value={overBy} {currency} /> over budget.</span>
    </div>
  {:else}
    <div class="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
      <Ban class="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <span>
        {reasons[result.reason ?? ''] ?? 'This expense cannot be recorded.'}
        {#if result.reason === 'insufficient_funds'} Exceeds by <MoneyAmount value={overBy} {currency} />.{/if}
      </span>
    </div>
  {/if}
{/if}
