<script setup lang="ts">
import { Label } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils/cn";

const props = defineProps<{ for?: string; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <Label
    :for="props.for"
    :class="
      cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
