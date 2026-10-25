import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { Avatar } from '@/components/common/Avatar';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileText, Search, Bell, User, Users,
  Shield, Building2, BarChart3, LogOut, Menu, X, Plus, Star,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard, FileText, Search, Bell, User, Users,
  Shield, Building2, BarChart3, Plus, LogOut, Menu, X, Star,
};

const ROLE_CONFIG = {
  citizen: {
    label: 'Citizen',
    color: 'text-role-citizen',
    bgColor: 'bg-blue-50',
    basePath: '/citizen',
    nav: [
      { to: '/citizen/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/citizen/submit-complaint', label: 'Submit Complaint', icon: 'Plus' },
      { to: '/citizen/complaints', label: 'My Complaints', icon: 'FileText' },
      { to: '/citizen/track', label: 'Track Complaint', icon: 'Search' },
      { to: '/citizen/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/citizen/profile', label: 'Profile', icon: 'User' },
    ],
  },
  officer: {
    label: 'Officer',
    color: 'text-role-officer',
    bgColor: 'bg-teal-50',
    basePath: '/officer',
    nav: [
      { to: '/officer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/officer/complaints', label: 'Assigned Complaints', icon: 'FileText' },
      { to: '/officer/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/officer/profile', label: 'Profile', icon: 'User' },
    ],
  },
  department_head: {
    label: 'Department Head',
    color: 'text-role-dept-head',
    bgColor: 'bg-purple-50',
    basePath: '/department-head',
    nav: [
      { to: '/department-head/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/department-head/complaints', label: 'Complaints', icon: 'FileText' },
      { to: '/department-head/officers', label: 'Officers', icon: 'Users' },
      { to: '/department-head/feedback', label: 'Feedback', icon: 'Star' },
      { to: '/department-head/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/department-head/profile', label: 'Profile', icon: 'User' },
    ],
  },
  super_admin: {
    label: 'Super Admin',
    color: 'text-role-admin',
    bgColor: 'bg-orange-50',
    basePath: '/admin',
    nav: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { to: '/admin/users', label: 'Users', icon: 'Users' },
      { to: '/admin/officers', label: 'Officers', icon: 'Shield' },
      { to: '/admin/departments', label: 'Departments', icon: 'Building2' },
      { to: '/admin/complaints', label: 'All Complaints', icon: 'FileText' },
      { to: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
      { to: '/admin/profile', label: 'Profile', icon: 'User' },
    ],
  },
};

export function DashboardLayout({ role, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.citizen;

  // Load unread notification count
  useEffect(() => {
    if (authUser?.id && (role === 'citizen' || role === 'officer' || role === 'department_head')) {
      notificationService.getUnreadCount(authUser.id)
        .then(data => setUnreadCount(data.count || 0))
        .catch(err => console.error('Failed to load unread count:', err));
    }
  }, [authUser?.id, role]);

  // Listen for notification count refresh events
  useEffect(() => {
    const handleNotificationRefresh = () => {
      if (authUser?.id && (role === 'citizen' || role === 'officer' || role === 'department_head')) {
        notificationService.getUnreadCount(authUser.id)
          .then(data => setUnreadCount(data.count || 0))
          .catch(err => console.error('Failed to refresh unread count:', err));
      }
    };

    window.addEventListener('notification-refresh', handleNotificationRefresh);

    return () => {
      window.removeEventListener('notification-refresh', handleNotificationRefresh);
    };
  }, [authUser?.id, role]);

  const handleLogout = useCallback(() => {
    onLogout?.();
    navigate('/login');
  }, [onLogout, navigate]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-civic-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-civic-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-civic-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-civic-text-secondary hover:bg-civic-hover"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-4 flex-shrink-0">
          <div className={`px-3 py-2.5 rounded-lg ${config.bgColor} flex items-center gap-2.5`}>
            <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          <ul className="space-y-1">
            {config.nav.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const active = location.pathname === item.to ||
                (item.to !== config.basePath && location.pathname.startsWith(item.to));
              const showBadge = item.label === 'Notifications' && unreadCount > 0;
              
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-civic-selected text-civic-blue'
                        : 'text-civic-text-secondary hover:bg-civic-hover hover:text-civic-text-primary'
                    }`}
                  >
                    {Icon && <Icon size={18} className={active ? 'text-civic-blue' : ''} />}
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-civic-border p-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-civic-text-secondary hover:bg-red-50 hover:text-status-rejected transition-all duration-200"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-civic-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-civic-text-secondary hover:bg-civic-hover"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-civic-text-primary hidden sm:block">
              {config.label} Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link
                to={`${config.basePath}/profile`}
                className="flex items-center gap-2.5 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-civic-text-primary group-hover:text-civic-blue transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-civic-text-secondary">
                    {user.department?.name || config.label}
                  </p>
                </div>
                <Avatar name={user.name} role={role} size="sm" />
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
