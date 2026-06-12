<script setup lang="ts">
import { MapPinOff } from "lucide-vue-next";

import { buttonVariants } from "@/components/ui";
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <MapPinOff class="h-12 w-12 text-muted-foreground" aria-hidden="true" />
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">Page not found</h1>
      <p class="text-muted-foreground">
        We couldn't find that location or page. It may have moved or never existed.
      </p>
    </div>
    <RouterLink :to="{ name: 'home' }" :class="buttonVariants()">Back to search</RouterLink>
  </div>
</template>
