import { storeToRefs } from "pinia";

import { formatTemp, type TemperatureUnit } from "@/lib/utils/temperature";
import { usePreferencesStore } from "@/stores/preferences";

export function useTemperatureUnit() {
  const store = usePreferencesStore();
  const { unit } = storeToRefs(store);

  function format(celsius: number | null | undefined, digits = 0): string {
    return formatTemp(celsius, unit.value, digits);
  }

  return {
    unit,
    toggle: store.toggleUnit,
    setUnit: (value: TemperatureUnit) => store.setUnit(value),
    format,
  };
}
