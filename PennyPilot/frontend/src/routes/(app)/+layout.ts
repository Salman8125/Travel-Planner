import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  await auth.bootstrap();
  if (!auth.isAuthenticated) {
    throw redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return {};
};
