import { Spinner } from '@/components/ui/Spinner';

export function LoadingFallback(props: { label?: string }) {
  return (
    <div class="flex min-h-[40vh] items-center justify-center gap-3 text-slate-500">
      <Spinner size={22} />
      <span>{props.label ?? 'Loading…'}</span>
    </div>
  );
}
