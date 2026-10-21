import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminComplaintDetailsModal } from '@/components/admin/AdminComplaintDetailsModal';
import { StatusPriorityModal } from '@/components/admin/StatusPriorityModal';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, FileText, Zap, CheckCircle2, Clock, Eye, ArrowUp } from 'lucide-react';

export function OfficerDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  });
  const [complaints, setComplaints] = useState([]);

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusPriorityComplaint, setStatusPriorityComplaint] = useState(null);
  const [isStatusPriorityModalOpen, setIsStatusPriorityModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all complaints and filter for assigned ones
      const complaintsData = await complaintService.getAllComplaints();
      const assignedComplaints = (complaintsData.complaints || []).filter(
        complaint => complaint.assignedTo === user?.id
      );

      setComplaints(assignedComplaints);

      // Calculate stats
      const stats = {
        assigned: assignedComplaints.filter(c => c.status === 'assigned').length,
        inProgress: assignedComplaints.filter(c => c.status === 'in_progress').length,
        resolved: assignedComplaints.filter(c => c.status === 'resolved').length,
        total: assignedComplaints.length
      };
      setStats(stats);

    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError(err.message || 'Failed to load complaints');
      toast.error('Failed to load complaints');
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

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint._id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleStatusPriority = (complaint) => {
    setStatusPriorityComplaint(complaint);
    setIsStatusPriorityModalOpen(true);
  };

  const handleCloseStatusPriorityModal = () => {
    setIsStatusPriorityModalOpen(false);
    setStatusPriorityComplaint(null);
  };

  const handleStatusPrioritySuccess = (updatedComplaint) => {
    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c._id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c
      )
    );
    loadData();
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Officer Dashboard"
          description="Complaints assigned to you and their current status"
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
          title="Officer Dashboard"
          description="Complaints assigned to you and their current status"
          icon={LayoutDashboard}
        />
        <ErrorState
          message={error}
          onRetry={loadData}
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
      key: 'location',
      header: 'Location',
      width: 'w-44',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary truncate block max-w-36">
          {formatLocation(row.location)}
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
      key: 'createdAt',
      header: 'Assigned',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-auto',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleStatusPriority(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-teal hover:text-civic-teal-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <ArrowUp size={14} />
            Update
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Officer Dashboard"
        description="Complaints assigned to you and their current status"
        icon={LayoutDashboard}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Assigned"
          value={stats.assigned}
          icon={Clock}
          color="blue"
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
        <StatCard
          label="Total"
          value={stats.total}
          icon={FileText}
          color="teal"
        />
      </div>

      {/* Complaints Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            My Assigned Complaints
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              ({complaints.length})
            </span>
          </h3>
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            message="No complaints assigned to you yet"
            icon={FileText}
          />
        ) : (
          <Table
            columns={columns}
            data={complaints}
          />
        )}
      </div>

      {/* Complaint Details Modal */}
      <AdminComplaintDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        complaintId={selectedComplaint}
      />

      {/* Status/Priority Modal */}
      <StatusPriorityModal
        isOpen={isStatusPriorityModalOpen}
        onClose={handleCloseStatusPriorityModal}
        complaint={statusPriorityComplaint}
        onUpdateSuccess={handleStatusPrioritySuccess}
      />
    </div>
  );
}
