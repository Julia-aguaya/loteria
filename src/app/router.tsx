import type { ReactElement } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { useDemoStore } from '@/app/store/demo-store';
import { AgenciesListPage } from '@/features/agencies/agencies-list-page';
import { LoginPage } from '@/features/auth/login-page';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { ConfigurationPage } from '@/features/configuration/configuration-page';
import { TransfersPage } from '@/features/transfers/transfers-page';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = useDemoStore((state) => state.session.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'agencies', element: <AgenciesListPage /> },
      { path: 'configuration', element: <ConfigurationPage /> },
      { path: 'transfers', element: <TransfersPage /> },
    ],
  },
]);
