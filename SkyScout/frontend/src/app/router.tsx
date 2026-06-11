import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminRoute } from "@/components/common/AdminRoute";
import { NotFoundPage } from "@/components/common/NotFoundPage";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

import { RootLayout } from "./RootLayout";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const FlightSearchPage = lazy(() => import("@/features/flights/pages/FlightSearchPage"));
const FlightDetailsPage = lazy(() => import("@/features/flights/pages/FlightDetailsPage"));
const BookingWizardPage = lazy(() => import("@/features/bookings/pages/BookingWizardPage"));
const MyBookingsPage = lazy(() => import("@/features/bookings/pages/MyBookingsPage"));
const BookingDetailPage = lazy(() => import("@/features/bookings/pages/BookingDetailPage"));
const AdminLayout = lazy(() => import("@/features/admin/pages/AdminLayout"));
const AdminFlightsPage = lazy(() => import("@/features/admin/pages/AdminFlightsPage"));
const AdminBookingsPage = lazy(() => import("@/features/admin/pages/AdminBookingsPage"));
const AdminReferencePage = lazy(() => import("@/features/admin/pages/AdminReferencePage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/flights" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "flights", element: <FlightSearchPage /> },
      { path: "flights/:id", element: <FlightDetailsPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "booking/:flightId", element: <BookingWizardPage /> },
          { path: "bookings", element: <MyBookingsPage /> },
          { path: "bookings/:reference", element: <BookingDetailPage /> },
        ],
      },
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/flights" replace /> },
              { path: "flights", element: <AdminFlightsPage /> },
              { path: "bookings", element: <AdminBookingsPage /> },
              { path: "reference", element: <AdminReferencePage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
