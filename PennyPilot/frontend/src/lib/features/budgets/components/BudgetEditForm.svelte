<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import Card from '$lib/components/ui/Card.svelte';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Checkbox from '$lib/components/ui/Checkbox.svelte';
  import { applyApiError } from '$lib/utils/applyApiError';
  import { CURRENCIES, PERIODS, PERIOD_LABELS, type Budget } from '$lib/api/models';
  import { budgetEditSchema } from '../schemas';
  import { updateBudgetMutation } from '../mutations';

  let { budget }: { budget: Budget } = $props();

  const initial = untrack(() => ({
    id: budget.id,
    name: budget.name,
    total_amount: budget.total_amount,
    currency: budget.currency,
    period: budget.period ?? 'MONTHLY',
    start_date: budget.start_date,
    end_date: budget.end_date ?? null,
    allow_overspend: budget.allow_overspend ?? false
  }));

  const update = updateBudgetMutation(initial.id);

  const form = superForm(
    defaults(
      {
        name: initial.name,
        total_amount: initial.total_amount,
        currency: initial.currency,
        period: initial.period,
        start_date: initial.start_date,
        end_date: initial.end_date,
        allow_overspend: initial.allow_overspend
      },
      zod(budgetEditSchema)
    ),
    {
      SPA: true,
      validators: zod(budgetEditSchema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        try {
          await update.mutateAsync({
            name: form.data.name,
            total_amount: form.data.total_amount,
            allow_overspend: form.data.allow_overspend,
            period: form.data.period,
            start_date: form.data.start_date,
            end_date: form.data.end_date || null
          });
          toast.success('Budget updated.');
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
</script>

<form method="POST" use:enhance class="space-y-6">
  <Card class="space-y-4 p-6">
    <Field label="Name" id="name" errors={$errors.name} required>
      <Input id="name" bind:value={$data.name} />
    </Field>

    <div class="grid gap-4 sm:grid-cols-2">
      <Field label="Total amount" id="total" errors={$errors.total_amount} required>
        <Input id="total" inputmode="decimal" bind:value={$data.total_amount} />
      </Field>
      <Field label="Currency" id="currency" description="Currency can't be changed after creation.">
        <Select id="currency" options={currencyOptions} bind:value={$data.currency} disabled />
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

  <div class="flex justify-end gap-2">
    <Button type="button" variant="outline" href={`/budgets/${budget.id}`}>Cancel</Button>
    <Button type="submit" loading={$submitting || update.isPending}>Save changes</Button>
  </div>
</form>
