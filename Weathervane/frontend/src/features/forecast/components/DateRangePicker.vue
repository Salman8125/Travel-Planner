<script setup lang="ts">
import { computed, watch } from "vue";

import { Input, Label } from "@/components/ui";
import { MAX_FORECAST_SPAN_DAYS } from "@/lib/config/env";
import { isoPlusDays, spanDays } from "@/lib/utils/date";

const start = defineModel<string>("start", { required: true });
const end = defineModel<string>("end", { required: true });

const maxEnd = computed(() => isoPlusDays(start.value, MAX_FORECAST_SPAN_DAYS - 1));

watch(
  [start, end],
  () => {
    if (end.value < start.value) {
      end.value = start.value;
      return;
    }
    if (spanDays(start.value, end.value) > MAX_FORECAST_SPAN_DAYS) {
      end.value = maxEnd.value;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="grid max-w-md gap-3 sm:grid-cols-2">
    <div class="space-y-1.5">
      <Label for="start-date">From</Label>
      <Input id="start-date" v-model="start" type="date" :max="end" />
    </div>
    <div class="space-y-1.5">
      <Label for="end-date">To</Label>
      <Input id="end-date" v-model="end" type="date" :min="start" :max="maxEnd" />
    </div>
    <p class="text-xs text-muted-foreground sm:col-span-2">
      Pick up to {{ MAX_FORECAST_SPAN_DAYS }} days.
    </p>
  </div>
</template>
