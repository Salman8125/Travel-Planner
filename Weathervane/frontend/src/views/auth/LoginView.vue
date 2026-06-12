<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import AuthForm from "@/features/auth/components/AuthForm.vue";
</script>

<template>
  <div class="mx-auto max-w-md py-8">
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to manage locations and forecast data.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <AuthForm mode="login" />
        <p class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <RouterLink :to="{ name: 'register' }" class="font-medium text-primary hover:underline">
            Create one
          </RouterLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
