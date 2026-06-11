<script lang="ts">
  import { Plus, Trash2 } from '@lucide/svelte';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Checkbox from '$lib/components/ui/Checkbox.svelte';
  import Label from '$lib/components/ui/Label.svelte';
  import { applyApiError } from '$lib/utils/applyApiError';
  import { todayISO } from '$lib/utils/date';
  import { CURRENCIES, PERIODS, PERIOD_LABELS } from '$lib/api/models';
  import { budgetCreateSchema } from '../schemas';
  import { createBudgetMutation } from '../mutations';

  const create = createBudgetMutation();

  const form = superForm(
    defaults(
      {
        name: '',
        total_amount: '',
        currency: 'USD',
        period: 'MONTHLY' as const,
        start_date: todayISO(),
        end_date: null,
        allow_overspend: false,
        categories: []
      },
      zod(budgetCreateSchema)
    ),
    {
      SPA: true,
      validators: zod(budgetCreateSchema),
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        try {
          const budget = await create.mutateAsync({
            ...form.data,
            end_date: form.data.end_date || null
          });
          await goto(`/budgets/${budget.id}`);
        } catch (err) {
          applyApiError(err, form);
        }
      }
    }
  );

  const { form: data, errors, enhance, submitting } = form;

  const periodOptions = PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] }));
  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));

  function addCategory() {
    $data.categories = [...$data.categories, { name: '', allocated_amount: '0.00' }];
  }
  function removeCategory(index: number) {
    $data.categories = $data.categories.filter((_, i) => i !== index);
  }

  function rowError(index: number, field: 'name' | 'allocated_amount'): string[] | undefined {
    const arr = $errors.categories as Record<number, Record<string, string[]>> | undefined;
    return arr?.[index]?.[field];
  }

  const categoriesError = $derived(
    ($errors.categories as { _errors?: string[] } | undefined)?._errors
  );
</script>

<form method="POST" use:enhance class="space-y-6">
  <Card class="space-y-4 p-6">
    <Field label="Name" id="name" errors={$errors.name} required>
      <Input id="name" bind:value={$data.name} placeholder="Groceries" />
    </Field>

    <div class="grid gap-4 sm:grid-cols-2">
      <Field label="Total amount" id="total" errors={$errors.total_amount} required>
        <Input id="total" inputmode="decimal" bind:value={$data.total_amount} placeholder="500.00" />
      </Field>
      <Field label="Currency" id="currency" errors={$errors.currency} required>
        <Select id="currency" options={currencyOptions} bind:value={$data.currency} />
      </Field>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <Field label="Period" id="period" errors={$errors.period}>
        <Select id="period" options={periodOptions} bind:value={$data.period} />
      </Field>
      <Field label="Start date" id="start" errors={$errors.start_date} required>
        <Input id="start" type="date" bind:value={$data.start_date} />
      </Field>
      <Field label="End date" id="end" errors={$errors.end_date} description="Optional">
        <Input id="end" type="date" bind:value={$data.end_date} />
      </Field>
    </div>

    <label class="flex items-center gap-2 text-sm">
      <Checkbox bind:checked={$data.allow_overspend} />
      Allow overspending (record expenses beyond the total)
    </label>
  </Card>

  <Card class="space-y-4 p-6">
    <div class="flex items-center justify-between">
      <div>
        <Label>Categories</Label>
        <p class="text-xs text-muted-foreground">Optional. Allocations must not exceed the total.</p>
      </div>
      <Button type="button" variant="outline" size="sm" onclick={addCategory}>
        <Plus class="h-4 w-4" /> Add
      </Button>
    </div>

    {#if categoriesError}
      <p class="text-xs font-medium text-destructive">{categoriesError.join(' ')}</p>
    {/if}

    {#if $data.categories.length === 0}
      <p class="text-sm text-muted-foreground">No categories added.</p>
    {:else}
      <div class="space-y-3">
        {#each $data.categories as _category, i (i)}
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <Input placeholder="Category name" bind:value={$data.categories[i].name} />
              {#each rowError(i, 'name') ?? [] as err}
                <p class="mt-1 text-xs text-destructive">{err}</p>
              {/each}
            </div>
            <div class="w-32">
              <Input
                inputmode="decimal"
                placeholder="0.00"
                bind:value={$data.categories[i].allocated_amount}
              />
              {#each rowError(i, 'allocated_amount') ?? [] as err}
                <p class="mt-1 text-xs text-destructive">{err}</p>
              {/each}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove category"
              onclick={() => removeCategory(i)}
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <div class="flex justify-end gap-2">
    <Button type="button" variant="outline" href="/budgets">Cancel</Button>
    <Button type="submit" loading={$submitting || create.isPending}>Create budget</Button>
  </div>
</form>
