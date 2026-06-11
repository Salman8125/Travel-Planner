<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import LoginForm from '$lib/features/auth/components/LoginForm.svelte';
</script>

<svelte:head><title>Sign in · PennyPilot</title></svelte:head>

<Card class="p-6">
  <div class="mb-5 space-y-1">
    <h2 class="text-xl font-semibold">Welcome back</h2>
    <p class="text-sm text-muted-foreground">Sign in to manage your budgets.</p>
  </div>
  <LoginForm />
  <p class="mt-4 text-center text-sm text-muted-foreground">
    Don't have an account?
    <a href="/register" class="font-medium text-primary hover:underline">Create one</a>
  </p>
</Card>
