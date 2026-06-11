<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import RegisterForm from '$lib/features/auth/components/RegisterForm.svelte';
</script>

<svelte:head><title>Create account · PennyPilot</title></svelte:head>

<Card class="p-6">
  <div class="mb-5 space-y-1">
    <h2 class="text-xl font-semibold">Create your account</h2>
    <p class="text-sm text-muted-foreground">Start tracking budgets in seconds.</p>
  </div>
  <RegisterForm />
  <p class="mt-4 text-center text-sm text-muted-foreground">
    Already have an account?
    <a href="/login" class="font-medium text-primary hover:underline">Sign in</a>
  </p>
</Card>
