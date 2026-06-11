<script lang="ts">
  import { Pencil } from '@lucide/svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import MoneyAmount from '$lib/components/common/MoneyAmount.svelte';
  import { formatDate } from '$lib/utils/date';
  import type { Expense } from '$lib/api/models';
  import VoidExpenseButton from './VoidExpenseButton.svelte';

  interface Props {
    expenses: Expense[];
    currency: string;
    budgetId: string;
    onEdit?: (expense: Expense) => void;
    readonly?: boolean;
  }

  let { expenses, currency, budgetId, onEdit, readonly = false }: Props = $props();
</script>

<div class="overflow-x-auto rounded-lg border">
  <table class="w-full text-sm">
    <thead class="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
      <tr>
        <th class="px-4 py-3 font-medium">Date</th>
        <th class="px-4 py-3 font-medium">Description</th>
        <th class="px-4 py-3 font-medium">Category</th>
        <th class="px-4 py-3 text-right font-medium">Amount</th>
        <th class="px-4 py-3 font-medium">Status</th>
        {#if !readonly}<th class="px-4 py-3 text-right font-medium">Actions</th>{/if}
      </tr>
    </thead>
    <tbody class="divide-y">
      {#each expenses as expense (expense.id)}
        <tr class={expense.status === 'VOIDED' ? 'text-muted-foreground' : ''}>
          <td class="whitespace-nowrap px-4 py-3">{formatDate(expense.date)}</td>
          <td class="px-4 py-3">{expense.description || '—'}</td>
          <td class="px-4 py-3">{expense.category_name ?? '—'}</td>
          <td class="px-4 py-3 text-right">
            <span class={expense.status === 'VOIDED' ? 'line-through' : ''}>
              <MoneyAmount value={expense.amount} {currency} />
            </span>
          </td>
          <td class="px-4 py-3">
            <Badge
              variant={expense.status === 'VOIDED'
                ? 'secondary'
                : expense.overspent
                  ? 'warning'
                  : 'success'}
            >
              {expense.status}
            </Badge>
          </td>
          {#if !readonly}
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                {#if expense.status === 'RECORDED'}
                  <Button variant="ghost" size="icon" aria-label="Edit expense" onclick={() => onEdit?.(expense)}>
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <VoidExpenseButton {budgetId} expenseId={expense.id} />
                {/if}
              </div>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
