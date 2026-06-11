<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { ApiError } from '$lib/api/ApiError';
  import { applyApiError } from '$lib/utils/applyApiError';
  import type { Category } from '$lib/api/models';
  import { categorySchema } from '../schemas';
  import { createCategoryMutation, updateCategoryMutation } from '../mutations';

  interface Props {
    budgetId: string;
    category?: Category;
    onDone?: () => void;
    showLabels?: boolean;
  }

  let { budgetId, category, onDone, showLabels = true }: Props = $props();

  const bId = untrack(() => budgetId);
  const cat0 = untrack(() => category);
  const editing = !!cat0;
  const create = createCategoryMutation(bId);
  const update = updateCategoryMutation(bId);

  const form = superForm(
    defaults(
      {
        name: cat0?.name ?? '',
        allocated_amount: cat0?.allocated_amount ?? '0.00'
      },
      zod(categorySchema)
    ),
    {
      SPA: true,
      validators: zod(categorySchema),
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        try {
          if (editing && cat0) {
            await update.mutateAsync({ id: cat0.id, body: form.data });
          } else {
            await create.mutateAsync(form.data);
            form.data.name = '';
            form.data.allocated_amount = '0.00';
          }
          onDone?.();
        } catch (err) {
          if (err instanceof ApiError && err.code === 'category_name_taken') {
            (form.errors as Record<string, string[]>).name = [err.message];
            form.valid = false;
          } else if (err instanceof ApiError && err.code === 'category_allocation_exceeded') {
            (form.errors as Record<string, string[]>).allocated_amount = [err.message];
            form.valid = false;
          } else {
            applyApiError(err, form);
          }
        }
      }
    }
  );

  const { form: data, errors, enhance, submitting } = form;
  const pending = $derived(editing ? update.isPending : create.isPending);
</script>

<form method="POST" use:enhance class="flex flex-col gap-3 sm:flex-row sm:items-start">
  <div class="flex-1">
    <Field label={showLabels ? 'Name' : undefined} id="cat-name" errors={$errors.name}>
      <Input id="cat-name" placeholder="Category name" bind:value={$data.name} />
    </Field>
  </div>
  <div class="w-full sm:w-40">
    <Field label={showLabels ? 'Allocation' : undefined} id="cat-alloc" errors={$errors.allocated_amount}>
      <Input id="cat-alloc" inputmode="decimal" placeholder="0.00" bind:value={$data.allocated_amount} />
    </Field>
  </div>
  <div class={showLabels ? 'flex gap-2 sm:pt-7' : 'flex gap-2'}>
    <Button type="submit" loading={$submitting || pending}>{editing ? 'Save' : 'Add'}</Button>
    {#if editing}
      <Button type="button" variant="outline" onclick={() => onDone?.()}>Cancel</Button>
    {/if}
  </div>
</form>
