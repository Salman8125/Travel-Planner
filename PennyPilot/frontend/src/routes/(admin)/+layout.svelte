<script lang="ts">
  import { Info } from '@lucide/svelte';
  import AppShell from '$lib/components/common/AppShell.svelte';

  let { children } = $props();
</script>

<AppShell>
  {#snippet banner()}
    <div class="border-b bg-warning/10">
      <div class="container flex items-center gap-2 py-2 text-sm">
        <Info class="h-4 w-4 shrink-0 text-warning" />
        <span class="text-foreground">
          System-wide oversight — this API does not attribute budgets to individual users.
        </span>
      </div>
    </div>
  {/snippet}
  {@render children()}
</AppShell>
