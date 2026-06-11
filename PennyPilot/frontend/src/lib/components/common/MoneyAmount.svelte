<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { formatMoney } from '$lib/utils/money';
  import type { Money } from '$lib/api/models';

  interface Props {
    value: Money | null | undefined;
    currency?: string;
    class?: string;
  }

  let { value, currency = 'USD', class: className = '' }: Props = $props();
</script>

<span class={cn('tabular-nums', className)}>{formatMoney(value, currency)}</span>
