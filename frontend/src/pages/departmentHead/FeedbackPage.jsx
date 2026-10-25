import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Star, Search, Filter, Clock, MessageSquare, Smile, Frown, Meh, TrendingUp } from 'lucide-react';

export function FeedbackPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    loadFeedback();
  }, [pagination.page, pagination.limit, ratingFilter]);

  useEffect(() => {
    applyFilters();
  }, [feedbackList, searchQuery]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        rating: ratingFilter,
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/complaints/feedback/department?${new URLSearchParams(params)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load feedback');
      }

      setFeedbackList(data.complaints || []);
      setStats(data.feedbackStats || stats);
      setPagination(data.pagination || pagination);

    } catch (err) {
      console.error('Failed to load feedback:', err);
      setError(err.message || 'Failed to load feedback');
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbackList];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.complaintId?.toLowerCase().includes(query) ||
        f.title?.toLowerCase().includes(query) ||
        f.submittedBy?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredFeedback(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRatingFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getRatingIcon = (rating) => {
    if (rating >= 4) return <Smile size={16} className="text-green-500" />;
    if (rating === 3) return <Meh size={16} className="text-yellow-500" />;
    return <Frown size={16} className="text-red-500" />;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating === 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const columns = [
    {
      key: 'complaintId',
      header: 'Complaint ID',
      width: 'w-40',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-civic-blue">
          {row.complaintId}
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
      key: 'rating',
      header: 'Rating',
      width: 'w-32',
      render: (row) => (
        <div className="flex items-center gap-2">
          {renderStars(row.feedback?.rating)}
          <span className="text-sm font-medium text-civic-text-primary">
            {row.feedback?.rating}/5
          </span>
        </div>
      )
    },
    {
      key: 'officer',
      header: 'Officer',
      width: 'w-40',
      render: (row) => (
        <span className="text-sm text-civic-text-primary">
          {row.assignedTo?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'submittedAt',
      header: 'Feedback Date',
      width: 'w-36',
      render: (row) => (
        <span className="text-sm text-civic-text-secondary">
          {formatDate(row.feedback?.submittedAt)}
        </span>
      )
    },
    {
      key: 'comment',
      header: 'Comment',
      width: 'w-48',
      render: (row) => (
        <p className="text-sm text-civic-text-secondary truncate max-w-xs">
          {row.feedback?.comment || 'No comment'}
        </p>
      )
    }
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Feedback Review"
          description={`View and analyze citizen feedback for ${user?.department || 'your department'}`}
          icon={MessageSquare}
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
          title="Feedback Review"
          description={`View and analyze citizen feedback for ${user?.department || 'your department'}`}
          icon={MessageSquare}
        />
        <ErrorState
          message={error}
          onRetry={loadFeedback}
        />
      </div>
    );
  }

  const hasActiveFilters = searchQuery || ratingFilter;

  return (
    <div>
      <PageHeader
        title="Feedback Review"
        description={`View and analyze citizen feedback for ${user?.department || 'your department'}`}
        icon={MessageSquare}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Feedback"
          value={stats.totalFeedback}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          label="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="yellow"
        />
        <StatCard
          label="Positive (4-5 Stars)"
          value={stats.rating4 + stats.rating5}
          icon={Smile}
          color="green"
        />
        <StatCard
          label="Negative (1-2 Stars)"
          value={stats.rating1 + stats.rating2}
          icon={Frown}
          color="red"
        />
      </div>

      {/* Rating Distribution */}
      <div className="card-base p-6 mb-6">
        <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-24">
                <span className="text-sm font-medium text-civic-text-primary">{rating} Star</span>
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-400 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalFeedback > 0 ? (stats[`rating${rating}`] / stats.totalFeedback) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium text-civic-text-primary w-12 text-right">
                {stats[`rating${rating}`]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="card-base p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-1">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by ID, title, or citizen name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-civic-text-secondary" />
                <span className="text-sm font-medium text-civic-text-secondary">Filters:</span>
              </div>
              <Select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="All Ratings"
                className="w-40"
                options={[
                  { value: '', label: 'All Ratings' },
                  { value: '5', label: '5 Stars' },
                  { value: '4', label: '4 Stars' },
                  { value: '3', label: '3 Stars' },
                  { value: '2', label: '2 Stars' },
                  { value: '1', label: '1 Star' }
                ]}
              />
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-civic-text-primary">
            Citizen Feedback
            <span className="text-sm font-normal text-civic-text-secondary ml-2">
              ({filteredFeedback.length})
            </span>
          </h3>
        </div>

        {filteredFeedback.length === 0 ? (
          <EmptyState
            message={hasActiveFilters ? 'No feedback matches your filters' : 'No feedback received yet'}
            icon={MessageSquare}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredFeedback}
            />
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-civic-border">
                <p className="text-sm text-civic-text-secondary">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} feedback
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: pagination.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm font-medium text-civic-text-secondary hover:text-civic-text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-civic-text-primary bg-civic-hover rounded-lg">
                    {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: pagination.page + 1 }))}
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
    </div>
  );
}
