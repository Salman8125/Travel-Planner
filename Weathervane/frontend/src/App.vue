<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onErrorCaptured, ref } from "vue";
import { Toaster } from "vue-sonner";

import AppNav from "@/components/common/AppNav.vue";
import ErrorState from "@/components/common/ErrorState.vue";
import { useUiStore } from "@/stores/ui";

const { theme } = storeToRefs(useUiStore());

const boundaryError = ref<unknown>(null);
onErrorCaptured((err) => {
  boundaryError.value = err;
  return false;
});
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppNav />
    <main class="container flex-1 py-8">
      <ErrorState
        v-if="boundaryError"
        :error="boundaryError"
        title="This page hit a snag"
        @retry="boundaryError = null"
      />
      <RouterView v-else v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>
    <Toaster :theme="theme" position="top-right" rich-colors close-button />
  </div>
</template>
