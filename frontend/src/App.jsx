import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { TrackComplaintPage } from '@/pages/TrackComplaintPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { SubmitComplaintPage } from '@/pages/citizen/SubmitComplaintPage';
import { MyComplaintsPage } from '@/pages/citizen/MyComplaintsPage';
import { ComplaintDetailsPage } from '@/pages/citizen/ComplaintDetailsPage';
import { NotificationsPage } from '@/pages/citizen/NotificationsPage';
import { ProfilePage } from '@/pages/citizen/ProfilePage';
import { OfficerDashboard } from '@/pages/officer/OfficerDashboard';
import { DepartmentHeadDashboard } from '@/pages/departmentHead/DepartmentHeadDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

function ProtectedDashboard({ role, user }) {
  const { logout } = useAuth();
  return (
    <DashboardLayout role={role} user={user} onLogout={logout} />
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/track" element={<TrackComplaintPage />} />

      {/* Citizen routes */}
      <Route path="/citizen" element={<ProtectedDashboard role="citizen" user={user} />}>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit-complaint" element={<SubmitComplaintPage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
        <Route path="track" element={<TrackComplaintPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Officer routes */}
      <Route path="/officer" element={<ProtectedDashboard role="officer" user={user} />}>
        <Route path="dashboard" element={<OfficerDashboard />} />
      </Route>

      {/* Department Head routes */}
      <Route path="/department-head" element={<ProtectedDashboard role="department_head" user={user} />}>
        <Route path="dashboard" element={<DepartmentHeadDashboard />} />
      </Route>

      {/* Super Admin routes */}
      <Route path="/admin" element={<ProtectedDashboard role="super_admin" user={user} />}>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
