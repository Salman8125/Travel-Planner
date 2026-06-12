<script setup lang="ts">
import { ArrowLeft, MapPinOff } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

import ErrorState from "@/components/common/ErrorState.vue";
import { buttonVariants, Skeleton } from "@/components/ui";
import CurrentWeatherCard from "@/features/forecast/components/CurrentWeatherCard.vue";
import ForecastSection from "@/features/forecast/components/ForecastSection.vue";
import { useLocation } from "@/features/locations/queries";
import { ApiError } from "@/lib/api/ApiError";
import { countryFlag, formatCoord } from "@/lib/utils/format";

const route = useRoute();
const id = computed(() => String(route.params.id));
const query = useLocation(id);

const location = computed(() => query.data.value);
const notFound = computed(
  () => query.error.value instanceof ApiError && query.error.value.status === 404,
);
</script>

<template>
  <div class="space-y-8">
    <RouterLink
      :to="{ name: 'home' }"
      class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to search
    </RouterLink>

    <div v-if="query.isLoading.value" class="space-y-6">
      <Skeleton class="h-10 w-72" />
      <Skeleton class="h-40 w-full rounded-xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </div>

    <div
      v-else-if="notFound"
      class="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <MapPinOff class="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">Location not found</h1>
        <p class="text-muted-foreground">This location doesn't exist or was removed.</p>
      </div>
      <RouterLink :to="{ name: 'home' }" :class="buttonVariants()">Back to search</RouterLink>
    </div>

    <ErrorState
      v-else-if="query.isError.value"
      :error="query.error.value"
      title="Couldn't load this location"
      @retry="query.refetch()"
    />

    <template v-else-if="location">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">{{ location.name }}</h1>
        <p class="text-muted-foreground">
          {{ countryFlag(location.country) }} {{ location.city }}, {{ location.country }}
          <span class="px-1.5 text-muted-foreground/50">·</span>
          {{ formatCoord(location.latitude, location.longitude) }}
          <span class="px-1.5 text-muted-foreground/50">·</span>
          {{ location.timezone }}
        </p>
      </header>

      <CurrentWeatherCard :location="location" />
      <ForecastSection :location="location" />
    </template>
  </div>
</template>
