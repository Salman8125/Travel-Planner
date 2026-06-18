import { A } from '@solidjs/router';
import { Card } from '@/components/ui/Card';
import { AuthForm } from '@/features/auth/components/AuthForm';

export default function RegisterPage() {
  return (
    <Card class="p-6">
      <h1 class="text-xl font-semibold text-slate-900">Create your account</h1>
      <p class="mt-1 text-sm text-slate-500">Start weaving trips together.</p>
      <div class="mt-5">
        <AuthForm mode="register" />
      </div>
      <p class="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <A href="/login" class="font-medium text-brand-600 hover:underline">
          Sign in
        </A>
      </p>
    </Card>
  );
}
