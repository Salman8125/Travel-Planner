<script setup lang="ts">
import { Inbox, type LucideIcon } from "lucide-vue-next";

defineProps<{ title: string; description?: string; icon?: LucideIcon }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center"
  >
    <component :is="icon ?? Inbox" class="h-8 w-8 text-muted-foreground" aria-hidden="true" />
    <div class="space-y-1">
      <p class="font-medium">{{ title }}</p>
      <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <slot />
  </div>
</template>
