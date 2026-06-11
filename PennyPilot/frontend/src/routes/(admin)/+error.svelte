<script lang="ts">
  import { page } from '$app/stores';
  import { ShieldX } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import AppShell from '$lib/components/common/AppShell.svelte';
</script>

<AppShell>
  <div class="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
    <div class="rounded-full bg-destructive/10 p-4 text-destructive">
      <ShieldX class="h-8 w-8" />
    </div>
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">{$page.status === 403 ? 'Access denied' : 'Something went wrong'}</h1>
      <p class="text-muted-foreground">{$page.error?.message ?? 'Unable to load this page.'}</p>
    </div>
    <Button href="/budgets" variant="outline">Back to budgets</Button>
  </div>
</AppShell>
