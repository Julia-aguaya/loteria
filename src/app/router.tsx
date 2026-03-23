import type { ReactElement } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { useDemoStore } from '@/app/store/demo-store';
import { AgenciesListPage } from '@/features/agencies/agencies-list-page';
import { LoginPage } from '@/features/auth/login-page';
import { CutDetailPage } from '@/features/cuts/cut-detail-page';
import { CutsPage } from '@/features/cuts/cuts-page';
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
      { index: true, element: <Navigate to="/inicio" replace /> },
      { path: 'inicio', element: <DashboardPage /> },
      { path: 'dashboard', element: <Navigate to="/inicio" replace /> },
      { path: 'agencies', element: <AgenciesListPage /> },
      { path: 'cuts', element: <CutsPage /> },
      { path: 'periodos', element: <Navigate to="/cuts" replace /> },
      { path: 'cuts/:periodEnd', element: <CutDetailPage /> },
      { path: 'periodos/:periodEnd', element: <CutDetailPage /> },
      { path: 'configuration', element: <ConfigurationPage /> },
      { path: 'transfers', element: <TransfersPage /> },
    ],
  },
]);
