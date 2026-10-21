import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user's role
    const roleRoutes = {
      citizen: '/citizen/dashboard',
      officer: '/officer/dashboard',
      department_head: '/department-head/dashboard',
      super_admin: '/admin/dashboard'
    };
    const targetRoute = roleRoutes[user?.role];
    
    // Only redirect if we're not already on the target route to prevent infinite loops
    if (targetRoute && window.location.hash !== `#${targetRoute}`) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  return children;
};
