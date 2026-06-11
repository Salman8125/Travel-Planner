<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Props {
    open?: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    loading?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }

  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    loading = false,
    onConfirm,
    onCancel
  }: Props = $props();

  function cancel() {
    open = false;
    onCancel?.();
  }
</script>

<Modal bind:open {title} {description} onClose={onCancel}>
  {#snippet footer()}
    <Button variant="outline" onclick={cancel} disabled={loading}>{cancelLabel}</Button>
    <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onclick={onConfirm} {loading}>
      {confirmLabel}
    </Button>
  {/snippet}
</Modal>
