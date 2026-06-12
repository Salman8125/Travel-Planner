<script setup lang="ts">
import { computed, ref } from "vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  NativeSelect,
} from "@/components/ui";
import CurrentWeatherForm from "@/features/admin/components/CurrentWeatherForm.vue";
import ForecastUpsertForm from "@/features/admin/components/ForecastUpsertForm.vue";
import { useLocationsList } from "@/features/locations/queries";

const params = computed(() => ({ page: 1, pageSize: 100 }));
const query = useLocationsList(params);
const locations = computed(() => query.data.value?.data ?? []);

const selectedId = ref("");
</script>

<template>
  <div class="space-y-6">
    <div class="max-w-sm space-y-1.5">
      <Label for="fc-location">Location</Label>
      <NativeSelect id="fc-location" v-model="selectedId">
        <option value="" disabled>Select a location…</option>
        <option v-for="location in locations" :key="location.id" :value="location.id">
          {{ location.name }} ({{ location.country }})
        </option>
      </NativeSelect>
    </div>

    <div v-if="selectedId" class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upsert a forecast day</CardTitle>
          <CardDescription>Idempotent on location + date — re-saving overwrites.</CardDescription>
        </CardHeader>
        <CardContent>
          <ForecastUpsertForm :location-id="selectedId" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set current weather</CardTitle>
          <CardDescription>Replaces the current conditions for this location.</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentWeatherForm :location-id="selectedId" />
        </CardContent>
      </Card>
    </div>

    <p v-else class="text-sm text-muted-foreground">
      Choose a location to edit its forecast and current conditions.
    </p>
  </div>
</template>
