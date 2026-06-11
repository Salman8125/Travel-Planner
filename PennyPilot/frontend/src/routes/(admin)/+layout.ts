import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  await auth.bootstrap();
  if (!auth.isAuthenticated) {
    throw redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);
  }
  if (!auth.isAdmin) {
    throw error(403, 'You do not have permission to access the admin area.');
  }
  return {};
};
