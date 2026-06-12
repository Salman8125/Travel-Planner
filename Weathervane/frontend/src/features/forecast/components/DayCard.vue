<script setup lang="ts">
import { Droplets } from "lucide-vue-next";

import TemperatureText from "@/components/common/TemperatureText.vue";
import WeatherIcon from "@/components/common/WeatherIcon.vue";
import { Card } from "@/components/ui";
import type { DailyForecast } from "@/lib/api/models";
import { formatForecastDate } from "@/lib/utils/date";
import { formatPercent } from "@/lib/utils/format";

const props = defineProps<{ forecast: DailyForecast }>();
</script>

<template>
  <Card class="flex flex-col items-center gap-2 p-4 text-center">
    <p class="text-sm font-medium">{{ formatForecastDate(props.forecast.date) }}</p>
    <WeatherIcon :condition="props.forecast.condition" class="h-8 w-8" />
    <p class="text-lg font-semibold tabular-nums">
      <TemperatureText :celsius="props.forecast.high" />
      <span class="text-sm font-normal text-muted-foreground">
        / <TemperatureText :celsius="props.forecast.low" />
      </span>
    </p>
    <p
      v-if="props.forecast.precipitationChance != null"
      class="flex items-center gap-1 text-xs text-muted-foreground"
    >
      <Droplets class="h-3 w-3 text-blue-500" aria-hidden="true" />
      {{ formatPercent(props.forecast.precipitationChance) }}
    </p>
  </Card>
</template>
