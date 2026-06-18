import { Show, type JSX } from 'solid-js';

export function PageHeader(props: { title: string; subtitle?: string; actions?: JSX.Element }) {
  return (
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{props.title}</h1>
        <Show when={props.subtitle}>
          <p class="mt-1 text-slate-500">{props.subtitle}</p>
        </Show>
      </div>
      <Show when={props.actions}>{props.actions}</Show>
    </div>
  );
}
