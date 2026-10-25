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
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { useToast } from '@/context/ToastContext';
import { departmentService } from '@/services/departmentService';
import { Building2, Clock, CheckCircle2, Ban, Filter, X, Eye, UserCheck, UserX, FileText, Plus, Edit, Users, AlertTriangle } from 'lucide-react';

export function DepartmentManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalOfficers: 0,
    totalComplaints: 0
  });
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Modal states
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOfficersModalOpen, setIsOfficersModalOpen] = useState(false);
  const [isComplaintsModalOpen, setIsComplaintsModalOpen] = useState(false);
  const [isCreateDeptHeadModalOpen, setIsCreateDeptHeadModalOpen] = useState(false);
  const [departmentOfficers, setDepartmentOfficers] = useState([]);
  const [departmentComplaints, setDepartmentComplaints] = useState([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [creatingDeptHead, setCreatingDeptHead] = useState(false);

  // Create/Edit modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [updatingDepartment, setUpdatingDepartment] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Department Head form state
  const [deptHeadFormData, setDeptHeadFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    phone: ''
  });
  const [deptHeadErrors, setDeptHeadErrors] = useState({});

  // Status change confirmation
  const [statusChangeDepartment, setStatusChangeDepartment] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [departments, searchQuery]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const data = await departmentService.getDepartments(params);
      setDepartments(data.departments || []);
      setPagination(data.pagination || pagination);

      // Calculate stats
      const allDepts = data.departments || [];
      setStats({
        total: data.pagination?.total || 0,
        active: allDepts.filter(d => d.isActive).length,
        inactive: allDepts.filter(d => !d.isActive).length,
        totalOfficers: allDepts.reduce((sum, d) => sum + (d.officerCount || 0), 0),
        totalComplaints: allDepts.reduce((sum, d) => sum + (d.complaintCount || 0), 0)
      });

    } catch (err) {
      console.error('Failed to load departments:', err);
      setError(err.message || 'Failed to load departments');
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...departments];

    // Apply search filter (client-side for better UX)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dept =>
        dept.name?.toLowerCase().includes(query) ||
        dept.departmentId?.toLowerCase().includes(query)
      );
    }

    setFilteredDepartments(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasActiveFilters = searchQuery || statusFilter;

  const handleViewDetails = (department) => {
    setSelectedDepartment(department);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleViewOfficers = async (department) => {
    setSelectedDepartment(department);
    setIsOfficersModalOpen(true);
    setLoadingOfficers(true);
    setDepartmentOfficers([]);

    try {
      const data = await departmentService.getDepartmentOfficers(department._id, { page: 1, limit: 10 });
      setDepartmentOfficers(data.officers || []);
    } catch (err) {
      console.error('Failed to load department officers:', err);
      toast.error('Failed to load department officers');
    } finally {
      setLoadingOfficers(false);
    }
  };

  const handleCloseOfficersModal = () => {
    setIsOfficersModalOpen(false);
    setSelectedDepartment(null);
    setDepartmentOfficers([]);
  };

  const handleViewComplaints = async (department) => {
    setSelectedDepartment(department);
    setIsComplaintsModalOpen(true);
    setLoadingComplaints(true);
    setDepartmentComplaints([]);

    try {
      const data = await departmentService.getDepartmentComplaints(department._id, { page: 1, limit: 10 });
      setDepartmentComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load department complaints:', err);
      toast.error('Failed to load department complaints');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleCloseComplaintsModal = () => {
    setIsComplaintsModalOpen(false);
    setSelectedDepartment(null);
    setDepartmentComplaints([]);
  };

  const handleStatusChange = (department, newStatus) => {
    setStatusChangeDepartment({ department, newStatus });
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeDepartment) return;

    try {
      setUpdatingStatus(true);
      const { department, newStatus } = statusChangeDepartment;

      await departmentService.updateDepartment(department._id, { isActive: newStatus });

      toast.success(`Department ${newStatus ? 'activated' : 'deactivated'} successfully`);

      // Update department in local state
      setDepartments(prevDepts =>
        prevDepts.map(d =>
          d._id === department._id ? { ...d, isActive: newStatus } : d
        )
      );

      // Reload data to update stats
      loadDepartments();

    } catch (err) {
      console.error('Failed to update department status:', err);
      toast.error(err.message || 'Failed to update department status');
    } finally {
      setUpdatingStatus(false);
      setIsStatusConfirmOpen(false);
      setStatusChangeDepartment(null);
    }
  };

  const handleCreateDepartment = () => {
    setFormData({
      name: '',
      description: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      toast.error('Department name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Department name must be at least 2 characters');
      return;
    }

    try {
      setCreatingDepartment(true);

      await departmentService.createDepartment(formData);

      toast.success('Department created successfully');
      handleCloseCreateModal();
      loadDepartments();

    } catch (err) {
      console.error('Failed to create department:', err);
      toast.error(err.message || 'Failed to create department');
    } finally {
      setCreatingDepartment(false);
    }
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDepartment(null);
    setFormData({
      name: '',
      description: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) return;

    // Validation
    if (!formData.name) {
      toast.error('Department name is required');
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error('Department name must be at least 2 characters');
      return;
    }

    try {
      setUpdatingDepartment(true);

      await departmentService.updateDepartment(selectedDepartment._id, formData);

      toast.success('Department updated successfully');
      handleCloseEditModal();
      loadDepartments();

    } catch (err) {
      console.error('Failed to update department:', err);
      toast.error(err.message || 'Failed to update department');
    } finally {
      setUpdatingDepartment(false);
    }
  };

  const handleCreateDeptHead = (department) => {
    setSelectedDepartment(department);
    setDeptHeadFormData({
      name: '',
      email: '',
      password: '',
      designation: '',
      phone: ''
    });
    setDeptHeadErrors({});
    setIsCreateDeptHeadModalOpen(true);
  };

  const handleCloseCreateDeptHeadModal = () => {
    setIsCreateDeptHeadModalOpen(false);
    setSelectedDepartment(null);
    setDeptHeadFormData({
      name: '',
      email: '',
      password: '',
      designation: '',
      phone: ''
    });
    setDeptHeadErrors({});
  };

  const validateDeptHeadForm = () => {
    const errors = {};
    
    if (!deptHeadFormData.name) {
      errors.name = 'Name is required';
    } else if (deptHeadFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!deptHeadFormData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deptHeadFormData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!deptHeadFormData.password) {
      errors.password = 'Password is required';
    } else if (deptHeadFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (deptHeadFormData.phone && !/^\+?[1-9]\d{1,14}$/.test(deptHeadFormData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setDeptHeadErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDeptHeadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) return;

    if (!validateDeptHeadForm()) return;

    try {
      setCreatingDeptHead(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/users/department-heads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...deptHeadFormData,
          department: selectedDepartment.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create department head');
      }

      toast.success('Department Head created successfully');
      handleCloseCreateDeptHeadModal();
      loadDepartments();

    } catch (err) {
      console.error('Failed to create department head:', err);
      toast.error(err.message || 'Failed to create department head');
    } finally {
      setCreatingDeptHead(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Department Management"
          description="View and manage all departments in the system"
          icon={Building2}
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
          title="Department Management"
          description="View and manage all departments in the system"
          icon={Building2}
        />
        <ErrorState
          message={error}
          onRetry={loadDepartments}
        />
      </div>
    );
  }

  const columns = [
    {
      key: 'departmentId',
      header: 'Department ID',
      width: 'w-40',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-civic-blue">
          {row.departmentId}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      width: 'flex-1',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-civic-text-primary truncate">{row.name}</p>
          <p className="text-xs text-civic-text-secondary truncate line-clamp-1">
            {row.description || 'No description'}
          </p>
        </div>
      )
    },
    {
      key: 'officerCount',
      header: 'Officers',
      width: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-civic-text-secondary" />
          <span className="text-sm text-civic-text-primary font-medium">
            {row.officerCount || 0}
          </span>
        </div>
      )
    },
    {
      key: 'departmentHeadCount',
      header: 'Dept Head',
      width: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.departmentHeadCount > 0 ? (
            <>
              <UserCheck size={14} className="text-status-resolved" />
              <span className="text-sm text-civic-text-primary font-medium">
                {row.departmentHeadCount}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} className="text-status-pending" />
              <span className="text-sm text-status-pending font-medium">
                None
              </span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'complaintCount',
      header: 'Complaints',
      width: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-civic-text-secondary" />
          <span className="text-sm text-civic-text-primary font-medium">
            {row.complaintCount || 0}
          </span>
        </div>
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
            onClick={() => handleEditDepartment(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-teal hover:text-civic-teal-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => handleViewOfficers(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <Users size={14} />
            Officers
          </button>
          <button
            onClick={() => handleViewComplaints(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
          >
            <FileText size={14} />
            Complaints
          </button>
          {row.departmentHeadCount === 0 ? (
            <button
              onClick={() => handleCreateDeptHead(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-status-pending hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              title="Create Department Head"
            >
              <UserCheck size={14} />
              Add Head
            </button>
          ) : null}
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
        title="Department Management"
        description="View and manage all departments in the system"
        icon={Building2}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Departments"
          value={stats.total}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Active Departments"
          value={stats.active}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Inactive Departments"
          value={stats.inactive}
          icon={Ban}
          color="red"
        />
        <StatCard
          label="Total Officers"
          value={stats.totalOfficers}
          icon={Users}
          color="teal"
        />
      </div>

      {/* Warning Banner for Departments Without Heads */}
      {departments.filter(d => d.isActive && d.departmentHeadCount === 0).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">
                Departments Without Department Heads
              </h4>
              <p className="text-sm text-amber-800 mb-3">
                The following active departments have no department head assigned. Complaints cannot be assigned to officers without a department head.
              </p>
              <div className="space-y-2">
                {departments
                  .filter(d => d.isActive && d.departmentHeadCount === 0)
                  .map(dept => (
                    <div key={dept._id} className="flex items-center justify-between bg-white rounded-md p-2 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-amber-900">{dept.name}</span>
                        {dept.pendingComplaintCount > 0 && (
                          <Badge variant="error" size="sm">
                            {dept.pendingComplaintCount} pending complaints
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => handleCreateDeptHead(dept)}
                        className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-100 px-3 py-1 rounded transition-colors"
                      >
                        Add Head
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-1">
            <div className="flex-1 w-full lg:w-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or ID..."
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
            onClick={handleCreateDepartment}
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            All Departments
            {hasActiveFilters && (
              <span className="text-sm font-normal text-civic-text-secondary ml-2">
                ({filteredDepartments.length} of {pagination.total})
              </span>
            )}
          </h3>
        </div>

        {filteredDepartments.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No departments match your filters' : 'No departments created yet'}
            icon={Building2}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredDepartments}
            />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civic-border">
                <p className="text-sm text-civic-text-secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} departments
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

      {/* Department Details Modal */}
      {isDetailsModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-civic-text-primary">Department Details</h3>
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
                <label className="text-sm font-medium text-civic-text-secondary">Department ID</label>
                <p className="mt-1 font-mono text-civic-blue">{selectedDepartment.departmentId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Name</label>
                <p className="mt-1 text-civic-text-primary">{selectedDepartment.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Description</label>
                <p className="mt-1 text-civic-text-primary">{selectedDepartment.description || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-civic-text-secondary">Officers</label>
                  <p className="mt-1 text-civic-text-primary font-medium">{selectedDepartment.officerCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-civic-text-secondary">Complaints</label>
                  <p className="mt-1 text-civic-text-primary font-medium">{selectedDepartment.complaintCount || 0}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedDepartment.isActive ? 'success' : 'error'}>
                    {selectedDepartment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Created On</label>
                <p className="mt-1 text-civic-text-primary">{formatDate(selectedDepartment.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Officers Modal */}
      {isOfficersModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary">Department Officers</h3>
                  <p className="text-sm text-civic-text-secondary mt-1">
                    {selectedDepartment.name} ({selectedDepartment.departmentId})
                  </p>
                </div>
                <button
                  onClick={handleCloseOfficersModal}
                  className="p-2 text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {loadingOfficers ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : departmentOfficers.length === 0 ? (
                <EmptyState
                  message="No officers assigned to this department"
                  icon={Users}
                />
              ) : (
                <div className="space-y-3">
                  {departmentOfficers.map(officer => (
                    <div key={officer._id} className="card-base p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-civic-text-primary mb-1">{officer.name}</h4>
                          <p className="text-sm text-civic-text-secondary">{officer.email}</p>
                          {officer.designation && (
                            <p className="text-xs text-civic-text-secondary mt-1">{officer.designation}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          <Badge variant={officer.isActive ? 'success' : 'error'} size="sm">
                            {officer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
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

      {/* Department Complaints Modal */}
      {isComplaintsModalOpen && selectedDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary">Department Complaints</h3>
                  <p className="text-sm text-civic-text-secondary mt-1">
                    {selectedDepartment.name} ({selectedDepartment.departmentId})
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
              ) : departmentComplaints.length === 0 ? (
                <EmptyState
                  message="No complaints associated with this department"
                  icon={FileText}
                />
              ) : (
                <div className="space-y-3">
                  {departmentComplaints.map(complaint => (
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
                          {complaint.assignedTo && (
                            <p className="text-xs text-civic-text-secondary">
                              Assigned to: {complaint.assignedTo.name}
                            </p>
                          )}
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

      {/* Create Department Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Create New Department"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Department Name <span className="text-status-rejected">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter department name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter department description (optional)"
              rows={3}
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
              loading={creatingDepartment}
              fullWidth
            >
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Department"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Department Name <span className="text-status-rejected">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter department name"
              required
            />
            <p className="text-xs text-civic-text-secondary mt-1">
              Note: Cannot rename if department has officers or complaints
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter department description (optional)"
              rows={3}
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
              loading={updatingDepartment}
              fullWidth
            >
              Update Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={confirmStatusChange}
        title={`${statusChangeDepartment?.newStatus ? 'Activate' : 'Deactivate'} Department`}
        message={`Are you sure you want to ${statusChangeDepartment?.newStatus ? 'activate' : 'deactivate'} ${statusChangeDepartment?.department?.name}? ${statusChangeDepartment?.newStatus ? 'This will allow officers to be assigned to this department.' : 'This will prevent new assignments to this department.'}`}
        confirmText={statusChangeDepartment?.newStatus ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        loading={updatingStatus}
        variant={statusChangeDepartment?.newStatus ? 'success' : 'error'}
      />

      {/* Create Department Head Modal */}
      <Modal
        isOpen={isCreateDeptHeadModalOpen}
        onClose={handleCloseCreateDeptHeadModal}
        title={`Create Department Head for ${selectedDepartment?.name}`}
      >
        <form onSubmit={handleCreateDeptHeadSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Full Name <span className="text-status-rejected">*</span>
            </label>
            <Input
              value={deptHeadFormData.name}
              onChange={(e) => setDeptHeadFormData({ ...deptHeadFormData, name: e.target.value })}
              placeholder="Enter full name"
              error={deptHeadErrors.name}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Email Address <span className="text-status-rejected">*</span>
            </label>
            <Input
              type="email"
              value={deptHeadFormData.email}
              onChange={(e) => setDeptHeadFormData({ ...deptHeadFormData, email: e.target.value })}
              placeholder="Enter email address"
              error={deptHeadErrors.email}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Password <span className="text-status-rejected">*</span>
            </label>
            <Input
              type="password"
              value={deptHeadFormData.password}
              onChange={(e) => setDeptHeadFormData({ ...deptHeadFormData, password: e.target.value })}
              placeholder="Enter password (min. 6 characters)"
              error={deptHeadErrors.password}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Designation
            </label>
            <Input
              value={deptHeadFormData.designation}
              onChange={(e) => setDeptHeadFormData({ ...deptHeadFormData, designation: e.target.value })}
              placeholder="Enter designation (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-civic-text-primary mb-1.5">
              Phone Number
            </label>
            <Input
              type="tel"
              value={deptHeadFormData.phone}
              onChange={(e) => setDeptHeadFormData({ ...deptHeadFormData, phone: e.target.value })}
              placeholder="Enter phone number (optional)"
              error={deptHeadErrors.phone}
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Department: {selectedDepartment?.name}</p>
                <p className="text-amber-700">
                  This department head will be assigned to <strong>{selectedDepartment?.name}</strong>.
                  They will be able to manage officers and assign complaints for this department.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCreateDeptHeadModal}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creatingDeptHead}
              fullWidth
            >
              Create Department Head
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
