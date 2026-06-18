import { Show, type JSX } from 'solid-js';

export function EmptyState(props: {
  title: string;
  message?: string;
  icon?: JSX.Element;
  action?: JSX.Element;
}) {
  return (
    <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <Show when={props.icon}>{props.icon}</Show>
      <h3 class="text-lg font-semibold text-slate-800">{props.title}</h3>
      <Show when={props.message}>
        <p class="max-w-sm text-sm text-slate-500">{props.message}</p>
      </Show>
      <Show when={props.action}>{props.action}</Show>
    </div>
  );
}
