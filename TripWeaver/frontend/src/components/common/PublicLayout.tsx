import type { RouteSectionProps } from '@solidjs/router';

export function PublicLayout(props: RouteSectionProps) {
  return (
    <div class="min-h-screen">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-6xl px-4 py-3 font-semibold text-brand-600">TripWeaver</div>
      </header>
      <main class="mx-auto max-w-md px-4 py-10">{props.children}</main>
    </div>
  );
}
