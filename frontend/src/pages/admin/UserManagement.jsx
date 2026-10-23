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
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import { Users, Clock, CheckCircle2, Ban, Filter, X, Eye, UserCheck, UserX, FileText } from 'lucide-react';

export function UserManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    citizens: 0
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isComplaintsModalOpen, setIsComplaintsModalOpen] = useState(false);
  const [userComplaints, setUserComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Status change confirmation
  const [statusChangeUser, setStatusChangeUser] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, statusFilter, roleFilter]);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        role: roleFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const data = await userService.getAllUsers(params);
      setUsers(data.users || []);
      setPagination(data.pagination || pagination);

      // Calculate stats
      const allUsers = data.users || [];
      setStats({
        total: data.pagination?.total || 0,
        active: allUsers.filter(u => u.isActive).length,
        inactive: allUsers.filter(u => !u.isActive).length,
        citizens: allUsers.filter(u => u.role === 'citizen').length
      });

    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter (client-side for better UX)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setRoleFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const hasActiveFilters = searchQuery || statusFilter || roleFilter;

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
  };

  const handleViewComplaints = async (user) => {
    setSelectedUser(user);
    setIsComplaintsModalOpen(true);
    setLoadingComplaints(true);
    setUserComplaints([]);

    try {
      const data = await userService.getUserComplaints(user._id, { page: 1, limit: 10 });
      setUserComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load user complaints:', err);
      toast.error('Failed to load user complaints');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleCloseComplaintsModal = () => {
    setIsComplaintsModalOpen(false);
    setSelectedUser(null);
    setUserComplaints([]);
  };

  const handleStatusChange = (user, newStatus) => {
    setStatusChangeUser({ user, newStatus });
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeUser) return;

    try {
      setUpdatingStatus(true);
      const { user, newStatus } = statusChangeUser;

      await userService.updateUserStatus(user._id, newStatus);

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);

      // Update user in local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === user._id ? { ...u, isActive: newStatus } : u
        )
      );

      // Reload data to update stats
      loadUsers();

    } catch (err) {
      console.error('Failed to update user status:', err);
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setUpdatingStatus(false);
      setIsStatusConfirmOpen(false);
      setStatusChangeUser(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="User Management"
          description="View and manage all registered users"
          icon={Users}
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
          title="User Management"
          description="View and manage all registered users"
          icon={Users}
        />
        <ErrorState
          message={error}
          onRetry={loadUsers}
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
      key: 'role',
      header: 'Role',
      width: 'w-40',
      render: (row) => (
        <Badge
          variant="outline"
          size="sm"
          className="capitalize"
        >
          {formatRole(row.role)}
        </Badge>
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
      header: 'Registered',
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
            onClick={() => handleViewComplaints(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-teal hover:text-civic-teal-hover hover:bg-civic-hover rounded-lg transition-colors"
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
        title="User Management"
        description="View and manage all registered users in the system"
        icon={Users}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active Users"
          value={stats.active}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Inactive Users"
          value={stats.inactive}
          icon={Ban}
          color="red"
        />
        <StatCard
          label="Citizens"
          value={stats.citizens}
          icon={Users}
          color="teal"
        />
      </div>

      {/* Filters Section */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
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
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              placeholder="All Roles"
              className="w-40"
              options={[
                { value: 'citizen', label: 'Citizen' },
                { value: 'officer', label: 'Officer' },
                { value: 'department_head', label: 'Department Head' },
                { value: 'super_admin', label: 'Super Admin' }
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

      {/* Users Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            All Users
            {hasActiveFilters && (
              <span className="text-sm font-normal text-civic-text-secondary ml-2">
                ({filteredUsers.length} of {pagination.total})
              </span>
            )}
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No users match your filters' : 'No users registered yet'}
            icon={Users}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredUsers}
            />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civic-border">
                <p className="text-sm text-civic-text-secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* User Details Modal */}
      {isDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-civic-text-primary">User Details</h3>
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
                <p className="mt-1 text-civic-text-primary">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Email</label>
                <p className="mt-1 text-civic-text-primary">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Role</label>
                <p className="mt-1 capitalize text-civic-text-primary">{formatRole(selectedUser.role)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Phone</label>
                <p className="mt-1 text-civic-text-primary">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedUser.isActive ? 'success' : 'error'}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Department</label>
                <p className="mt-1 text-civic-text-primary">{selectedUser.department || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-civic-text-secondary">Registered On</label>
                <p className="mt-1 text-civic-text-primary">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Complaints Modal */}
      {isComplaintsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-card-hover max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-civic-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary">User Complaints</h3>
                  <p className="text-sm text-civic-text-secondary mt-1">
                    {selectedUser.name} ({selectedUser.email})
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
              ) : userComplaints.length === 0 ? (
                <EmptyState
                  message="No complaints submitted by this user"
                  icon={FileText}
                />
              ) : (
                <div className="space-y-3">
                  {userComplaints.map(complaint => (
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

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={confirmStatusChange}
        title={`${statusChangeUser?.newStatus ? 'Activate' : 'Deactivate'} User`}
        message={`Are you sure you want to ${statusChangeUser?.newStatus ? 'activate' : 'deactivate'} ${statusChangeUser?.user?.name}? This will ${statusChangeUser?.newStatus ? 'allow' : 'prevent'} them from accessing the system.`}
        confirmText={statusChangeUser?.newStatus ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        loading={updatingStatus}
        variant={statusChangeUser?.newStatus ? 'success' : 'error'}
      />
    </div>
  );
}
