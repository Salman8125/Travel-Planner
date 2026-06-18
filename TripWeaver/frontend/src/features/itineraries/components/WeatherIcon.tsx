import { Dynamic } from 'solid-js/web';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Sun,
  Wind,
  type LucideProps,
} from 'lucide-solid';
import type { Component } from 'solid-js';

const MAP: Record<string, Component<LucideProps>> = {
  SUNNY: Sun,
  CLEAR: Sun,
  PARTLY_CLOUDY: Cloud,
  CLOUDY: Cloudy,
  RAINY: CloudRain,
  RAIN: CloudRain,
  SNOWY: CloudSnow,
  SNOW: CloudSnow,
  WINDY: Wind,
  FOGGY: CloudFog,
  FOG: CloudFog,
  STORMY: CloudLightning,
};

export function WeatherIcon(props: { condition?: string | null; size?: number }) {
  const icon = () => MAP[(props.condition ?? '').toUpperCase().replace(/\s+/g, '_')] ?? Cloud;
  return <Dynamic component={icon()} size={props.size ?? 20} aria-hidden="true" />;
}
