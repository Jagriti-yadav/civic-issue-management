import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/context/ToastContext';
import { dashboardService } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, FileText, Clock, Zap, CheckCircle2, Eye, AlertTriangle } from 'lucide-react';

export function DepartmentHeadDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [highPriorityComplaints, setHighPriorityComplaints] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getDepartmentHeadDashboardStats();

      setStats(data.stats || {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0
      });

      setRecentComplaints(data.recentComplaints || []);
      setHighPriorityComplaints(data.highPriorityComplaints || []);

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

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (location.address) return location.address;
    if (location.landmark) return location.landmark;
    return 'N/A';
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Department Head Dashboard"
          description={`Overview of complaints in ${user?.department || 'your department'}`}
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
          title="Department Head Dashboard"
          description={`Overview of complaints in ${user?.department || 'your department'}`}
          icon={LayoutDashboard}
        />
        <ErrorState
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const columns = [
    {
      key: 'complaintId',
      header: 'Complaint ID',
      width: 'w-40',
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
          <p className="text-xs text-civic-text-secondary truncate">
            {row.submittedBy?.name || 'Unknown'}
          </p>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-primary">
          {formatCategory(row.category)}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 'w-32',
      render: (row) => (
        <PriorityBadge priority={formatPriority(row.priority)} size="sm" />
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-36',
      render: (row) => (
        <StatusBadge status={formatStatus(row.status)} size="sm" />
      )
    },
    {
      key: 'assignedTo',
      header: 'Assigned Officer',
      width: 'w-40',
      render: (row) => (
        <span className="text-sm text-civic-text-primary">
          {row.assignedTo?.name || 'Unassigned'}
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

  return (
    <div>
      <PageHeader
        title="Department Head Dashboard"
        description={`Overview of complaints in ${user?.department || 'your department'}`}
        icon={LayoutDashboard}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Complaints"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          color="orange"
        />
        <StatCard
          label="Assigned"
          value={stats.assigned}
          icon={FileText}
          color="slate"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Zap}
          color="purple"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* High Priority Complaints */}
      {highPriorityComplaints.length > 0 && (
        <div className="card-base mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-civic-text-primary">
              High Priority Complaints
              <span className="text-sm font-normal text-civic-text-secondary ml-2">
                ({highPriorityComplaints.length})
              </span>
            </h3>
            <AlertTriangle size={20} className="text-status-rejected" />
          </div>
          <Table
            columns={columns}
            data={highPriorityComplaints}
          />
        </div>
      )}

      {/* Recent Complaints */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            Recent Complaints
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              (Last 5)
            </span>
          </h3>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState
            message="No complaints in your department yet"
            icon={FileText}
          />
        ) : (
          <Table
            columns={columns}
            data={recentComplaints}
          />
        )}
      </div>
    </div>
  );
}
