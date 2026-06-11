<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils/cn';

  interface Option {
    value: string;
    label: string;
  }

  interface Props extends Omit<HTMLSelectAttributes, 'class'> {
    value?: string;
    options?: Option[];
    placeholder?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    value = $bindable(''),
    options,
    placeholder,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

<select
  bind:value
  class={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...rest}
>
  {#if placeholder}
    <option value="" disabled>{placeholder}</option>
  {/if}
  {#if options}
    {#each options as opt (opt.value)}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  {/if}
  {@render children?.()}
</select>
