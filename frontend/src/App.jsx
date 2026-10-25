import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';

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
import { AssignedComplaintsPage } from '@/pages/officer/AssignedComplaintsPage';
import { NotificationsPage as OfficerNotificationsPage } from '@/pages/officer/NotificationsPage';
import { ProfilePage as OfficerProfilePage } from '@/pages/officer/ProfilePage';
import { DepartmentHeadDashboard } from '@/pages/departmentHead/DepartmentHeadDashboard';
import { NotificationsPage as DepartmentHeadNotificationsPage } from '@/pages/departmentHead/NotificationsPage';
import { ProfilePage as DepartmentHeadProfilePage } from '@/pages/departmentHead/ProfilePage';
import { DepartmentComplaintsPage } from '@/pages/departmentHead/DepartmentComplaintsPage';
import { DepartmentOfficersPage } from '@/pages/departmentHead/DepartmentOfficersPage';
import { FeedbackPage as DepartmentHeadFeedbackPage } from '@/pages/departmentHead/FeedbackPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminComplaintManagement } from '@/pages/admin/AdminComplaintManagement';
import { UserManagement } from '@/pages/admin/UserManagement';
import { OfficerManagement } from '@/pages/admin/OfficerManagement';
import { DepartmentManagement } from '@/pages/admin/DepartmentManagement';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';

function ProtectedDashboard({ role, user }) {
  const { logout } = useAuth();
  return (
    <DashboardLayout role={role} user={user} onLogout={logout} />
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut"
};

function AppRoutes() {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track" element={<TrackComplaintPage />} />

      {/* Citizen routes */}
      <Route path="/citizen" element={
        <ProtectedRoute allowedRoles={['citizen']}>
          <ProtectedDashboard role="citizen" user={user} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CitizenDashboard />} />
        <Route path="submit-complaint" element={<SubmitComplaintPage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
        <Route path="track" element={<TrackComplaintPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Officer routes */}
      <Route path="/officer" element={
        <ProtectedRoute allowedRoles={['officer']}>
          <ProtectedDashboard role="officer" user={user} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="complaints" element={<AssignedComplaintsPage />} />
        <Route path="notifications" element={<OfficerNotificationsPage />} />
        <Route path="profile" element={<OfficerProfilePage />} />
      </Route>

      {/* Department Head routes */}
      <Route path="/department-head" element={
        <ProtectedRoute allowedRoles={['department_head']}>
          <ProtectedDashboard role="department_head" user={user} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DepartmentHeadDashboard />} />
        <Route path="complaints" element={<DepartmentComplaintsPage />} />
        <Route path="officers" element={<DepartmentOfficersPage />} />
        <Route path="notifications" element={<DepartmentHeadNotificationsPage />} />
        <Route path="feedback" element={<DepartmentHeadFeedbackPage />} />
        <Route path="profile" element={<DepartmentHeadProfilePage />} />
      </Route>

      {/* Super Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <ProtectedDashboard role="super_admin" user={user} />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaintManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="officers" element={<OfficerManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
