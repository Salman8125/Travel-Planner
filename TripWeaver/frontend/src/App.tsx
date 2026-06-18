import { ErrorBoundary, lazy, onMount, type ParentProps } from 'solid-js';
import { Navigate, Route, Router, useNavigate } from '@solidjs/router';
import { toast } from 'solid-sonner';
import { Button } from '@/components/ui/Button';
import { setNavigate } from '@/lib/api/nav-bridge';
import { setErrorNotifier, setSuccessNotifier } from '@/lib/notifier';
import { PublicLayout } from '@/components/common/PublicLayout';
import { ProtectedLayout } from '@/components/common/ProtectedLayout';
import { AdminLayout } from '@/components/common/AdminLayout';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ItinerariesPage = lazy(() => import('@/pages/ItinerariesPage'));
const BuilderPage = lazy(() => import('@/pages/BuilderPage'));
const ItineraryDetailPage = lazy(() => import('@/pages/ItineraryDetailPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

function GlobalError(props: { reset: () => void }) {
  return (
    <div class="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <h1 class="text-2xl font-semibold">Something went wrong</h1>
      <p class="text-slate-500">An unexpected error occurred. Try again.</p>
      <Button onClick={props.reset}>Reload view</Button>
    </div>
  );
}

function RootBridge(props: ParentProps) {
  const navigate = useNavigate();
  onMount(() => {
    setNavigate((path) => navigate(path));
    setErrorNotifier((message) => toast.error(message));
    setSuccessNotifier((message) => toast.success(message));
  });
  return <ErrorBoundary fallback={(_err, reset) => <GlobalError reset={reset} />}>{props.children}</ErrorBoundary>;
}

export function App() {
  return (
    <Router root={RootBridge}>
      <Route component={PublicLayout}>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/403" component={ForbiddenPage} />
      </Route>
      <Route component={ProtectedLayout}>
        <Route path="/" component={() => <Navigate href="/itineraries" />} />
        <Route path="/itineraries" component={ItinerariesPage} />
        <Route path="/itineraries/new" component={BuilderPage} />
        <Route path="/itineraries/:reference" component={ItineraryDetailPage} />
      </Route>
      <Route component={AdminLayout}>
        <Route path="/admin" component={AdminPage} />
      </Route>
      <Route path="*" component={NotFoundPage} />
    </Router>
  );
}
