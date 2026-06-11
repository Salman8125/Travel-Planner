<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ApiError } from '$lib/api/ApiError';
  import { applyApiError } from '$lib/utils/applyApiError';
  import type { Category, Expense } from '$lib/api/models';
  import { expenseEditSchema } from '../schemas';
  import { updateExpenseMutation } from '../mutations';

  interface Props {
    budgetId: string;
    expense: Expense;
    categories: Category[];
    onDone?: () => void;
  }

  let { budgetId, expense, categories, onDone }: Props = $props();

  const exp0 = untrack(() => expense);
  const update = updateExpenseMutation(untrack(() => budgetId));

  let categoryValue = $state(exp0.category ?? '');
  let formError = $state<string | null>(null);

  const categoryOptions = $derived([
    { value: '', label: 'No category' },
    ...categories.map((c) => ({ value: c.id, label: c.name }))
  ]);

  const form = superForm(
    defaults(
      {
        amount: exp0.amount,
        date: exp0.date,
        description: exp0.description ?? '',
        category_id: null
      },
      zod(expenseEditSchema)
    ),
    {
      SPA: true,
      validators: zod(expenseEditSchema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        formError = null;
        try {
          await update.mutateAsync({
            id: exp0.id,
            body: {
              amount: form.data.amount,
              date: form.data.date,
              description: form.data.description,
              category_id: categoryValue || null
            }
          });
          onDone?.();
        } catch (err) {
          if (err instanceof ApiError && err.code === 'validation_error' && err.details) {
            applyApiError(err, form);
          } else if (err instanceof ApiError) {
            formError = err.message;
          } else {
            formError = 'Something went wrong.';
          }
        }
      }
    }
  );

  const { form: data, errors, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
  <div class="grid gap-4 sm:grid-cols-2">
    <Field label="Amount" id="e-amount" errors={$errors.amount} required>
      <Input id="e-amount" inputmode="decimal" bind:value={$data.amount} />
    </Field>
    <Field label="Date" id="e-date" errors={$errors.date} required>
      <Input id="e-date" type="date" bind:value={$data.date} />
    </Field>
  </div>
  <Field label="Category" id="e-category">
    <Select id="e-category" options={categoryOptions} bind:value={categoryValue} />
  </Field>
  <Field label="Description" id="e-desc" errors={$errors.description}>
    <Textarea id="e-desc" bind:value={$data.description} />
  </Field>

  {#if formError}
    <div class="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {formError}
    </div>
  {/if}

  <div class="flex justify-end gap-2">
    <Button type="button" variant="outline" onclick={() => onDone?.()}>Cancel</Button>
    <Button type="submit" loading={$submitting || update.isPending}>Save changes</Button>
  </div>
</form>
