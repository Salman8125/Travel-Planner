<script setup lang="ts">
import { ShieldX } from "lucide-vue-next";

import { buttonVariants } from "@/components/ui";
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <ShieldX class="h-12 w-12 text-destructive" aria-hidden="true" />
    <div class="space-y-1">
      <h1 class="text-2xl font-bold">Access denied</h1>
      <p class="text-muted-foreground">
        This area is for administrators only. If you think this is a mistake, contact your admin.
      </p>
    </div>
    <RouterLink :to="{ name: 'home' }" :class="buttonVariants({ variant: 'outline' })">
      Back to search
    </RouterLink>
  </div>
</template>
