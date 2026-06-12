<script setup lang="ts">
import { CalendarOff } from "lucide-vue-next";
import { computed, ref } from "vue";

import EmptyState from "@/components/common/EmptyState.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import { Card, Skeleton } from "@/components/ui";
import type { Location } from "@/lib/api/models";
import { MAX_FORECAST_SPAN_DAYS } from "@/lib/config/env";
import { isoPlusDays, spanDays, todayISO } from "@/lib/utils/date";

import { useForecast } from "../queries";
import DateRangePicker from "./DateRangePicker.vue";
import ForecastGrid from "./ForecastGrid.vue";
import TemperatureChart from "./TemperatureChart.vue";

const props = defineProps<{ location: Location }>();

const start = ref(todayISO());
const end = ref(isoPlusDays(todayISO(), 6));

const params = computed(() => {
  let effectiveEnd = end.value;
  if (spanDays(start.value, effectiveEnd) > MAX_FORECAST_SPAN_DAYS) {
    effectiveEnd = isoPlusDays(start.value, MAX_FORECAST_SPAN_DAYS - 1);
  }
  return { locationId: props.location.id, startDate: start.value, endDate: effectiveEnd };
});

const query = useForecast(params);
const forecasts = computed(() => query.data.value ?? []);
</script>

<template>
  <Card class="space-y-6 p-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h2 class="text-lg font-semibold">Daily forecast</h2>
      <DateRangePicker v-model:start="start" v-model:end="end" />
    </div>

    <div v-if="query.isLoading.value" class="space-y-4">
      <Skeleton class="h-72 w-full" />
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Skeleton v-for="n in 7" :key="n" class="h-32" />
      </div>
    </div>

    <ErrorState
      v-else-if="query.isError.value"
      :error="query.error.value"
      title="Couldn't load the forecast"
      @retry="query.refetch()"
    />

    <EmptyState
      v-else-if="forecasts.length === 0"
      :icon="CalendarOff"
      title="No forecast available"
      description="There's no forecast data for this date range. Try a different range."
    />

    <template v-else>
      <TemperatureChart :forecasts="forecasts" />
      <ForecastGrid :forecasts="forecasts" />
    </template>
  </Card>
</template>
