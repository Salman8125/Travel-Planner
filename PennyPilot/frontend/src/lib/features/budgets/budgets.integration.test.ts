import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { server } from '../../../test/msw/server';
import { testQueryClient } from '../../../test/utils';
import Harness from '../../../test/Harness.svelte';
import Probe from '../../../test/Probe.svelte';

const API = 'http://localhost:4003';

describe('budgets query (svelte-query v6 runtime)', () => {
  it('renders budgets returned by the API envelope', async () => {
    render(Harness, { props: { client: testQueryClient(), component: Probe } });
    await waitFor(() => expect(screen.getByText('Groceries')).toBeInTheDocument());
  });

  it('shows an error state when the request fails', async () => {
    server.use(
      http.get(`${API}/api/budgets`, () =>
        HttpResponse.json({ error: { code: 'internal_error', message: 'boom' } }, { status: 500 })
      )
    );
    render(Harness, { props: { client: testQueryClient(), component: Probe } });
    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument());
  });
});
