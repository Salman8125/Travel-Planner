<script lang="ts">
  import '../app.css';
  import { QueryClientProvider } from '@tanstack/svelte-query';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
  import { Toaster } from 'svelte-sonner';
  import { dev } from '$app/environment';
  import { createQueryClient } from '$lib/query/client';
  import { auth } from '$lib/stores/auth.svelte';
  import { ui } from '$lib/stores/ui.svelte';
  import CenteredSpinner from '$lib/components/common/CenteredSpinner.svelte';

  let { children } = $props();

  const queryClient = createQueryClient();
  auth.bootstrap();
</script>

<QueryClientProvider client={queryClient}>
  {#if !auth.bootstrapped}
    <CenteredSpinner message="Starting PennyPilot…" />
  {:else}
    {@render children()}
  {/if}
  <Toaster richColors closeButton position="top-right" theme={ui.theme} />
  {#if dev}<SvelteQueryDevtools />{/if}
</QueryClientProvider>
