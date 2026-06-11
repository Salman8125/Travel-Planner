<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils/cn';

  interface Props extends Omit<HTMLInputAttributes, 'class' | 'type'> {
    checked?: boolean;
    class?: string;
  }

  let { checked = $bindable(false), class: className = '', ...rest }: Props = $props();
</script>

<input
  type="checkbox"
  bind:checked
  class={cn(
    'h-4 w-4 rounded border-input text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    className
  )}
  {...rest}
/>
