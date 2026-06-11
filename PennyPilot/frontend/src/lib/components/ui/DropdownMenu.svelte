<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { clickOutside } from '$lib/actions/clickOutside';

  interface Props {
    trigger: Snippet<[{ toggle: () => void; open: boolean }]>;
    children: Snippet<[{ close: () => void }]>;
    align?: 'start' | 'end';
    class?: string;
  }

  let { trigger, children, align = 'end', class: className = '' }: Props = $props();

  let open = $state(false);
  const toggle = () => (open = !open);
  const close = () => (open = false);
</script>

<div class="relative" use:clickOutside={close}>
  {@render trigger({ toggle, open })}
  {#if open}
    <div
      role="menu"
      tabindex="-1"
      class={cn(
        'absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
    >
      {@render children({ close })}
    </div>
  {/if}
</div>
