import { defineStore } from "pinia";
import { ref } from "vue";

import type { TemperatureUnit } from "@/lib/utils/temperature";

export const usePreferencesStore = defineStore(
  "weathervane.preferences",
  () => {
    const unit = ref<TemperatureUnit>("C");

    function toggleUnit() {
      unit.value = unit.value === "C" ? "F" : "C";
    }
    function setUnit(value: TemperatureUnit) {
      unit.value = value;
    }

    return { unit, toggleUnit, setUnit };
  },
  { persist: { pick: ["unit"] } },
);
