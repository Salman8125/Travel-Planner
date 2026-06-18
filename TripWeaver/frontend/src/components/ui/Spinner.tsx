import { LoaderCircle } from 'lucide-solid';

export function Spinner(props: { size?: number; class?: string; label?: string }) {
  return (
    <LoaderCircle
      size={props.size ?? 18}
      class={`animate-spin ${props.class ?? ''}`}
      aria-label={props.label ?? 'Loading'}
    />
  );
}
