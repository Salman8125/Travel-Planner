<script lang="ts">
  import { page } from '$app/stores';
  import { TriangleAlert } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
  <div class="rounded-full bg-destructive/10 p-4 text-destructive">
    <TriangleAlert class="h-8 w-8" />
  </div>
  <div class="space-y-1">
    <h1 class="text-3xl font-bold">{$page.status}</h1>
    <p class="text-muted-foreground">{$page.error?.message ?? 'Page not found.'}</p>
  </div>
  <Button href="/budgets" variant="outline">Back to budgets</Button>
</div>
