import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Table } from '@/components/common/Table';
import { SearchBar } from '@/components/common/SearchBar';
import { Select } from '@/components/common/Select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { Users, User, FileText, Clock, Zap, CheckCircle2, Eye, Phone, Mail } from 'lucide-react';

export function DepartmentOfficersPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingOfficerDetails, setLoadingOfficerDetails] = useState(false);
  const [officerDetails, setOfficerDetails] = useState(null);

  useEffect(() => {
    loadOfficers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [officers, searchQuery, statusFilter]);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await userService.getDepartmentOfficersWithWorkload({
        search: searchQuery,
        status: statusFilter
      });
      setOfficers(data.officers || []);

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

    // Apply search filter (client-side for immediate feedback)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(officer =>
        officer.name?.toLowerCase().includes(query) ||
        officer.email?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(officer =>
        statusFilter === 'active' ? officer.isActive : !officer.isActive
      );
    }

    setFilteredOfficers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

  const handleViewDetails = async (officer) => {
    setSelectedOfficer(officer);
    setIsModalOpen(true);
    setLoadingOfficerDetails(true);
    setOfficerDetails(null);

    try {
      const data = await userService.getOfficerDetailsForDepartmentHead(officer._id);
      setOfficerDetails(data);
    } catch (err) {
      console.error('Failed to load officer details:', err);
      toast.error('Failed to load officer details');
    } finally {
      setLoadingOfficerDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOfficer(null);
    setOfficerDetails(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasActiveFilters = searchQuery || statusFilter;

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Department Officers"
          description={`Manage officers in ${user?.department || 'your department'}`}
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
          title="Department Officers"
          description={`Manage officers in ${user?.department || 'your department'}`}
          icon={Users}
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
      header: 'Officer Name',
      width: 'flex-1',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-civic-blue/10 flex items-center justify-center">
            <User size={20} className="text-civic-blue" />
          </div>
          <div>
            <p className="font-medium text-civic-text-primary">{row.name}</p>
            <p className="text-xs text-civic-text-secondary">{row.designation || 'Officer'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      width: 'w-64',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-civic-text-secondary" />
          <span className="text-sm text-civic-text-primary truncate">{row.email}</span>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      width: 'w-40',
      render: (row) => (
        row.phone ? (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-civic-text-secondary" />
            <span className="text-sm text-civic-text-primary">{row.phone}</span>
          </div>
        ) : (
          <span className="text-sm text-civic-text-secondary">N/A</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-32',
      render: (row) => (
        <Badge
          variant={row.isActive ? 'success' : 'danger'}
          size="sm"
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'workload',
      header: 'Workload',
      width: 'w-48',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-civic-text-secondary">
            <FileText size={14} />
            <span>{row.workload?.total || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-orange-500">
            <Clock size={14} />
            <span>{row.workload?.assigned || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-500">
            <Zap size={14} />
            <span>{row.workload?.inProgress || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <CheckCircle2 size={14} />
            <span>{row.workload?.resolved || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
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
        <button
          onClick={() => handleViewDetails(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-blue hover:text-civic-blue-hover hover:bg-civic-hover rounded-lg transition-colors"
        >
          <Eye size={14} />
          View
        </button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Department Officers"
        description={`Manage officers in ${user?.department || 'your department'}`}
        icon={Users}
      />

      {/* Filters */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Search by officer name or email..."
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
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary hover:bg-civic-hover rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Officers Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            Officers
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              ({filteredOfficers.length})
            </span>
          </h3>
        </div>

        {filteredOfficers.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No officers match your filters' : 'No officers in your department yet'}
            icon={Users}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredOfficers}
          />
        )}
      </div>

      {/* Officer Details Modal */}
      {isModalOpen && selectedOfficer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-civic-text-primary">Officer Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-civic-text-secondary hover:text-civic-text-primary"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingOfficerDetails ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : officerDetails ? (
                <div className="space-y-6">
                  {/* Officer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Name</label>
                      <p className="text-lg font-semibold text-civic-text-primary">{officerDetails.officer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Email</label>
                      <p className="text-lg text-civic-text-primary">{officerDetails.officer.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Department</label>
                      <p className="text-lg text-civic-text-primary">{officerDetails.officer.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Designation</label>
                      <p className="text-lg text-civic-text-primary">{officerDetails.officer.designation || 'Officer'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Phone</label>
                      <p className="text-lg text-civic-text-primary">{officerDetails.officer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-civic-text-secondary">Status</label>
                      <Badge variant={officerDetails.officer.isActive ? 'success' : 'danger'}>
                        {officerDetails.officer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Workload Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Workload Summary</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-civic-blue">{officerDetails.officer.workload.total}</p>
                        <p className="text-sm text-civic-text-secondary">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-orange-500">{officerDetails.officer.workload.assigned}</p>
                        <p className="text-sm text-civic-text-secondary">Assigned</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-500">{officerDetails.officer.workload.inProgress}</p>
                        <p className="text-sm text-civic-text-secondary">In Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">{officerDetails.officer.workload.resolved}</p>
                        <p className="text-sm text-civic-text-secondary">Resolved</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Complaints */}
                  <div>
                    <h3 className="text-lg font-semibold text-civic-text-primary mb-4">
                      Assigned Complaints ({officerDetails.complaints.length})
                    </h3>
                    {officerDetails.complaints.length === 0 ? (
                      <EmptyState
                        message="No complaints assigned to this officer"
                        icon={FileText}
                      />
                    ) : (
                      <div className="space-y-3">
                        {officerDetails.complaints.map(complaint => (
                          <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-mono text-sm font-medium text-civic-blue">
                                {complaint.complaintId}
                              </p>
                              <Badge
                                variant={
                                  complaint.status === 'resolved' ? 'success' :
                                  complaint.status === 'in_progress' ? 'warning' :
                                  complaint.status === 'assigned' ? 'info' :
                                  complaint.status === 'rejected' ? 'danger' : 'default'
                                }
                                size="sm"
                              >
                                {complaint.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="font-medium text-civic-text-primary mb-1">{complaint.title}</p>
                            <p className="text-sm text-civic-text-secondary">
                              Submitted by: {complaint.submittedBy?.name || 'Unknown'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-civic-text-secondary py-12">Failed to load officer details</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
