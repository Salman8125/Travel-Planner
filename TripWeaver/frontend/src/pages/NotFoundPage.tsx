import { A } from '@solidjs/router';
import { Compass } from 'lucide-solid';

export default function NotFoundPage() {
  return (
    <div class="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <Compass size={40} class="text-brand-500" aria-hidden="true" />
      <h1 class="text-2xl font-semibold">Page not found</h1>
      <p class="text-slate-500">The page you're looking for doesn't exist.</p>
      <A href="/itineraries" class="font-medium text-brand-600 hover:underline">
        Back to my itineraries
      </A>
    </div>
  );
}
