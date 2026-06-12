<script setup lang="ts">
import PageHeader from "@/components/common/PageHeader.vue";
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Admin" subtitle="Manage locations and forecast data." />

    <nav class="flex gap-4 border-b text-sm" aria-label="Admin sections">
      <RouterLink
        :to="{ name: 'admin-locations' }"
        class="-mb-px border-b-2 border-transparent px-1 py-2 font-medium text-muted-foreground hover:text-foreground"
        active-class="!border-primary !text-foreground"
      >
        Locations
      </RouterLink>
      <RouterLink
        :to="{ name: 'admin-forecast' }"
        class="-mb-px border-b-2 border-transparent px-1 py-2 font-medium text-muted-foreground hover:text-foreground"
        active-class="!border-primary !text-foreground"
      >
        Forecast data
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
