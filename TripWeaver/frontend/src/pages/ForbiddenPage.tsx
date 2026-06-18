import { A } from '@solidjs/router';
import { ShieldX } from 'lucide-solid';

export default function ForbiddenPage() {
  return (
    <div class="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <ShieldX size={40} class="text-over" aria-hidden="true" />
      <h1 class="text-2xl font-semibold">Access denied</h1>
      <p class="text-slate-500">You don't have permission to view this page.</p>
      <A href="/itineraries" class="font-medium text-brand-600 hover:underline">
        Back to my itineraries
      </A>
    </div>
  );
}
