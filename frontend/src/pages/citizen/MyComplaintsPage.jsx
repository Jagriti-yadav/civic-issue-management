import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { complaintService } from '@/services/complaintService';
import { FileText, Search, Eye } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'roads', label: 'Roads' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'sanitation', label: 'Sanitation' },
  { value: 'public_safety', label: 'Public Safety' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export function MyComplaintsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadComplaints();
  }, [filters, sortBy]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryFilters = {};
      if (filters.status) queryFilters.status = filters.status;
      if (filters.category) queryFilters.category = filters.category;
      if (filters.priority) queryFilters.priority = filters.priority;

      const data = await complaintService.getUserComplaints(user?.id, queryFilters);
      
      let sortedComplaints = [...(data.complaints || [])];
      
      if (sortBy === 'newest') {
        sortedComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        sortedComplaints.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      setComplaints(sortedComplaints);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      setError(error.message || 'Failed to load complaints');
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const searchLower = searchTerm.toLowerCase();
    return (
      complaint.complaintId.toLowerCase().includes(searchLower) ||
      complaint.title.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="My Complaints"
          description="View and manage your submitted complaints"
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
          title="My Complaints"
          description="View and manage your submitted complaints"
          icon={FileText}
        />
        <ErrorState
          message={error}
          onRetry={loadComplaints}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Complaints"
        description="View and manage your submitted complaints"
        icon={FileText}
        action={
          <Link to="/citizen/submit-complaint">
            <Button size="sm" leftIcon={<FileText size={16} />}>
              New Complaint
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="card-base p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search by ID or title..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Search size={18} />}
            className="lg:col-span-2"
          />
          
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={STATUS_OPTIONS}
          />
          
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={CATEGORY_OPTIONS}
          />
          
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="card-base">
        {filteredComplaints.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={searchTerm || filters.status || filters.category || filters.priority ? 'No matching complaints' : 'No complaints yet'}
            description={searchTerm || filters.status || filters.category || filters.priority 
              ? 'Try adjusting your search or filters' 
              : 'Start by submitting your first civic issue complaint'}
            action={
              <Link to="/citizen/submit-complaint">
                <Button variant="primary" leftIcon={<FileText size={16} />}>
                  Submit Complaint
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-civic-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-civic-text-secondary">Updated</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-civic-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b border-civic-border hover:bg-civic-hover transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-civic-text-primary">
                      {complaint.complaintId}
                    </td>
                    <td className="py-3 px-4 text-sm text-civic-text-primary">
                      {complaint.title}
                    </td>
                    <td className="py-3 px-4 text-sm text-civic-text-secondary">
                      {formatCategory(complaint.category)}
                    </td>
                    <td className="py-3 px-4 text-sm text-civic-text-secondary">
                      {complaint.department}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-civic-text-secondary">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-civic-text-secondary">
                      {formatDate(complaint.updatedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/citizen/complaints/${complaint._id}`}>
                        <Button size="sm" variant="ghost" leftIcon={<Eye size={16} />}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}