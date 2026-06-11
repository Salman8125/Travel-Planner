<script lang="ts">
  import Spinner from '$lib/components/ui/Spinner.svelte';

  let { message = 'Loading…' }: { message?: string } = $props();
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
  <Spinner class="h-6 w-6 text-primary" />
  <p class="text-sm">{message}</p>
</div>
