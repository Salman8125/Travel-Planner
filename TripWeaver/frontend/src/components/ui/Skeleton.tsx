export function Skeleton(props: { class?: string }) {
  return <div class={`animate-pulse rounded bg-slate-200 ${props.class ?? ''}`} />;
}
