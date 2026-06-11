<script lang="ts">
  import { Sun, Moon } from '@lucide/svelte';
  import { ui } from '$lib/stores/ui.svelte';
  import Button from '$lib/components/ui/Button.svelte';
</script>

<Button variant="ghost" size="icon" aria-label="Toggle theme" onclick={() => ui.toggleTheme()}>
  {#if ui.theme === 'dark'}
    <Sun class="h-5 w-5" />
  {:else}
    <Moon class="h-5 w-5" />
  {/if}
</Button>
