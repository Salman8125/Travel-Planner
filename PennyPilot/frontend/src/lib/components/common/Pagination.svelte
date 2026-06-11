<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import type { PaginationMeta } from '$lib/api/models';

  interface Props {
    meta: PaginationMeta;
    onPage: (page: number) => void;
  }

  let { meta, onPage }: Props = $props();
</script>

{#if meta.totalPages > 1}
  <div class="flex items-center justify-between gap-4 text-sm">
    <p class="text-muted-foreground">
      Page {meta.page} of {meta.totalPages} · {meta.total} total
    </p>
    <div class="flex gap-2">
      <Button variant="outline" size="sm" disabled={meta.page <= 1} onclick={() => onPage(meta.page - 1)}>
        <ChevronLeft class="h-4 w-4" /> Prev
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={meta.page >= meta.totalPages}
        onclick={() => onPage(meta.page + 1)}
      >
        Next <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
{/if}
