import { Routes } from '@angular/router';

import { adminGuard } from '@core/guards/admin.guard';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/hotels/search-page.component').then((m) => m.SearchPageComponent),
    title: 'Search hotels · Roost',
  },
  {
    path: 'hotels/:id',
    loadComponent: () =>
      import('@features/hotels/hotel-detail.component').then((m) => m.HotelDetailComponent),
    title: 'Hotel · Roost',
  },
  {
    path: 'book/:hotelId/:roomTypeId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/bookings/booking-wizard.component').then((m) => m.BookingWizardComponent),
    title: 'Book · Roost',
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/bookings/my-bookings.component').then((m) => m.MyBookingsComponent),
    title: 'My bookings · Roost',
  },
  {
    path: 'bookings/:reference',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/bookings/booking-detail.component').then((m) => m.BookingDetailComponent),
    title: 'Booking · Roost',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/auth-page.component').then((m) => m.AuthPageComponent),
    data: { mode: 'login' },
    title: 'Sign in · Roost',
  },
  {
    path: 'register',
    loadComponent: () => import('@features/auth/auth-page.component').then((m) => m.AuthPageComponent),
    data: { mode: 'register' },
    title: 'Create account · Roost',
  },
  {
    path: '403',
    loadComponent: () => import('@shared/pages/forbidden.component').then((m) => m.ForbiddenComponent),
    title: 'Forbidden · Roost',
  },
  {
    path: '**',
    loadComponent: () => import('@shared/pages/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Not found · Roost',
  },
];
