import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { testQueryClient } from '../../../test/utils';
import Harness from '../../../test/Harness.svelte';
import { categoryFixture } from '../../../test/msw/fixtures';
import ExpenseRecordForm from './components/ExpenseRecordForm.svelte';

describe('ExpenseRecordForm live check preview', () => {
  it('runs a debounced /check and shows the projected remaining', async () => {
    render(Harness, {
      props: {
        client: testQueryClient(),
        component: ExpenseRecordForm,
        props: { budgetId: 'b-1', currency: 'USD', categories: [categoryFixture] }
      }
    });

    const amount = screen.getByLabelText(/amount/i);
    await fireEvent.input(amount, { target: { value: '50' } });

    await waitFor(
      () => expect(screen.getByText(/leaves/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );
    expect(screen.getByText(/330\.00/)).toBeInTheDocument();
  });

  it('warns when the amount exceeds the remaining budget', async () => {
    render(Harness, {
      props: {
        client: testQueryClient(),
        component: ExpenseRecordForm,
        props: { budgetId: 'b-1', currency: 'USD', categories: [categoryFixture] }
      }
    });

    const amount = screen.getByLabelText(/amount/i);
    await fireEvent.input(amount, { target: { value: '900' } });

    await waitFor(
      () => expect(screen.getByText(/exceed/i)).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });
});
