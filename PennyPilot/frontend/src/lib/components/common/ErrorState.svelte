<script lang="ts">
  import { TriangleAlert } from '@lucide/svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ApiError } from '$lib/api/ApiError';

  interface Props {
    error?: unknown;
    onRetry?: () => void;
    title?: string;
  }

  let { error, onRetry, title = 'Something went wrong' }: Props = $props();

  const message = $derived(
    error instanceof ApiError ? error.message : 'An unexpected error occurred. Please try again.'
  );
  const requestId = $derived(error instanceof ApiError ? error.requestId : undefined);
</script>

<Card class="flex flex-col items-center gap-3 p-12 text-center">
  <div class="rounded-full bg-destructive/10 p-3 text-destructive">
    <TriangleAlert class="h-6 w-6" />
  </div>
  <div class="space-y-1">
    <h3 class="text-base font-semibold">{title}</h3>
    <p class="mx-auto max-w-sm text-sm text-muted-foreground">{message}</p>
    {#if requestId}<p class="text-xs text-muted-foreground/70">Request ID: {requestId}</p>{/if}
  </div>
  {#if onRetry}<Button variant="outline" onclick={onRetry}>Try again</Button>{/if}
</Card>
