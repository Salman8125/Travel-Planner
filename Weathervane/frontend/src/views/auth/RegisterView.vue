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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Register to get started. New accounts are standard users.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <AuthForm mode="register" />
        <p class="text-center text-sm text-muted-foreground">
          Already have an account?
          <RouterLink :to="{ name: 'login' }" class="font-medium text-primary hover:underline">
            Sign in
          </RouterLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
