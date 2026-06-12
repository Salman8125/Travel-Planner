import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-vue-next";

import { CONDITION_LABELS, type Condition } from "@/lib/api/models";

const ICONS: Record<Condition, LucideIcon> = {
  SUNNY: Sun,
  PARTLY_CLOUDY: CloudSun,
  CLOUDY: Cloud,
  RAINY: CloudRain,
  SNOWY: Snowflake,
  WINDY: Wind,
  FOGGY: CloudFog,
  STORMY: CloudLightning,
};

const COLORS: Record<Condition, string> = {
  SUNNY: "text-amber-500",
  PARTLY_CLOUDY: "text-sky-500",
  CLOUDY: "text-slate-400",
  RAINY: "text-blue-500",
  SNOWY: "text-cyan-300",
  WINDY: "text-teal-500",
  FOGGY: "text-slate-400",
  STORMY: "text-violet-500",
};

export function conditionIcon(condition: Condition): LucideIcon {
  return ICONS[condition] ?? Cloud;
}

export function conditionColor(condition: Condition): string {
  return COLORS[condition] ?? "text-slate-400";
}

export function conditionLabel(condition: Condition): string {
  return CONDITION_LABELS[condition] ?? condition;
}
