<script setup lang="ts">
import type { DailyForecast } from "@/lib/api/models";

import DayCard from "./DayCard.vue";

defineProps<{ forecasts: DailyForecast[] }>();
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
    <DayCard v-for="forecast in forecasts" :key="forecast.date" :forecast="forecast" />
  </div>
</template>
