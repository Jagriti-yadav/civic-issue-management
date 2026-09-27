import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { complaintService } from '@/services/complaintService';
import { ArrowLeft, FileText, MapPin, Calendar, User, Clock, Building2, AlertCircle } from 'lucide-react';

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintService.getComplaintById(id);
      
      // Verify ownership
      if (data.complaint.submittedBy._id !== user?.id) {
        setError('You do not have permission to view this complaint');
        return;
      }
      
      setComplaint(data.complaint);
    } catch (error) {
      console.error('Failed to load complaint:', error);
      setError(error.message || 'Failed to load complaint');
      toast.error('Failed to load complaint');
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

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Link to="/citizen/complaints">
            <Button size="sm" variant="ghost" leftIcon={<ArrowLeft size={16} />}>
              Back to My Complaints
            </Button>
          </Link>
        </div>
        <div className="card-base p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <Link to="/citizen/complaints">
            <Button size="sm" variant="ghost" leftIcon={<ArrowLeft size={16} />}>
              Back to My Complaints
            </Button>
          </Link>
        </div>
        <ErrorState
          message={error}
          onRetry={loadComplaint}
        />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div>
        <div className="mb-4">
          <Link to="/citizen/complaints">
            <Button size="sm" variant="ghost" leftIcon={<ArrowLeft size={16} />}>
              Back to My Complaints
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={FileText}
          title="Complaint not found"
          description="The complaint you're looking for doesn't exist or has been removed"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/citizen/complaints">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft size={16} />}>
            Back to My Complaints
          </Button>
        </Link>
      </div>

      <PageHeader
        title={complaint.title}
        description={`Complaint ID: ${complaint.complaintId}`}
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Priority */}
          <div className="card-base p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            
            <h3 className="text-lg font-semibold text-civic-text-primary mb-2">Description</h3>
            <p className="text-civic-text-secondary whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Location */}
          <div className="card-base p-6">
            <h3 className="text-lg font-semibold text-civic-text-primary mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h3>
            <div className="space-y-2">
              <p className="text-civic-text-secondary">
                <span className="font-medium text-civic-text-primary">Address:</span> {complaint.location?.address || 'Not specified'}
              </p>
              {complaint.location?.landmark && (
                <p className="text-civic-text-secondary">
                  <span className="font-medium text-civic-text-primary">Landmark:</span> {complaint.location.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="card-base p-6">
            <h3 className="text-lg font-semibold text-civic-text-primary mb-4 flex items-center gap-2">
              <Clock size={20} />
              Status History
            </h3>
            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {complaint.statusHistory.map((history, index) => (
                  <div key={index} className="relative pl-6 pb-4 border-l-2 border-civic-border last:pb-0">
                    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-civic-blue border-2 border-white shadow-sm -translate-x-[7px]" />
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
                      {history.changedBy && (
                        <p className="text-xs text-civic-text-secondary">
                          Changed by: {history.changedBy.name || 'System'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-civic-text-secondary">No status history available</p>
            )}
          </div>

          {/* Remarks */}
          {complaint.remarks && complaint.remarks.length > 0 && (
            <div className="card-base p-6">
              <h3 className="text-lg font-semibold text-civic-text-primary mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Remarks
              </h3>
              <div className="space-y-4">
                {complaint.remarks.map((remark, index) => (
                  <div key={index} className="bg-civic-hover rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-civic-text-secondary" />
                      <span className="font-medium text-civic-text-primary">{remark.user?.name || 'Unknown'}</span>
                      <span className="text-xs text-civic-text-secondary">•</span>
                      <span className="text-xs text-civic-text-secondary">{formatDate(remark.timestamp)}</span>
                    </div>
                    <p className="text-sm text-civic-text-secondary">{remark.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="card-base p-6">
            <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Category</p>
                  <p className="text-sm text-civic-text-secondary">{formatCategory(complaint.category)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Department</p>
                  <p className="text-sm text-civic-text-secondary">{complaint.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Submitted</p>
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

              {complaint.assignedTo && (
                <div className="flex items-start gap-3">
                  <User size={18} className="text-civic-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-civic-text-primary">Assigned Officer</p>
                    <p className="text-sm text-civic-text-secondary">{complaint.assignedTo.name}</p>
                    <p className="text-xs text-civic-text-secondary">{complaint.assignedTo.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="card-base p-6">
              <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Evidence Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {complaint.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Track Button */}
          <Link to={`/citizen/track?complaintId=${complaint.complaintId}`}>
            <Button fullWidth variant="outline" leftIcon={<Clock size={18} />}>
              Track This Complaint
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}