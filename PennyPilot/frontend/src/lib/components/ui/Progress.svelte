<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    value?: number;
    class?: string;
    indicatorClass?: string;
  }

  let { value = 0, class: className = '', indicatorClass = '' }: Props = $props();

  const clamped = $derived(Math.min(100, Math.max(0, value)));
</script>

<div
  class={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}
  role="progressbar"
  aria-valuenow={Math.round(clamped)}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    class={cn('h-full rounded-full bg-primary transition-all duration-500', indicatorClass)}
    style="width: {clamped}%"
  ></div>
</div>
