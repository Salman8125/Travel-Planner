import { splitProps, type JSX } from 'solid-js';

export function Card(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class', 'children']);
  return (
    <div {...rest} class={`rounded-xl border border-slate-200 bg-white shadow-sm ${local.class ?? ''}`}>
      {local.children}
    </div>
  );
}
