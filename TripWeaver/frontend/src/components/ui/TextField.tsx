import { createUniqueId, Show, splitProps, type JSX } from 'solid-js';

export type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  value?: string | number;
  hint?: string;
};

export function TextField(props: TextFieldProps) {
  const [local, inputProps] = splitProps(props, ['label', 'error', 'value', 'hint', 'class']);
  const id = createUniqueId();
  const errorId = `${id}-error`;
  return (
    <div class={`flex flex-col gap-1 ${local.class ?? ''}`}>
      <label for={id} class="text-sm font-medium text-slate-700">
        {local.label}
      </label>
      <input
        id={id}
        {...inputProps}
        value={local.value ?? ''}
        aria-invalid={local.error ? 'true' : undefined}
        aria-describedby={local.error ? errorId : undefined}
        class={`h-10 rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500
          ${local.error ? 'border-over' : 'border-slate-300'}`}
      />
      <Show when={local.hint && !local.error}>
        <span class="text-xs text-slate-500">{local.hint}</span>
      </Show>
      <Show when={local.error}>
        <span id={errorId} class="text-sm text-over">
          {local.error}
        </span>
      </Show>
    </div>
  );
}
