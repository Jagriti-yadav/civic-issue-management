import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Table } from '@/components/common/Table';
import { SearchBar } from '@/components/common/SearchBar';
import { Select } from '@/components/common/Select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminComplaintDetailsModal } from '@/components/admin/AdminComplaintDetailsModal';
import { StatusPriorityModal } from '@/components/admin/StatusPriorityModal';
import { DepartmentHeadAssignmentModal } from '@/components/departmentHead/DepartmentHeadAssignmentModal';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { complaintService } from '@/services/complaintService';
import { FileText, Filter, X, Eye, ArrowUp, UserPlus } from 'lucide-react';

export function DepartmentComplaintsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status/Priority modal state
  const [statusPriorityComplaint, setStatusPriorityComplaint] = useState(null);
  const [isStatusPriorityModalOpen, setIsStatusPriorityModalOpen] = useState(false);

  // Assignment modal state
  const [assignmentComplaint, setAssignmentComplaint] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, searchQuery, statusFilter, priorityFilter]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all complaints - backend will filter by department
      const complaintsData = await complaintService.getAllComplaints({
        department: user?.department
      });
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
        complaint.submittedBy?.name?.toLowerCase().includes(query)
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

  // Check if complaint is old (older than 7 days and not resolved)
  const isOldComplaint = (complaint) => {
    if (complaint.status === 'resolved' || complaint.status === 'rejected') return false;
    const daysSinceCreation = (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 7;
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
    // Update the complaint in the list
    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c._id === updatedComplaint.id ? { ...c, ...updatedComplaint } : c
      )
    );
    // Reload data to get updated list
    loadComplaints();
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
    // Reload data to get updated list
    loadComplaints();
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Department Complaints"
          description={`Manage complaints in ${user?.department || 'your department'}`}
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
          title="Department Complaints"
          description={`Manage complaints in ${user?.department || 'your department'}`}
          icon={FileText}
        />
        <ErrorState
          message={error}
          onRetry={loadComplaints}
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
        <div className="flex items-center gap-2">
          <StatusBadge status={formatStatus(row.status)} size="sm" />
          {isOldComplaint(row) && (
            <span className="text-xs text-orange-600 font-medium" title="Old complaint (>7 days)">
              Old
            </span>
          )}
        </div>
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
          {!row.assignedTo && (
            <button
              onClick={() => handleAssign(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-teal hover:text-civic-teal-hover hover:bg-civic-hover rounded-lg transition-colors"
            >
              <UserPlus size={14} />
              Assign
            </button>
          )}
          {row.assignedTo && (
            <button
              onClick={() => handleAssign(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-orange hover:text-civic-orange-hover hover:bg-civic-hover rounded-lg transition-colors"
            >
              <UserPlus size={14} />
              Reassign
            </button>
          )}
          <button
            onClick={() => handleStatusPriority(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
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
        title="Department Complaints"
        description={`Manage complaints in ${user?.department || 'your department'}`}
        icon={FileText}
      />

      {/* Filters */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Search by complaint ID, title, or submitter..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              placeholder="All Priority"
              options={[
                { value: '', label: 'All Priority' },
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
              >
                <X size={14} />
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
            Complaints
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              ({filteredComplaints.length})
            </span>
          </h3>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No complaints match your filters' : 'No complaints in your department yet'}
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

      {/* Status/Priority Modal */}
      <StatusPriorityModal
        isOpen={isStatusPriorityModalOpen}
        onClose={handleCloseStatusPriorityModal}
        complaint={statusPriorityComplaint}
        onUpdateSuccess={handleStatusPrioritySuccess}
      />

      {/* Assignment Modal */}
      <DepartmentHeadAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        complaint={assignmentComplaint}
        onAssignSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
