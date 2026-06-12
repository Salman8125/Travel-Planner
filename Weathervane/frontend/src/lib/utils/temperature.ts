export type TemperatureUnit = "C" | "F";

export function cToF(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  return unit === "F" ? cToF(celsius) : celsius;
}

export function formatTemp(
  celsius: number | null | undefined,
  unit: TemperatureUnit,
  digits = 0,
): string {
  if (celsius == null || Number.isNaN(celsius)) return "—";
  return `${convertTemp(celsius, unit).toFixed(digits)}°${unit}`;
}
