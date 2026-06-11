<script lang="ts">
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { applyApiError } from '$lib/utils/applyApiError';
  import { registerSchema } from '../schemas';
  import { registerMutation } from '../mutations';

  const register = registerMutation();

  const form = superForm(defaults(zod(registerSchema)), {
    SPA: true,
    validators: zod(registerSchema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      try {
        await register.mutateAsync(form.data);
        const returnTo = $page.url.searchParams.get('returnTo');
        await goto(returnTo ? decodeURIComponent(returnTo) : '/budgets');
      } catch (err) {
        applyApiError(err, form);
      }
    }
  });

  const { form: formData, errors, enhance, submitting } = form;
</script>

<form method="POST" use:enhance class="space-y-4">
  <Field label="Email" id="reg-email" errors={$errors.email}>
    <Input
      id="reg-email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
      bind:value={$formData.email}
    />
  </Field>
  <Field
    label="Password"
    id="reg-password"
    errors={$errors.password}
    description="At least 8 characters."
  >
    <Input id="reg-password" type="password" autocomplete="new-password" bind:value={$formData.password} />
  </Field>
  <Button type="submit" class="w-full" loading={$submitting || register.isPending}>Create account</Button>
</form>
