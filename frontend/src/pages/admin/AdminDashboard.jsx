import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { useToast } from '@/context/ToastContext';
import { dashboardService } from '@/services/dashboardService';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Building2, FileText, BarChart3,
  Clock, CheckCircle2, AlertTriangle, TrendingUp, Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#1D4ED8', '#0F766E', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

export function AdminDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [statsData, trendsData, complaintsData, usersData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getDashboardTrends('7'),
        dashboardService.getRecentComplaints(5),
        dashboardService.getRecentUsers(5)
      ]);

      setStats(statsData.stats);
      setTrends(trendsData);
      setRecentComplaints(complaintsData.complaints || []);
      setRecentUsers(usersData.users || []);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCategory = (category) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getChartData = () => {
    if (!stats) return [];

    const complaintStats = stats.complaints;
    return [
      { name: 'Pending', value: complaintStats.pending || 0, color: '#D97706' },
      { name: 'Assigned', value: complaintStats.assigned || 0, color: '#2563EB' },
      { name: 'In Progress', value: complaintStats.inProgress || 0, color: '#7C3AED' },
      { name: 'Resolved', value: complaintStats.resolved || 0, color: '#16A34A' },
      { name: 'Rejected', value: complaintStats.rejected || 0, color: '#DC2626' }
    ];
  };

  const getDepartmentChartData = () => {
    if (!stats || !stats.complaintsByDepartment) return [];

    return stats.complaintsByDepartment.slice(0, 5).map(item => ({
      name: item._id || 'Unknown',
      value: item.count || 0
    }));
  };

  const getTrendChartData = () => {
    if (!trends || !trends.dailyTotals) return [];

    return trends.dailyTotals.map(item => ({
      date: item.date,
      complaints: item.count
    }));
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Super Admin Dashboard"
          description="System-wide overview and analytics"
          icon={LayoutDashboard}
        />
        <div className="card-base p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Super Admin Dashboard"
          description="System-wide overview and analytics"
          icon={LayoutDashboard}
        />
        <ErrorState
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const statusChartData = getChartData();
  const departmentChartData = getDepartmentChartData();
  const trendChartData = getTrendChartData();

  const complaintColumns = [
    {
      key: 'complaintId',
      header: 'ID',
      width: 'w-32',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-civic-blue">
          {row.complaintId || 'N/A'}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Title',
      width: 'flex-1',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-civic-text-primary truncate">{row.title}</p>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: 'w-32',
      render: (row) => (
        <span className="text-sm text-civic-text-primary">
          {formatCategory(row.category)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-32',
      render: (row) => (
        <Badge variant="outline" size="sm">
          {formatStatus(row.status)}
        </Badge>
      )
    },
    {
      key: 'department',
      header: 'Department',
      width: 'w-40',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary truncate block max-w-36">
          {row.department || 'N/A'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {formatDate(row.createdAt)}
        </span>
      )
    }
  ];

  const userColumns = [
    {
      key: 'name',
      header: 'Name',
      width: 'flex-1',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-civic-text-primary truncate">{row.name}</p>
          <p className="text-xs text-civic-text-secondary truncate">{row.email}</p>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      width: 'w-36',
      render: (row) => (
        <Badge variant="outline" size="sm" className="capitalize">
          {row.role.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'department',
      header: 'Department',
      width: 'w-40',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary truncate block max-w-36">
          {row.department || 'N/A'}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      width: 'w-28',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'error'} size="sm">
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Registered',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {formatDate(row.createdAt)}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Super Admin Dashboard"
        description="System-wide overview and analytics"
        icon={LayoutDashboard}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Citizens"
          value={stats?.users?.citizens || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Total Officers"
          value={stats?.users?.officers || 0}
          icon={Shield}
          color="teal"
        />
        <StatCard
          label="Total Departments"
          value={stats?.departments?.total || 0}
          icon={Building2}
          color="purple"
        />
        <StatCard
          label="Total Complaints"
          value={stats?.complaints?.total || 0}
          icon={FileText}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending"
          value={stats?.complaints?.pending || 0}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="In Progress"
          value={stats?.complaints?.inProgress || 0}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="Resolved"
          value={stats?.complaints?.resolved || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Critical"
          value={stats?.complaints?.critical || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="card-base p-4 mb-6">
        <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/complaints">
            <Button variant="secondary" size="sm" leftIcon={<FileText size={16} />}>
              View All Complaints
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" leftIcon={<Users size={16} />}>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/officers">
            <Button variant="secondary" size="sm" leftIcon={<Shield size={16} />}>
              Manage Officers
            </Button>
          </Link>
          <Link to="/admin/departments">
            <Button variant="secondary" size="sm" leftIcon={<Building2 size={16} />}>
              Manage Departments
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BarChart3 size={16} />}
            >
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complaint Status Distribution */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaint Status Distribution</h3>
          {statusChartData.length === 0 || statusChartData.every(d => d.value === 0) ? (
            <EmptyState message="No complaint data available" icon={FileText} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {statusChartData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaints by Department */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaints by Department</h3>
          {departmentChartData.length === 0 || departmentChartData.every(d => d.value === 0) ? (
            <EmptyState message="No department data available" icon={Building2} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData.filter(d => d.value > 0)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Complaint Trends */}
      <div className="card-base p-6 mb-6">
        <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaint Trends (Last 7 Days)</h3>
        {trendChartData.length === 0 || trendChartData.every(d => d.complaints === 0) ? (
          <EmptyState message="No trend data available" icon={TrendingUp} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="complaints"
                stroke="#1D4ED8"
                strokeWidth={2}
                dot={{ fill: '#1D4ED8', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Complaints */}
      <div className="card-base mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">Recent Complaints</h3>
          <Link to="/admin/complaints">
            <Button variant="ghost" size="sm" rightIcon={<FileText size={14} />}>
              View All
            </Button>
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <EmptyState message="No complaints yet" icon={FileText} />
        ) : (
          <Table
            columns={complaintColumns}
            data={recentComplaints}
          />
        )}
      </div>

      {/* Recent User Registrations */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">Recent User Registrations</h3>
          <Link to="/admin/users">
            <Button variant="ghost" size="sm" rightIcon={<Users size={14} />}>
              View All
            </Button>
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <EmptyState message="No users registered yet" icon={Users} />
        ) : (
          <Table
            columns={userColumns}
            data={recentUsers}
          />
        )}
      </div>
    </div>
  );
}
