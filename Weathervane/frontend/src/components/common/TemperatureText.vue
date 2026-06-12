<script setup lang="ts">
import { useTemperatureUnit } from "@/lib/composables/useTemperatureUnit";

const props = defineProps<{ celsius?: number | null; digits?: number }>();
const { format } = useTemperatureUnit();
</script>

<template>
  <span>{{ format(props.celsius, props.digits ?? 0) }}</span>
</template>
