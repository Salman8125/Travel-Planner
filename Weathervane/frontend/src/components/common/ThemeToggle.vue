<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { storeToRefs } from "pinia";

import { Button } from "@/components/ui";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const { theme } = storeToRefs(ui);
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="ui.toggleTheme()"
  >
    <Moon v-if="theme === 'light'" class="h-5 w-5" />
    <Sun v-else class="h-5 w-5" />
  </Button>
</template>
