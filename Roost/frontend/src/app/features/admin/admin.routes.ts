import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'hotels',
    loadComponent: () =>
      import('./admin-hotels.component').then((m) => m.AdminHotelsComponent),
    title: 'Admin · Hotels · Roost',
  },
  {
    path: 'hotels/:id',
    loadComponent: () => import('./admin-hotel.component').then((m) => m.AdminHotelComponent),
    title: 'Admin · Manage hotel · Roost',
  },
  { path: '', pathMatch: 'full', redirectTo: 'hotels' },
];
