<script lang="ts">
  import type { Snippet } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';

  interface Props {
    title: string;
    description?: string;
    icon?: Snippet;
    action?: Snippet;
  }

  let { title, description, icon, action }: Props = $props();
</script>

<Card class="flex flex-col items-center justify-center gap-3 p-12 text-center">
  {#if icon}
    <div class="rounded-full bg-muted p-3 text-muted-foreground">{@render icon()}</div>
  {/if}
  <div class="space-y-1">
    <h3 class="text-base font-semibold">{title}</h3>
    {#if description}<p class="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>{/if}
  </div>
  {#if action}{@render action()}{/if}
</Card>
