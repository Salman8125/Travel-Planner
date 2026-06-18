import { splitProps, type JSX } from 'solid-js';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-brand-100 text-brand-700',
};

export function Badge(props: JSX.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const [local, rest] = splitProps(props, ['tone', 'class', 'children']);
  return (
    <span
      {...rest}
      class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONES[local.tone ?? 'neutral']} ${local.class ?? ''}`}
    >
      {local.children}
    </span>
  );
}
