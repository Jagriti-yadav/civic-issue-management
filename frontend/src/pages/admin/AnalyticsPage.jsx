import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { useToast } from '@/context/ToastContext';
import analyticsService from '@/services/analyticsService';
import {
  BarChart3, FileText, CheckCircle2, Clock, TrendingUp,
  AlertTriangle, Building2, Users, Calendar, Download
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
  Line,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#1D4ED8', '#0F766E', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

const STATUS_COLORS = {
  pending: '#D97706',
  assigned: '#2563EB',
  in_progress: '#7C3AED',
  resolved: '#16A34A',
  rejected: '#DC2626'
};

export function AnalyticsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Date filter state
  const [dateRange, setDateRange] = useState('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      let params = { range: dateRange };
      if (isCustomRange && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const data = await analyticsService.getAllAnalytics(
        isCustomRange ? null : dateRange,
        isCustomRange ? customStartDate : null,
        isCustomRange ? customEndDate : null
      );

      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, isCustomRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (value) => {
    if (value === 'custom') {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      setDateRange(value);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const formatHours = (hours) => {
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    const days = (hours / 24).toFixed(1);
    return `${days} days`;
  };

  const getStatusChartData = () => {
    if (!analytics?.byStatus) return [];

    return analytics.byStatus.map(item => ({
      name: formatStatus(item.status),
      value: item.count,
      color: STATUS_COLORS[item.status] || '#6B7280'
    }));
  };

  const getCategoryChartData = () => {
    if (!analytics?.byCategory) return [];

    return analytics.byCategory.map(item => ({
      name: formatCategory(item.category),
      total: item.total,
      resolved: item.resolved
    }));
  };

  const getDepartmentChartData = () => {
    if (!analytics?.byDepartment) return [];

    return analytics.byDepartment.slice(0, 10).map(item => ({
      name: item.department,
      total: item.total,
      resolved: item.resolved
    }));
  };

  const getTrendChartData = () => {
    if (!analytics?.trends) return [];

    return analytics.trends.map(item => ({
      date: item.date,
      complaints: item.count
    }));
  };

  const getOfficerColumns = () => [
    {
      key: 'officerName',
      header: 'Officer',
      width: 'flex-1',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-civic-text-primary truncate">{row.officerName}</p>
          <p className="text-xs text-civic-text-secondary truncate">{row.officerEmail}</p>
        </div>
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
      key: 'totalAssigned',
      header: 'Assigned',
      width: 'w-24',
      render: (row) => (
        <span className="text-sm font-medium text-civic-text-primary">
          {row.totalAssigned}
        </span>
      )
    },
    {
      key: 'resolved',
      header: 'Resolved',
      width: 'w-24',
      render: (row) => (
        <span className="text-sm font-medium text-green-600">
          {row.resolved}
        </span>
      )
    },
    {
      key: 'resolutionRate',
      header: 'Resolution Rate',
      width: 'w-32',
      render: (row) => (
        <Badge variant={row.resolutionRate >= 70 ? 'success' : row.resolutionRate >= 50 ? 'warning' : 'error'} size="sm">
          {row.resolutionRate.toFixed(1)}%
        </Badge>
      )
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Analytics Dashboard"
          description="Comprehensive complaint analytics and insights"
          icon={BarChart3}
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
          title="Analytics Dashboard"
          description="Comprehensive complaint analytics and insights"
          icon={BarChart3}
        />
        <ErrorState
          message={error}
          onRetry={loadAnalytics}
        />
      </div>
    );
  }

  const statusChartData = getStatusChartData();
  const categoryChartData = getCategoryChartData();
  const departmentChartData = getDepartmentChartData();
  const trendChartData = getTrendChartData();

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive complaint analytics and insights"
        icon={BarChart3}
      />

      {/* Date Filter */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-civic-text-secondary" />
            <span className="text-sm font-medium text-civic-text-primary">Date Range:</span>
          </div>
          <Select
            value={isCustomRange ? 'custom' : dateRange}
            onChange={handleDateRangeChange}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: 'custom', label: 'Custom range' }
            ]}
            className="w-48"
          />
          {isCustomRange && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue"
              />
              <span className="text-civic-text-secondary">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue"
              />
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        {analytics?.dateRange && (
          <p className="text-xs text-civic-text-secondary mt-2">
            Showing data from {formatDate(analytics.dateRange.start)} to {formatDate(analytics.dateRange.end)}
          </p>
        )}
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Complaints"
          value={analytics?.overview?.totalComplaints || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Resolved"
          value={analytics?.overview?.resolvedComplaints || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Pending"
          value={analytics?.overview?.pendingComplaints || 0}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="In Progress"
          value={analytics?.overview?.inProgressComplaints || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Rejected"
          value={analytics?.overview?.rejectedComplaints || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Resolution Rate"
          value={`${analytics?.overview?.resolutionRate || 0}%`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Avg Resolution Time"
          value={formatHours(analytics?.overview?.avgResolutionTime || 0)}
          icon={Clock}
          color="teal"
        />
        <StatCard
          label="Departments"
          value={analytics?.byDepartment?.length || 0}
          icon={Building2}
          color="purple"
        />
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaints by Category */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaints by Category</h3>
          {categoryChartData.length === 0 || categoryChartData.every(d => d.total === 0) ? (
            <EmptyState message="No category data available" icon={FileText} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData.filter(d => d.total > 0)}>
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
                <Legend />
                <Bar dataKey="total" name="Total" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Complaints by Department */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaints by Department (Top 10)</h3>
          {departmentChartData.length === 0 || departmentChartData.every(d => d.total === 0) ? (
            <EmptyState message="No department data available" icon={Building2} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData.filter(d => d.total > 0)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#1D4ED8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#16A34A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaint Trends */}
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Complaint Submission Trends</h3>
          {trendChartData.length === 0 || trendChartData.every(d => d.complaints === 0) ? (
            <EmptyState message="No trend data available" icon={TrendingUp} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendChartData}>
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
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#1D4ED8"
                  fill="#1D4ED8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Officer Performance */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">Officer Performance</h3>
          <Users size={20} className="text-civic-text-secondary" />
        </div>
        {analytics?.officerPerformance?.length === 0 ? (
          <EmptyState message="No officer performance data available" icon={Users} />
        ) : (
          <Table
            columns={getOfficerColumns()}
            data={analytics?.officerPerformance || []}
          />
        )}
      </div>
    </div>
  );
}
