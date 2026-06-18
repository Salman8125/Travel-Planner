import { For, Show, type JSX } from 'solid-js';
import { Card } from '@/components/ui/Card';
import { formatDay } from '@/lib/utils/date';
import { formatMoney } from '@/lib/utils/money';
import type { ItineraryDayDto } from '@/lib/api/models';
import { WeatherIcon } from './WeatherIcon';

export function DayCard(props: { day: ItineraryDayDto; currency: string; action?: JSX.Element }) {
  return (
    <Card class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
            Day {props.day.dayNumber}
          </p>
          <h3 class="font-semibold text-slate-900">{formatDay(props.day.date)}</h3>
          <p class="mt-0.5 text-sm text-slate-500">{props.day.summary}</p>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <Show
            when={props.day.condition}
            fallback={<span class="text-xs font-medium text-amber-600">No forecast</span>}
          >
            <span class="flex items-center gap-1 text-sm text-slate-600">
              <WeatherIcon condition={props.day.condition} />
              {Math.round(props.day.highC ?? 0)}° / {Math.round(props.day.lowC ?? 0)}°
            </span>
          </Show>
          {props.action}
        </div>
      </div>

      <Show when={props.day.notes}>
        <p class="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">{props.day.notes}</p>
      </Show>

      <ul class="mt-3 flex flex-col gap-1.5">
        <Show
          when={props.day.activities.length > 0}
          fallback={<li class="text-sm text-slate-400">No activities planned.</li>}
        >
          <For each={props.day.activities}>
            {(activity) => (
              <li class="flex items-center justify-between gap-2 text-sm">
                <span class="text-slate-700">
                  <Show when={activity.time}>
                    <span class="mr-2 font-mono text-xs text-slate-400">
                      {activity.time!.slice(0, 5)}
                    </span>
                  </Show>
                  {activity.title}
                  <Show when={activity.location}>
                    <span class="text-slate-500"> · {activity.location}</span>
                  </Show>
                </span>
                <Show when={activity.estimatedCost != null}>
                  <span class="shrink-0 text-slate-500">
                    {formatMoney(activity.estimatedCost, props.currency)}
                  </span>
                </Show>
              </li>
            )}
          </For>
        </Show>
      </ul>
    </Card>
  );
}
