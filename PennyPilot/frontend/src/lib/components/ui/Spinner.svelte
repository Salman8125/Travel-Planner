<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let { class: className = '' }: { class?: string } = $props();
</script>

<div
  class={cn(
    'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
    className
  )}
  role="status"
  aria-label="Loading"
></div>
