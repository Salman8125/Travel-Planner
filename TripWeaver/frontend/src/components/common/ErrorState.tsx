import { Show } from 'solid-js';
import { TriangleAlert } from 'lucide-solid';
import { Button } from '@/components/ui/Button';

export function ErrorState(props: { message?: string; onRetry?: () => void }) {
  return (
    <div class="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-12 text-center">
      <TriangleAlert size={32} class="text-over" aria-hidden="true" />
      <h3 class="text-lg font-semibold text-slate-800">Something went wrong</h3>
      <p class="max-w-sm text-sm text-slate-600">
        {props.message ?? 'We could not load this. Please try again.'}
      </p>
      <Show when={props.onRetry}>
        <Button variant="secondary" size="sm" onClick={() => props.onRetry?.()}>
          Retry
        </Button>
      </Show>
    </div>
  );
}
