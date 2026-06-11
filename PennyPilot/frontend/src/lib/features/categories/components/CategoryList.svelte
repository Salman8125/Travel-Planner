<script lang="ts">
  import { Pencil, Trash2 } from '@lucide/svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import type { Category } from '$lib/api/models';

  interface Props {
    categories: Category[];
    currency: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
  }

  let { categories, currency, onEdit, onDelete }: Props = $props();
</script>

{#if categories.length === 0}
  <p class="py-2 text-sm text-muted-foreground">No categories yet. Add one above.</p>
{:else}
  <ul class="divide-y">
    {#each categories as category (category.id)}
      <li class="flex items-center justify-between gap-2 py-3">
        <span class="font-medium">{category.name}</span>
        <div class="flex items-center gap-2">
          <span class="mr-2 text-sm text-muted-foreground">
            <MoneyAmount value={category.allocated_amount} {currency} />
          </span>
          <Button variant="ghost" size="icon" aria-label="Edit category" onclick={() => onEdit(category)}>
            <Pencil class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete category" onclick={() => onDelete(category)}>
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </li>
    {/each}
  </ul>
{/if}
