<script lang="ts">
  import { Wallet } from '@lucide/svelte';
  import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';

  let { children } = $props();
</script>

<div class="relative flex min-h-screen items-center justify-center bg-muted/30 p-4">
  <div class="absolute right-4 top-4">
    <ThemeToggle />
  </div>
  <div class="w-full max-w-md space-y-6">
    <div class="flex flex-col items-center gap-2 text-center">
      <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Wallet class="h-7 w-7" />
      </span>
      <h1 class="text-2xl font-bold">PennyPilot</h1>
      <p class="text-sm text-muted-foreground">Plan budgets. Track every penny.</p>
    </div>
    {@render children()}
  </div>
</div>
