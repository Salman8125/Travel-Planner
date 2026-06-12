<script setup lang="ts">
import { Droplets, Wind } from "lucide-vue-next";
import { computed } from "vue";

import DateText from "@/components/common/DateText.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import TemperatureText from "@/components/common/TemperatureText.vue";
import WeatherIcon from "@/components/common/WeatherIcon.vue";
import { Card, Skeleton } from "@/components/ui";
import { ApiError } from "@/lib/api/ApiError";
import type { Location } from "@/lib/api/models";
import { formatPercent, formatWind } from "@/lib/utils/format";
import { conditionLabel } from "@/lib/utils/weather-icon";

import { useCurrentWeather } from "../queries";

const props = defineProps<{ location: Location }>();

const params = computed(() => ({ locationId: props.location.id }));
const query = useCurrentWeather(params);
const current = computed(() => query.data.value);

const noData = computed(
  () => query.error.value instanceof ApiError && query.error.value.status === 404,
);
</script>

<template>
  <Card class="p-6">
    <h2 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">
      Current conditions
    </h2>

    <Skeleton v-if="query.isLoading.value" class="mt-4 h-24 w-full" />

    <p v-else-if="noData" class="mt-4 text-sm text-muted-foreground">
      No current conditions reported for this location yet.
    </p>

    <ErrorState
      v-else-if="query.isError.value"
      class="mt-4"
      :error="query.error.value"
      title="Couldn't load current conditions"
      @retry="query.refetch()"
    />

    <div v-else-if="current" class="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
      <div class="flex items-center gap-4">
        <WeatherIcon :condition="current.condition" class="h-12 w-12" />
        <div>
          <p class="text-4xl font-bold tabular-nums">
            <TemperatureText :celsius="current.tempC" />
          </p>
          <p class="text-sm text-muted-foreground">{{ conditionLabel(current.condition) }}</p>
        </div>
      </div>

      <dl class="flex items-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <Droplets class="h-4 w-4 text-blue-500" aria-hidden="true" />
          <dt class="sr-only">Humidity</dt>
          <dd>{{ formatPercent(current.humidity) }}</dd>
        </div>
        <div class="flex items-center gap-2">
          <Wind class="h-4 w-4 text-teal-500" aria-hidden="true" />
          <dt class="sr-only">Wind</dt>
          <dd>{{ formatWind(current.windKph) }}</dd>
        </div>
      </dl>

      <p class="ml-auto text-xs text-muted-foreground">
        Observed
        <DateText :iso="current.observedAt" :timezone="location.timezone" />
        ({{ location.timezone }})
      </p>
    </div>
  </Card>
</template>
