<script setup lang="ts">
import { TriangleAlert } from "lucide-vue-next";
import { computed } from "vue";

import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api/ApiError";

const props = defineProps<{ error?: unknown; title?: string; retryable?: boolean }>();
const emit = defineEmits<{ retry: [] }>();

const message = computed(() => {
  if (props.error instanceof ApiError) return props.error.message;
  if (props.error instanceof Error) return props.error.message;
  return "Something went wrong. Please try again.";
});

const requestId = computed(() =>
  props.error instanceof ApiError ? props.error.requestId : undefined,
);
</script>

<template>
  <div
    role="alert"
    class="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center"
  >
    <TriangleAlert class="h-8 w-8 text-destructive" aria-hidden="true" />
    <div class="space-y-1">
      <p class="font-medium">{{ props.title ?? "Couldn't load this" }}</p>
      <p class="text-sm text-muted-foreground">{{ message }}</p>
      <p v-if="requestId" class="text-xs text-muted-foreground/70">Request {{ requestId }}</p>
    </div>
    <Button v-if="props.retryable !== false" variant="outline" size="sm" @click="emit('retry')">
      Try again
    </Button>
  </div>
</template>
