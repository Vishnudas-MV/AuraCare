import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/feedback/Spinner';

// Route Code-Splitting: Lazy loading route chunks for sub-second initial load
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PatientsPage = lazy(() =>
  import('@/pages/PatientsPage').then((m) => ({ default: m.PatientsPage }))
);
const PatientChartPage = lazy(() =>
  import('@/pages/PatientChartPage').then((m) => ({ default: m.PatientChartPage }))
);
const SchedulerPage = lazy(() =>
  import('@/pages/SchedulerPage').then((m) => ({ default: m.SchedulerPage }))
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div className="flex-1 min-h-[60vh] flex items-center justify-center p-8">
    <Spinner size="lg" label="Loading clinical module..." />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Clinical App Shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientChartPage />} />
          <Route path="/scheduler" element={<SchedulerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
