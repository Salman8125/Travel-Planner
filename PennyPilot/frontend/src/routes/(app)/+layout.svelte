<script lang="ts">
  import AppShell from '$lib/components/common/AppShell.svelte';

  let { children } = $props();
</script>

<AppShell>
  {@render children()}
</AppShell>
