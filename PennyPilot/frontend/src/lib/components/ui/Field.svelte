<script lang="ts">
  import type { Snippet } from 'svelte';
  import Label from './Label.svelte';

  interface Props {
    label?: string;
    id?: string;
    errors?: string[] | undefined;
    description?: string;
    required?: boolean;
    children: Snippet;
  }

  let { label, id, errors, description, required = false, children }: Props = $props();

  const errorList = $derived(errors ?? []);
</script>

<div class="space-y-1.5">
  {#if label}
    <Label for={id}>
      {label}{#if required}<span class="text-destructive"> *</span>{/if}
    </Label>
  {/if}
  {@render children()}
  {#if description && errorList.length === 0}
    <p class="text-xs text-muted-foreground">{description}</p>
  {/if}
  {#each errorList as err}
    <p class="text-xs font-medium text-destructive">{err}</p>
  {/each}
</div>
