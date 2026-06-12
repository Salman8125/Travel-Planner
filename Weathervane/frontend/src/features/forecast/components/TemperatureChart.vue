<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { computed } from "vue";
import { Line } from "vue-chartjs";

import type { DailyForecast } from "@/lib/api/models";
import { useTemperatureUnit } from "@/lib/composables/useTemperatureUnit";
import { formatForecastDate } from "@/lib/utils/date";
import { convertTemp } from "@/lib/utils/temperature";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const props = defineProps<{ forecasts: DailyForecast[] }>();
const { unit } = useTemperatureUnit();

const AXIS = "rgb(148, 163, 184)";

const chartData = computed<ChartData<"line">>(() => ({
  labels: props.forecasts.map((f) => formatForecastDate(f.date, "EEE d")),
  datasets: [
    {
      label: `High °${unit.value}`,
      data: props.forecasts.map((f) => Number(convertTemp(f.high, unit.value).toFixed(1))),
      borderColor: "rgb(245, 158, 11)",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: `Low °${unit.value}`,
      data: props.forecasts.map((f) => Number(convertTemp(f.low, unit.value).toFixed(1))),
      borderColor: "rgb(56, 189, 248)",
      backgroundColor: "rgba(56, 189, 248, 0.15)",
      tension: 0.35,
      pointRadius: 3,
    },
  ],
}));

const chartOptions = computed<ChartOptions<"line">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { labels: { color: AXIS } },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}°${unit.value}`,
      },
    },
  },
  scales: {
    x: { ticks: { color: AXIS }, grid: { display: false } },
    y: {
      ticks: { color: AXIS, callback: (value) => `${value}°` },
      grid: { color: "rgba(148, 163, 184, 0.15)" },
    },
  },
}));
</script>

<template>
  <div class="h-72 w-full">
    <Line
      :data="chartData"
      :options="chartOptions"
      role="img"
      aria-label="Temperature trend across the selected days"
    />
  </div>
</template>
