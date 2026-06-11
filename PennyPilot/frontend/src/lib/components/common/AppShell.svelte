<script lang="ts">
  import type { Snippet } from 'svelte';
  import NavBar from './NavBar.svelte';

  interface Props {
    banner?: Snippet;
    children: Snippet;
  }

  let { banner, children }: Props = $props();
</script>

<div class="flex min-h-screen flex-col">
  <NavBar />
  {#if banner}{@render banner()}{/if}
  <main class="container flex-1 py-8">
    {@render children()}
  </main>
</div>
