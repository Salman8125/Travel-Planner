<script lang="ts">
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Field from '$lib/components/ui/Field.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { applyApiError } from '$lib/utils/applyApiError';
  import { loginSchema } from '../schemas';
  import { loginMutation } from '../mutations';

  const login = loginMutation();

  const form = superForm(defaults(zod(loginSchema)), {
    SPA: true,
    validators: zod(loginSchema),
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      try {
        await login.mutateAsync(form.data);
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
  <Field label="Email" id="email" errors={$errors.email}>
    <Input
      id="email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
      bind:value={$formData.email}
    />
  </Field>
  <Field label="Password" id="password" errors={$errors.password}>
    <Input id="password" type="password" autocomplete="current-password" bind:value={$formData.password} />
  </Field>
  <Button type="submit" class="w-full" loading={$submitting || login.isPending}>Sign in</Button>
</form>
