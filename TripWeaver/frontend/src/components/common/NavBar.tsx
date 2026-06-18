import { Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';
import { Plane } from 'lucide-solid';
import { authStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';

const linkClass = 'rounded px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100';
const activeClass = '!font-semibold !text-brand-700';

export function NavBar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    authStore.clearSession();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return (
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <A href="/itineraries" class="flex items-center gap-2 font-semibold text-brand-600">
          <Plane size={20} aria-hidden="true" />
          <span>TripWeaver</span>
        </A>
        <nav class="flex flex-1 items-center gap-1">
          <A href="/itineraries" class={linkClass} activeClass={activeClass} end>
            My itineraries
          </A>
          <A href="/itineraries/new" class={linkClass} activeClass={activeClass}>
            New trip
          </A>
          <Show when={authStore.isAdmin()}>
            <A href="/admin" class={linkClass} activeClass={activeClass}>
              Admin
            </A>
          </Show>
        </nav>
        <Show when={authStore.user}>
          {(user) => <span class="hidden text-sm text-slate-500 sm:inline">{user().email}</span>}
        </Show>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
