import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { Search, FileText, Clock, MapPin, User, Calendar, CheckCircle2 } from 'lucide-react';

export function TrackComplaintPage() {
  const [searchParams] = useSearchParams();
  const preloadedComplaintId = searchParams.get('complaintId');
  
  const [complaintId, setComplaintId] = useState(preloadedComplaintId || '');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (preloadedComplaintId) {
      handleSearch(new Event('submit'));
    }
  }, [preloadedComplaintId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      // Clean the complaint ID - remove # prefix if present
      const cleanId = complaintId.trim().replace(/^#/, '');
      const data = await complaintService.getComplaintByComplaintId(cleanId);
      setComplaint(data.complaint);
    } catch (error) {
      console.error('Tracking error:', error);
      setError(error.message || 'Complaint not found');
      setComplaint(null);
      toast.error(error.message || 'Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
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

  return (
    <div>
      <PageHeader
        title="Track Complaint"
        description="Enter your complaint ID to see the current status and complete history"
        icon={Search}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSearch} className="card-base p-6 mb-6">
          <Input
            label="Complaint ID"
            name="complaintId"
            placeholder="CMP-2026-001 or #CMP-2026-001"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            leftIcon={<FileText size={18} />}
            hint="You received this ID when you submitted your complaint. You can enter it with or without the # prefix."
            required
          />
          <Button type="submit" fullWidth size="lg" className="mt-4" leftIcon={<Search size={18} />} loading={loading}>
            Track Complaint
          </Button>
        </form>

        {loading && (
          <div className="card-base p-8 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && !loading && searched && (
          <ErrorState
            message={error}
            onRetry={() => handleSearch(new Event('submit'))}
          />
        )}

        {complaint && !loading && (
          <div className="card-base p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-civic-text-primary mb-1">
                  {complaint.title}
                </h2>
                <p className="text-sm text-civic-text-secondary">{complaint.complaintId}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Category</p>
                  <p className="text-sm text-civic-text-secondary">{formatCategory(complaint.category)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Location</p>
                  <p className="text-sm text-civic-text-secondary">
                    {complaint.location?.address || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Department</p>
                  <p className="text-sm text-civic-text-secondary">{complaint.department}</p>
                </div>
              </div>

              {complaint.assignedTo && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-civic-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-civic-text-primary">Assigned Officer</p>
                    <p className="text-sm text-civic-text-secondary">{complaint.assignedTo.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Submitted On</p>
                  <p className="text-sm text-civic-text-secondary">{formatDate(complaint.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Last Updated</p>
                  <p className="text-sm text-civic-text-secondary">{formatDate(complaint.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-civic-border pt-6">
              <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Status Timeline</h3>
              {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                <div className="space-y-4">
                  {complaint.statusHistory.map((history, index) => (
                    <div key={index} className="relative pl-6 pb-4 border-l-2 border-civic-border last:pb-0">
                      <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm -translate-x-[7px] ${
                        index === complaint.statusHistory.length - 1 ? 'bg-civic-blue' : 'bg-gray-300'
                      }`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-civic-text-primary">
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1).replace('_', ' ')}
                          </span>
                          <span className="text-civic-text-secondary">•</span>
                          <span className="text-sm text-civic-text-secondary">{formatDate(history.timestamp)}</span>
                        </div>
                        {history.note && (
                          <p className="text-sm text-civic-text-secondary">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-civic-text-secondary">No status history available</p>
              )}
            </div>
          </div>
        )}

        {!complaint && !loading && !error && !searched && (
          <EmptyState
            icon={Search}
            title="Track your complaint"
            description="Enter your complaint ID above to see the current status and complete history of your complaint."
          />
        )}
      </div>
    </div>
  );
}
