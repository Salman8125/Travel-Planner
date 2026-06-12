<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useRoute, useRouter } from "vue-router";

import { Button, Input, Label, Spinner } from "@/components/ui";
import { applyApiError } from "@/lib/utils/applyApiError";

import { useLogin, useRegister } from "../mutations";
import { credentialsSchema } from "../schemas";

const props = defineProps<{ mode: "login" | "register" }>();

const router = useRouter();
const route = useRoute();
const mutation = props.mode === "login" ? useLogin() : useRegister();

const { handleSubmit, errors, setErrors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(credentialsSchema),
});
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const onSubmit = handleSubmit(async (values) => {
  try {
    await mutation.mutateAsync(values);
    const returnTo = typeof route.query.returnTo === "string" ? route.query.returnTo : "/";
    await router.replace(returnTo);
  } catch (error) {
    applyApiError(error, setErrors);
  }
});
</script>

<template>
  <form class="space-y-4" novalidate @submit="onSubmit">
    <div class="space-y-1.5">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        autocomplete="email"
        placeholder="you@example.com"
        :aria-invalid="Boolean(errors.email)"
      />
      <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="password">Password</Label>
      <Input
        id="password"
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
        :autocomplete="props.mode === 'login' ? 'current-password' : 'new-password'"
        placeholder="••••••••"
        :aria-invalid="Boolean(errors.password)"
      />
      <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
    </div>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      <Spinner v-if="isSubmitting" />
      {{ props.mode === "login" ? "Sign in" : "Create account" }}
    </Button>
  </form>
</template>
