<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils/cn";

import { buttonVariants, type ButtonVariants } from "./variants";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { type: "button", disabled: false },
);
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled"
    :class="cn(buttonVariants({ variant, size }), $props.class)"
  >
    <slot />
  </button>
</template>
