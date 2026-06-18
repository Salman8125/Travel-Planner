import { createResource, Show, Suspense } from 'solid-js';
import { Navigate, useLocation, type RouteSectionProps } from '@solidjs/router';
import { authStore } from '@/lib/stores/auth.store';
import { AppShell } from './AppShell';
import { LoadingFallback } from './LoadingFallback';

export function ProtectedLayout(props: RouteSectionProps) {
  const location = useLocation();
  const [ready] = createResource(() => authStore.ensureSession().then(() => true));

  return (
    <Suspense fallback={<LoadingFallback label="Loading…" />}>
      <Show when={ready()}>
        <Show
          when={authStore.isAuthenticated()}
          fallback={
            <Navigate
              href={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
            />
          }
        >
          <AppShell>{props.children}</AppShell>
        </Show>
      </Show>
    </Suspense>
  );
}
