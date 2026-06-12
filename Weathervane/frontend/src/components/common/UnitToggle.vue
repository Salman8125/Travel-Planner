<script setup lang="ts">
import { useTemperatureUnit } from "@/lib/composables/useTemperatureUnit";
import { cn } from "@/lib/utils/cn";

const { unit, setUnit } = useTemperatureUnit();
</script>

<template>
  <div
    class="inline-flex items-center rounded-md border bg-background p-0.5 text-sm"
    role="group"
    aria-label="Temperature unit"
  >
    <button
      type="button"
      :class="
        cn(
          'rounded px-2 py-1 font-medium transition-colors',
          unit === 'C' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
        )
      "
      :aria-pressed="unit === 'C'"
      @click="setUnit('C')"
    >
      °C
    </button>
    <button
      type="button"
      :class="
        cn(
          'rounded px-2 py-1 font-medium transition-colors',
          unit === 'F' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
        )
      "
      :aria-pressed="unit === 'F'"
      @click="setUnit('F')"
    >
      °F
    </button>
  </div>
</template>
