import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { SearchBar } from '@/components/common/SearchBar';
import { Select } from '@/components/common/Select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminComplaintDetailsModal } from '@/components/admin/AdminComplaintDetailsModal';
import { AssignmentModal } from '@/components/admin/AssignmentModal';
import { StatusPriorityModal } from '@/components/admin/StatusPriorityModal';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { FileText, Clock, Zap, CheckCircle2, Filter, X, Eye, UserPlus, ArrowUp } from 'lucide-react';

export function AdminComplaintManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Assignment modal state
  const [assignmentComplaint, setAssignmentComplaint] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Status/Priority modal state
  const [statusPriorityComplaint, setStatusPriorityComplaint] = useState(null);
  const [isStatusPriorityModalOpen, setIsStatusPriorityModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, searchQuery, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complaint statistics
      const statsData = await complaintService.getComplaintStats();
      setStats({
        total: statsData.stats.total || 0,
        pending: statsData.stats.pending || 0,
        inProgress: statsData.stats.inProgress || 0,
        resolved: statsData.stats.resolved || 0
      });

      // Fetch all complaints
      const complaintsData = await complaintService.getAllComplaints();
      setComplaints(complaintsData.complaints || []);

    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError(err.message || 'Failed to load complaints');
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.complaintId?.toLowerCase().includes(query) ||
        complaint.title?.toLowerCase().includes(query) ||
        complaint.submittedBy?.name?.toLowerCase().includes(query) ||
        complaint.department?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
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

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter;

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint._id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleAssign = (complaint) => {
    setAssignmentComplaint(complaint);
    setIsAssignmentModalOpen(true);
  };

  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setAssignmentComplaint(null);
  };

  const handleAssignmentSuccess = (updatedComplaint) => {
    // Update the complaint in the list
    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c._id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c
      )
    );
    // Reload data to get updated stats
    loadData();
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
    // Update the complaint in the list
    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c._id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c
      )
    );
    // Reload data to get updated stats
    loadData();
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Complaint Management"
          description="View and manage all civic complaints"
          icon={FileText}
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
          title="Complaint Management"
          description="View and manage all civic complaints"
          icon={FileText}
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
      key: 'department',
      header: 'Department',
      width: 'w-44',
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
          {!row.assignedTo && (
            <button
              onClick={() => handleAssign(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
            >
              <UserPlus size={14} />
              Assign
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Complaint Management"
        description="View and manage all civic complaints across the system"
        icon={FileText}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* Filters Section */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full lg:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by ID, title, citizen name, or department..."
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-civic-text-secondary" />
              <span className="text-sm font-medium text-civic-text-secondary">Filters:</span>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              className="w-40"
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              placeholder="All Priorities"
              className="w-40"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            All Complaints
            {hasActiveFilters && (
              <span className="text-sm font-normal text-civic-text-secondary ml-2">
                ({filteredComplaints.length} of {complaints.length})
              </span>
            )}
          </h3>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No complaints match your filters' : 'No complaints yet'}
            icon={FileText}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredComplaints}
          />
        )}
      </div>

      {/* Complaint Details Modal */}
      <AdminComplaintDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        complaintId={selectedComplaint}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        complaint={assignmentComplaint}
        onAssignSuccess={handleAssignmentSuccess}
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
