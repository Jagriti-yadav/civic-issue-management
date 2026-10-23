import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { SearchBar } from '@/components/common/SearchBar';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import { Shield, Clock, CheckCircle2, Ban, Filter, X, Eye, UserCheck, UserX, FileText, Plus, Edit } from 'lucide-react';

export function OfficerManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    assigned: 0
  });
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Modal states
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isComplaintsModalOpen, setIsComplaintsModalOpen] = useState(false);
  const [officerComplaints, setOfficerComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Create/Edit modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creatingOfficer, setCreatingOfficer] = useState(false);
  const [updatingOfficer, setUpdatingOfficer] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    phone: ''
  });

  // Status change confirmation
  const [statusChangeOfficer, setStatusChangeOfficer] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadOfficers();
  }, [pagination.page, pagination.limit, statusFilter, departmentFilter]);

  useEffect(() => {
    applyFilters();
  }, [officers, searchQuery]);

  const loadDepartments = async () => {
    try {
      const data = await userService.getDepartments();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        department: departmentFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const data = await userService.getOfficers(params);
      setOfficers(data.officers || []);
      setPagination(data.pagination || pagination);

      // Calculate stats
      const allOfficers = data.officers || [];
      setStats({
        total: data.pagination?.total || 0,
        active: allOfficers.filter(o => o.isActive).length,
        inactive: allOfficers.filter(o => !o.isActive).length,
        assigned: allOfficers.filter(o => o.department).length
      });

    } catch (err) {
      console.error('Failed to load officers:', err);
      setError(err.message || 'Failed to load officers');
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...officers];

    // Apply search filter (client-side for better UX)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(officer =>
        officer.name?.toLowerCase().includes(query) ||
        officer.email?.toLowerCase().includes(query)
      );
    }

    setFilteredOfficers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDepartmentFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasActiveFilters = searchQuery || statusFilter || departmentFilter;

  const handleViewDetails = (officer) => {
    setSelectedOfficer(officer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOfficer(null);
  };

  const handleViewComplaints = async (officer) => {
    setSelectedOfficer(officer);
    setIsComplaintsModalOpen(true);
    setLoadingComplaints(true);
    setOfficerComplaints([]);

    try {
      const data = await userService.getOfficerComplaints(officer._id, { page: 1, limit: 10 });
      setOfficerComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load officer complaints:', err);
      toast.error('Failed to load officer complaints');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleCloseComplaintsModal = () => {
    setIsComplaintsModalOpen(false);
    setSelectedOfficer(null);
    setOfficerComplaints([]);
  };

  const handleStatusChange = (officer, newStatus) => {
    setStatusChangeOfficer({ officer, newStatus });
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeOfficer) return;

    try {
      setUpdatingStatus(true);
      const { officer, newStatus } = statusChangeOfficer;

      await userService.updateUserStatus(officer._id, newStatus);

      toast.success(`Officer ${newStatus ? 'activated' : 'deactivated'} successfully`);

      // Update officer in local state
      setOfficers(prevOfficers =>
        prevOfficers.map(o =>
          o._id === officer._id ? { ...o, isActive: newStatus } : o
        )
      );

      // Reload data to update stats
      loadOfficers();

    } catch (err) {
      console.error('Failed to update officer status:', err);
      toast.error(err.message || 'Failed to update officer status');
    } finally {
      setUpdatingStatus(false);
      setIsStatusConfirmOpen(false);
      setStatusChangeOfficer(null);
    }
  };

  const handleCreateOfficer = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: ''
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please provide a valid email');
      return;
    }

    try {
      setCreatingOfficer(true);

      await userService.createOfficer(formData);

      toast.success('Officer created successfully');
      handleCloseCreateModal();
      loadOfficers();

    } catch (err) {
      console.error('Failed to create officer:', err);
      toast.error(err.message || 'Failed to create officer');
    } finally {
      setCreatingOfficer(false);
    }
  };

  const handleEditOfficer = (officer) => {
    setSelectedOfficer(officer);
    setFormData({
      name: officer.name,
      email: officer.email,
      password: '',
      department: officer.department,
      designation: officer.designation || '',
      phone: officer.phone || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOfficer(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOfficer) return;

    // Validation
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please provide a valid email');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdatingOfficer(true);

      const updateData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await userService.updateOfficer(selectedOfficer._id, updateData);

      toast.success('Officer updated successfully');
      handleCloseEditModal();
      loadOfficers();

    } catch (err) {
      console.error('Failed to update officer:', err);
      toast.error(err.message || 'Failed to update officer');
    } finally {
      setUpdatingOfficer(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Officer Management"
          description="View and manage all officers in the system"
          icon={Shield}
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
          title="Officer Management"
          description="View and manage all officers in the system"
          icon={Shield}
        />
        <ErrorState
          message={error}
          onRetry={loadOfficers}
        />
      </div>
    );
  }

  const columns = [
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
      key: 'department',
      header: 'Department',
      width: 'w-44',
      render: (row) => (
        <span className="text-sm text-civic-text-primary truncate block max-w-36">
          {row.department || 'N/A'}
        </span>
      )
    },
    {
      key: 'designation',
      header: 'Designation',
      width: 'w-40',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {row.designation || 'N/A'}
        </span>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {row.phone || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-32',
      render: (row) => (
        <Badge
          variant={row.isActive ? 'success' : 'error'}
          size="sm"
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
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
            onClick={() => handleEditOfficer(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-teal hover:text-civic-teal-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => handleViewComplaints(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <FileText size={14} />
            Complaints
          </button>
          {row.isActive ? (
            <button
              onClick={() => handleStatusChange(row, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-status-rejected hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <UserX size={14} />
              Deactivate
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange(row, true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-status-resolved hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            >
              <UserCheck size={14} />
              Activate
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Officer Management"
        description="View and manage all officers in the system"
        icon={Shield}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Officers"
          value={stats.total}
          icon={Shield}
          color="blue"
        />
        <StatCard
          label="Active Officers"
          value={stats.active}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Inactive Officers"
          value={stats.inactive}
          icon={Ban}
          color="red"
        />
        <StatCard
          label="Assigned to Dept"
          value={stats.assigned}
          icon={Shield}
          color="teal"
        />
      </div>

      {/* Filters Section */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-1">
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or email..."
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="All Statuses"
                className="w-40"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="All Departments"
                className="w-48"
                options={departments.map(dept => ({ value: dept, label: dept }))}
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
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleCreateOfficer}
          >
            Add Officer
          </Button>
        </div>
      </div>

      {/* Officers Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            All Officers
            {hasActiveFilters && (
              <span className="text-sm font-normal text-civic-text-secondary ml-2">
                ({filteredOfficers.length} of {pagination.total})
              </span>
            )}
          </h3>
        </div>

        {filteredOfficers.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No officers match your filters' : 'No officers registered yet'}
            icon={Shield}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredOfficers}
            />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civic-border">
                <p className="text-sm text-civic-text-secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} officers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-civic-text-primary bg-civic-hover rounded-lg">
                    {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1.5 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Officer Details Modal */}
      {isDetailsModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-civic-text-primary">Officer Details</h3>
                <button
                  onClick={handleCloseDetailsModal}
                  className="p-2 text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Name</label>
                <p className="mt-1 text-civic-text-primary">{selectedOfficer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Email</label>
                <p className="mt-1 text-civic-text-primary">{selectedOfficer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Department</label>
                <p className="mt-1 text-civic-text-primary">{selectedOfficer.department || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Designation</label>
                <p className="mt-1 text-civic-text-primary">{selectedOfficer.designation || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Phone</label>
                <p className="mt-1 text-civic-text-primary">{selectedOfficer.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedOfficer.isActive ? 'success' : 'error'}>
                    {selectedOfficer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Created On</label>
                <p className="mt-1 text-civic-text-primary">{formatDate(selectedOfficer.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Officer Complaints Modal */}
      {isComplaintsModalOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary">Assigned Complaints</h3>
                  <p className="text-sm text-civic-text-secondary mt-1">
                    {selectedOfficer.name} ({selectedOfficer.department})
                  </p>
                </div>
                <button
                  onClick={handleCloseComplaintsModal}
                  className="p-2 text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingComplaints ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : officerComplaints.length === 0 ? (
                <EmptyState
                  message="No complaints assigned to this officer"
                  icon={FileText}
                />
              ) : (
                <div className="space-y-3">
                  {officerComplaints.map(complaint => (
                    <div key={complaint._id} className="card-base p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-medium text-civic-blue">
                              {complaint.complaintId}
                            </span>
                            <Badge variant="outline" size="sm">
                              {complaint.category}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-civic-text-primary mb-1">{complaint.title}</h4>
                          <p className="text-sm text-civic-text-secondary line-clamp-2">{complaint.description}</p>
                          <p className="text-xs text-civic-text-secondary mt-2">
                            Submitted by: {complaint.submittedBy?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <Badge variant={complaint.status === 'resolved' ? 'success' : 'default'} size="sm">
                            {complaint.status}
                          </Badge>
                          <span className="text-xs text-civic-text-secondary">
                            {formatDate(complaint.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Officer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create New Officer"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Name <span className="text-status-rejected">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter officer name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Email <span className="text-status-rejected">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Password <span className="text-status-rejected">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Department <span className="text-status-rejected">*</span>
            </label>
            <Select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Select department"
              required
              options={departments.map(dept => ({ value: dept, label: dept }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Designation
            </label>
            <Input
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Enter designation (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Phone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number (optional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCreateModal}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creatingOfficer}
              fullWidth
            >
              Create Officer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Officer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Officer"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Name <span className="text-status-rejected">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter officer name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Email <span className="text-status-rejected">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              New Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Department <span className="text-status-rejected">*</span>
            </label>
            <Select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Select department"
              required
              options={departments.map(dept => ({ value: dept, label: dept }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Designation
            </label>
            <Input
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Enter designation (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Phone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number (optional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseEditModal}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updatingOfficer}
              fullWidth
            >
              Update Officer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={confirmStatusChange}
        title={`${statusChangeOfficer?.newStatus ? 'Activate' : 'Deactivate'} Officer`}
        message={`Are you sure you want to ${statusChangeOfficer?.newStatus ? 'activate' : 'deactivate'} ${statusChangeOfficer?.officer?.name}? This will ${statusChangeOfficer?.newStatus ? 'allow' : 'prevent'} them from accessing the system.`}
        confirmText={statusChangeOfficer?.newStatus ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        loading={updatingStatus}
        variant={statusChangeOfficer?.newStatus ? 'success' : 'error'}
      />
    </div>
  );
}
