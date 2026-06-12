<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import PageHeader from "@/components/common/PageHeader.vue";
import Pagination from "@/components/common/Pagination.vue";
import LocationList from "@/features/locations/components/LocationList.vue";
import LocationSearch from "@/features/locations/components/LocationSearch.vue";
import { useLocationsList } from "@/features/locations/queries";
import type { LocationListParams } from "@/lib/api/query-keys";
import { useDebounce } from "@/lib/composables/useDebounce";

const route = useRoute();
const router = useRouter();
const PAGE_SIZE = 12;

const q = ref<string>(typeof route.query.q === "string" ? route.query.q : "");
const country = ref<string>(typeof route.query.country === "string" ? route.query.country : "");
const debouncedQ = useDebounce(q, 350);
const debouncedCountry = useDebounce(country, 350);

watch([debouncedQ, debouncedCountry], ([qValue, countryValue]) => {
  const next: Record<string, string> = {};
  if (qValue.trim()) next.q = qValue.trim();
  if (countryValue.trim()) next.country = countryValue.trim().toUpperCase();
  void router.replace({ query: next });
});

const params = computed<LocationListParams>(() => ({
  q: typeof route.query.q === "string" ? route.query.q : undefined,
  country: typeof route.query.country === "string" ? route.query.country : undefined,
  page: Number(route.query.page) || 1,
  pageSize: PAGE_SIZE,
}));

const query = useLocationsList(params);
const locations = computed(() => query.data.value?.data ?? []);
const meta = computed(() => query.data.value?.meta);

function goToPage(page: number) {
  void router.replace({ query: { ...route.query, page: String(page) } });
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader
      title="Find the weather anywhere"
      subtitle="Search a location for current conditions and a multi-day forecast — no account needed."
    />

    <LocationSearch v-model:q="q" v-model:country="country" />

    <LocationList
      :locations="locations"
      :is-loading="query.isLoading.value"
      :is-error="query.isError.value"
      :error="query.error.value"
      @retry="query.refetch()"
    />

    <Pagination
      v-if="meta && meta.totalPages > 1"
      :meta="meta"
      @update:page="goToPage"
    />
  </div>
</template>
