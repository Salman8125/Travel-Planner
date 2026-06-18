import { Show } from 'solid-js';
import { createForm, zodForm } from '@modular-forms/solid';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { applyApiError } from '@/lib/api/apply-api-error';
import { LoginSchema, RegisterSchema, type LoginForm } from '../schemas';
import { useLogin, useRegister } from '../mutations';

export function AuthForm(props: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, { Form, Field }] = createForm<LoginForm>({
    // eslint-disable-next-line solid/reactivity -- mode is fixed per mounted route
    validate: zodForm(props.mode === 'login' ? LoginSchema : RegisterSchema),
  });
  const login = useLogin();
  const register = useRegister();

  const handleSubmit = async (values: LoginForm) => {
    try {
      if (props.mode === 'login') {
        await login.mutateAsync(values);
      } else {
        await register.mutateAsync(values);
      }
      const returnTo = typeof params.returnTo === 'string' ? params.returnTo : '/itineraries';
      navigate(returnTo, { replace: true });
    } catch (error) {
      applyApiError(form, error);
    }
  };

  return (
    <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
      <Field name="email">
        {(field, fieldProps) => (
          <TextField
            {...fieldProps}
            type="email"
            label="Email"
            placeholder="you@example.com"
            autocomplete="email"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Field name="password">
        {(field, fieldProps) => (
          <TextField
            {...fieldProps}
            type="password"
            label="Password"
            autocomplete={props.mode === 'login' ? 'current-password' : 'new-password'}
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Button type="submit" disabled={form.submitting} class="mt-2">
        <Show when={form.submitting}>
          <Spinner />
        </Show>
        {props.mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </Form>
  );
}
