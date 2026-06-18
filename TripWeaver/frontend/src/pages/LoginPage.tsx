import { A } from '@solidjs/router';
import { Card } from '@/components/ui/Card';
import { AuthForm } from '@/features/auth/components/AuthForm';

export default function LoginPage() {
  return (
    <Card class="p-6">
      <h1 class="text-xl font-semibold text-slate-900">Welcome back</h1>
      <p class="mt-1 text-sm text-slate-500">Sign in to plan and view your itineraries.</p>
      <div class="mt-5">
        <AuthForm mode="login" />
      </div>
      <p class="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <A href="/register" class="font-medium text-brand-600 hover:underline">
          Create one
        </A>
      </p>
    </Card>
  );
}
