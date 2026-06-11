import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  await auth.bootstrap();
  if (auth.isAuthenticated) {
    const returnTo = url.searchParams.get('returnTo');
    throw redirect(302, returnTo ? decodeURIComponent(returnTo) : '/budgets');
  }
  return {};
};
