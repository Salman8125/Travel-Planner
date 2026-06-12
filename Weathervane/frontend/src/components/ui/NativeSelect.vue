<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils/cn";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: string | null;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function onChange(event: Event) {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="relative">
    <select
      v-bind="$attrs"
      :value="props.modelValue ?? ''"
      :class="
        cn(
          'flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
      @change="onChange"
    >
      <slot />
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
      aria-hidden="true"
    />
  </div>
</template>
