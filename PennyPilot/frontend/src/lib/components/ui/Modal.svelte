<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { focusTrap } from '$lib/actions/focusTrap';

  interface Props {
    open?: boolean;
    title?: string;
    description?: string;
    onClose?: () => void;
    class?: string;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    open = $bindable(false),
    title,
    description,
    onClose,
    class: className = '',
    children,
    footer
  }: Props = $props();

  function close() {
    open = false;
    onClose?.();
  }

  function onKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 cursor-default bg-black/50 animate-in fade-in"
      aria-label="Close dialog"
      onclick={close}
    ></button>
    <div
      use:focusTrap
      role="dialog"
      aria-modal="true"
      aria-label={title}
      class={cn(
        'relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95',
        className
      )}
    >
      {#if title}<h2 class="text-lg font-semibold">{title}</h2>{/if}
      {#if description}<p class="mt-1.5 text-sm text-muted-foreground">{description}</p>{/if}
      {#if children}<div class="mt-4">{@render children()}</div>{/if}
      {#if footer}<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{@render footer()}</div>{/if}
    </div>
  </div>
{/if}
