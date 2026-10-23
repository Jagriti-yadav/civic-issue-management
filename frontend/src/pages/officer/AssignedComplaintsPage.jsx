import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Table } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { FileText, Search, Filter, Clock, Eye, ArrowUp, ChevronDown, X, CheckCircle2 } from 'lucide-react';

export function AssignedComplaintsPage() {
  const toast = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  // Handle navigation from notifications
  useEffect(() => {
    if (location.state?.selectedComplaintId && complaints.length > 0) {
      const complaint = complaints.find(c => c._id === location.state.selectedComplaintId);
      if (complaint) {
        setSelectedComplaint(complaint);
        setIsDetailsModalOpen(true);
        // Clear the state to prevent reopening on future navigations
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.selectedComplaintId, complaints]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintService.getMyAssignedComplaints();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError(err.message || 'Failed to load complaints');
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...complaints];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.complaintId?.toLowerCase().includes(query) ||
        c.title?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredComplaints(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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
    setSelectedComplaint(complaint);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleActionSuccess = () => {
    loadComplaints();
    handleCloseDetailsModal();
    // Trigger a dashboard refresh event
    window.dispatchEvent(new CustomEvent('dashboard-refresh'));
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Assigned Complaints"
          description="View and manage complaints assigned to you"
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
          title="Assigned Complaints"
          description="View and manage complaints assigned to you"
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
      sortable: true,
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
      sortable: true,
      render: (row) => (
        <PriorityBadge priority={formatPriority(row.priority)} size="sm" />
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-36',
      sortable: true,
      render: (row) => (
        <StatusBadge status={formatStatus(row.status)} size="sm" />
      )
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      width: 'w-36',
      sortable: true,
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
        </div>
      )
    }
  ];

  const renderTableHeader = (col) => {
    const isSorted = sortBy === col.key;
    return (
      <div className="flex items-center gap-1">
        {col.header}
        {col.sortable && (
          <button
            onClick={() => handleSort(col.key)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isSorted ? (
              sortOrder === 'asc' ? (
                <ChevronDown size={14} className="text-civic-blue" />
              ) : (
                <ChevronDown size={14} className="text-civic-blue rotate-180" />
              )
            ) : (
              <ChevronDown size={14} className="text-civic-text-secondary" />
            )}
          </button>
        )}
      </div>
    );
  };

  const hasActiveFilters = searchQuery || statusFilter || categoryFilter || priorityFilter;

  return (
    <div>
      <PageHeader
        title="Assigned Complaints"
        description="View and manage complaints assigned to you"
        icon={FileText}
      />

      {/* Search and Filters */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-text-secondary" />
              <input
                type="text"
                placeholder="Search by ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            className="w-40"
          />

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'roads', label: 'Roads' },
              { value: 'water', label: 'Water' },
              { value: 'electricity', label: 'Electricity' },
              { value: 'sanitation', label: 'Sanitation' },
              { value: 'public_safety', label: 'Public Safety' },
              { value: 'other', label: 'Other' }
            ]}
            className="w-40"
          />

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' }
            ]}
            className="w-40"
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearFilters}
            >
              <X size={16} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            My Assigned Complaints
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              ({filteredComplaints.length})
            </span>
          </h3>
        </div>

        {filteredComplaints.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No complaints match your filters' : 'No complaints have been assigned to you yet'}
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-civic-border bg-civic-bg/50">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="text-left text-sm font-medium text-civic-text-secondary px-4 py-3 whitespace-nowrap"
                      style={col.width ? { width: col.width } : {}}
                    >
                      {renderTableHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((row, i) => (
                  <tr
                    key={row._id || i}
                    className="border-b border-civic-border last:border-0 hover:bg-civic-hover transition-colors"
                  >
                    {columns.map((col, j) => (
                      <td key={j} className="text-left px-4 py-3.5 text-sm text-civic-text-primary">
                        {col.render ? col.render(row) : col.key ? row[col.key] : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title="Complaint Details"
        size="xl"
      >
        {selectedComplaint && (
          <OfficerComplaintDetailsContent
            complaint={selectedComplaint}
            onSuccess={handleActionSuccess}
          />
        )}
      </Modal>
    </div>
  );
}

// Officer Complaint Details Content Component
function OfficerComplaintDetailsContent({ complaint, onSuccess }) {
  const toast = useToast();
  const [statusLoading, setStatusLoading] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCategory = (category) => {
    if (!category) return 'N/A';
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatPriority = (priority) => {
    if (!priority) return 'N/A';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const handleStartWork = async () => {
    try {
      setStatusLoading(true);
      await complaintService.updateComplaintStatus(complaint._id, 'in_progress', 'Started working on complaint');
      toast.success('Complaint status updated to In Progress');
      onSuccess();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) {
      toast.error('Please enter a remark');
      return;
    }
    try {
      setStatusLoading(true);
      await complaintService.addRemark(complaint._id, remarkText);
      toast.success('Remark added successfully');
      setRemarkText('');
      onSuccess();
    } catch (err) {
      console.error('Failed to add remark:', err);
      toast.error(err.message || 'Failed to add remark');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      toast.error('Please enter resolution details');
      return;
    }
    try {
      setStatusLoading(true);
      await complaintService.updateComplaintStatus(
        complaint._id,
        'resolved',
        'Complaint resolved',
        resolutionText
      );
      toast.success('Complaint resolved successfully');
      setResolutionText('');
      setShowResolveForm(false);
      onSuccess();
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
      toast.error(err.message || 'Failed to resolve complaint');
    } finally {
      setStatusLoading(false);
    }
  };

  if (!complaint) return null;

  const canStartWork = complaint.status === 'assigned';
  const canResolve = complaint.status === 'in_progress';
  const isResolved = complaint.status === 'resolved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-civic-text-primary">Complaint Details</h2>
            <p className="text-sm text-civic-text-secondary">{complaint.complaintId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-civic-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Title</p>
              <p className="font-medium text-civic-text-primary">{complaint.title}</p>
            </div>
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Category</p>
              <p className="text-civic-text-primary">{formatCategory(complaint.category)}</p>
            </div>
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Priority</p>
              <PriorityBadge priority={formatPriority(complaint.priority)} />
            </div>
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Status</p>
              <StatusBadge status={formatStatus(complaint.status)} />
            </div>
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Department</p>
              <p className="text-civic-text-primary">{complaint.department}</p>
            </div>
            <div>
              <p className="text-sm text-civic-text-secondary mb-1">Submitted</p>
              <p className="text-civic-text-primary">{formatDate(complaint.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-civic-text-secondary mb-2">Description</p>
            <p className="text-civic-text-primary bg-gray-50 p-4 rounded-lg">{complaint.description}</p>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm text-civic-text-secondary mb-2">Location</p>
            <p className="text-civic-text-primary">
              {complaint.location?.address || complaint.location?.landmark || 'N/A'}
            </p>
          </div>

          {/* Citizen Info */}
          <div>
            <p className="text-sm text-civic-text-secondary mb-2">Submitted By</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-civic-text-primary">{complaint.submittedBy?.name || 'Unknown'}</p>
              <p className="text-sm text-civic-text-secondary">{complaint.submittedBy?.email || 'N/A'}</p>
              <p className="text-sm text-civic-text-secondary">{complaint.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Images */}
          {complaint.images && complaint.images.length > 0 && (
            <div>
              <p className="text-sm text-civic-text-secondary mb-2">Images</p>
              <div className="grid grid-cols-3 gap-2">
                {complaint.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Complaint image ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status History */}
          {complaint.statusHistory && complaint.statusHistory.length > 0 && (
            <div>
              <p className="text-sm text-civic-text-secondary mb-2">Status History</p>
              <div className="space-y-2">
                {complaint.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                    <Clock size={16} className="text-civic-text-secondary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-civic-text-primary">
                        {formatStatus(history.status)}
                      </p>
                      <p className="text-xs text-civic-text-secondary">{history.note}</p>
                      <p className="text-xs text-civic-text-secondary mt-1">
                        {formatDate(history.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          {complaint.remarks && complaint.remarks.length > 0 && (
            <div>
              <p className="text-sm text-civic-text-secondary mb-2">Remarks</p>
              <div className="space-y-2">
                {complaint.remarks.map((remark, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-civic-text-primary">{remark.text}</p>
                    <p className="text-xs text-civic-text-secondary mt-1">
                      {formatDate(remark.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Evidence */}
          {isResolved && complaint.resolutionEvidence && (
            <div>
              <p className="text-sm text-civic-text-secondary mb-2">Resolution Details</p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-civic-text-primary mb-2">
                  Resolved at: {formatDate(complaint.resolutionEvidence.resolvedAt)}
                </p>
                {complaint.resolutionEvidence.text && (
                  <p className="text-sm text-civic-text-primary mb-2">
                    {complaint.resolutionEvidence.text}
                  </p>
                )}
                {complaint.resolutionEvidence.images && complaint.resolutionEvidence.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {complaint.resolutionEvidence.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Resolution image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {!isResolved && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Add Remark */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a progress remark..."
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue"
              />
              <Button
                onClick={handleAddRemark}
                disabled={statusLoading || !remarkText.trim()}
                size="sm"
              >
                Add Remark
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canStartWork && (
                <Button
                  onClick={handleStartWork}
                  disabled={statusLoading}
                  className="flex-1"
                >
                  <ArrowUp size={16} className="mr-2" />
                  Start Work
                </Button>
              )}
              {canResolve && (
                <>
                  {!showResolveForm ? (
                    <Button
                      onClick={() => setShowResolveForm(true)}
                      disabled={statusLoading}
                      className="flex-1"
                      variant="success"
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      Resolve Complaint
                    </Button>
                  ) : (
                    <div className="flex-1 space-y-2">
                      <textarea
                        placeholder="Describe the resolution work performed..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleResolve}
                          disabled={statusLoading || !resolutionText.trim()}
                          className="flex-1"
                          variant="success"
                        >
                          Submit Resolution
                        </Button>
                        <Button
                          onClick={() => setShowResolveForm(false)}
                          disabled={statusLoading}
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
