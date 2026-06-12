<script setup lang="ts">
import { MapPin } from "lucide-vue-next";

import { Card } from "@/components/ui";
import type { Location } from "@/lib/api/models";
import { countryFlag, formatCoord } from "@/lib/utils/format";

defineProps<{ location: Location }>();
</script>

<template>
  <RouterLink
    :to="{ name: 'location', params: { id: location.id } }"
    class="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Card
      class="h-full p-5 transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="font-semibold leading-tight">{{ location.name }}</p>
          <p class="text-sm text-muted-foreground">
            {{ countryFlag(location.country) }} {{ location.city }}, {{ location.country }}
          </p>
        </div>
        <MapPin class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <dl class="mt-4 space-y-1 text-xs text-muted-foreground">
        <div class="flex items-center gap-1">
          <dt class="sr-only">Coordinates</dt>
          <dd>{{ formatCoord(location.latitude, location.longitude) }}</dd>
        </div>
        <div class="flex items-center gap-1">
          <dt class="sr-only">Timezone</dt>
          <dd>{{ location.timezone }}</dd>
        </div>
      </dl>
    </Card>
  </RouterLink>
</template>
