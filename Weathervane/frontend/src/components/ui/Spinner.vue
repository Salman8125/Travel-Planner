<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils/cn";

const props = defineProps<{ class?: HTMLAttributes["class"]; label?: string }>();
</script>

<template>
  <span role="status" :aria-label="props.label ?? 'Loading'" class="inline-flex">
    <Loader2 :class="cn('h-4 w-4 animate-spin', props.class)" aria-hidden="true" />
  </span>
</template>
