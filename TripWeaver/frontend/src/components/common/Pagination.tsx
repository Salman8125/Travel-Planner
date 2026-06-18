import { Show } from 'solid-js';
import { ChevronLeft, ChevronRight } from 'lucide-solid';
import { Button } from '@/components/ui/Button';
import type { PageMeta } from '@/lib/api/models';

export function Pagination(props: { meta: PageMeta; onPage: (page: number) => void }) {
  return (
    <Show when={props.meta.totalPages > 1}>
      <div class="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>
          Page {props.meta.page} of {props.meta.totalPages} · {props.meta.total} total
        </span>
        <div class="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={props.meta.page <= 1}
            onClick={() => props.onPage(props.meta.page - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" /> Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={props.meta.page >= props.meta.totalPages}
            onClick={() => props.onPage(props.meta.page + 1)}
          >
            Next <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Show>
  );
}
