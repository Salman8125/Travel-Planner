<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";

import type { Condition } from "@/lib/api/models";
import { cn } from "@/lib/utils/cn";
import { conditionColor, conditionIcon, conditionLabel } from "@/lib/utils/weather-icon";

const props = defineProps<{
  condition: Condition;
  class?: HTMLAttributes["class"];
  showLabel?: boolean;
}>();

const Icon = computed(() => conditionIcon(props.condition));
const label = computed(() => conditionLabel(props.condition));
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <component
      :is="Icon"
      :class="cn('h-5 w-5', conditionColor(props.condition), props.class)"
      aria-hidden="true"
    />
    <span v-if="props.showLabel" class="text-sm">{{ label }}</span>
    <span v-else class="sr-only">{{ label }}</span>
  </span>
</template>
