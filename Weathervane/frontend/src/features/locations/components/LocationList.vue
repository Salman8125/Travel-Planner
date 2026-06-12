<script setup lang="ts">
import { SearchX } from "lucide-vue-next";

import EmptyState from "@/components/common/EmptyState.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import { Skeleton } from "@/components/ui";
import type { Location } from "@/lib/api/models";

import LocationCard from "./LocationCard.vue";

const props = defineProps<{
  locations: Location[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
}>();
const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    v-if="props.isLoading"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    aria-busy="true"
  >
    <Skeleton v-for="n in 6" :key="n" class="h-36 w-full rounded-xl" />
  </div>

  <ErrorState v-else-if="props.isError" :error="props.error" @retry="emit('retry')" />

  <EmptyState
    v-else-if="props.locations.length === 0"
    :icon="SearchX"
    title="No locations match your search"
    description="Try a different city name or clear the country filter."
  />

  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <LocationCard v-for="location in props.locations" :key="location.id" :location="location" />
  </div>
</template>
