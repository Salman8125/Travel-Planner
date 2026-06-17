import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import type { HotelSearchRequest } from '@core/api/models';

import { renderWithProviders } from '../../../testing/test-utils';
import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  it('emits a normalized search request when submitted with a city', async () => {
    const submitted = jest.fn<void, [HotelSearchRequest]>();
    await renderWithProviders(SearchFormComponent, {
      on: { submitted },
    });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/city/i), 'London');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(submitted).toHaveBeenCalledTimes(1);
    const payload = submitted.mock.calls[0][0];
    expect(payload.city).toBe('London');
    expect(payload.guests).toBe(2);
    expect(payload.checkInDate < payload.checkOutDate).toBe(true);
  });

  it('does not emit when the city is blank', async () => {
    const submitted = jest.fn();
    await renderWithProviders(SearchFormComponent, {
      on: { submitted },
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(submitted).not.toHaveBeenCalled();
    expect(await screen.findByText(/city is required/i)).toBeInTheDocument();
  });
});
