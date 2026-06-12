<script setup lang="ts">
import { Search } from "lucide-vue-next";

import { Input, Label } from "@/components/ui";

const q = defineModel<string>("q", { default: "" });
const country = defineModel<string>("country", { default: "" });
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-[1fr_12rem]">
    <div class="space-y-1.5">
      <Label for="location-search">Search locations</Label>
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="location-search"
          v-model="q"
          type="search"
          class="pl-9"
          placeholder="Try Istanbul, Tokyo, London…"
          autocomplete="off"
        />
      </div>
    </div>
    <div class="space-y-1.5">
      <Label for="country-filter">Country</Label>
      <Input
        id="country-filter"
        v-model="country"
        class="uppercase"
        placeholder="e.g. TR"
        maxlength="2"
        autocomplete="off"
      />
    </div>
  </div>
</template>
