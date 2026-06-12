<script setup lang="ts">
import { computed } from "vue";

import { formatInLocation } from "@/lib/utils/date";

const props = defineProps<{
  iso: string;
  timezone: string;
  pattern?: string;
}>();

const text = computed(() => formatInLocation(props.iso, props.timezone, props.pattern));
</script>

<template>
  <time :datetime="props.iso">{{ text }}</time>
</template>
