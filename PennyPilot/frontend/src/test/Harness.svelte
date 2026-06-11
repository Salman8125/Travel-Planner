<script lang="ts">
  import type { Component } from 'svelte';
  import type { QueryClient } from '@tanstack/svelte-query';
  import { QueryClientProvider } from '@tanstack/svelte-query';

  let {
    client,
    component: Inner,
    props = {}
  }: { client: QueryClient; component: Component<any>; props?: Record<string, unknown> } = $props();
</script>

<QueryClientProvider {client}>
  <Inner {...props} />
</QueryClientProvider>
