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
import { ArrowLeft, FileText, MapPin, Calendar, User, Clock, Building2, AlertCircle, Phone, Star, CheckCircle2 } from 'lucide-react';

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaint, setComplaint] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintService.getComplaintById(id);

      setComplaint(data.complaint);
    } catch (error) {
      console.error('Failed to load complaint:', error);
      setError(error.message || 'Failed to load complaint');
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmittingFeedback(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/complaints/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      toast.success('Thank you for your feedback!');
      setShowFeedbackForm(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      loadComplaint(); // Reload to show submitted feedback
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
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
                <Phone size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Contact Number</p>
                  <p className="text-sm text-civic-text-secondary">{complaint.phoneNumber || 'Not provided'}</p>
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

          {/* Feedback Section */}
          {complaint.status === 'resolved' && (
            <div className="card-base p-6">
              {complaint.feedback && complaint.feedback.submittedAt ? (
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-status-resolved" />
                    Your Feedback
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= complaint.feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 font-medium text-civic-text-primary">
                        {complaint.feedback.rating}/5
                      </span>
                    </div>
                    {complaint.feedback.comment && (
                      <p className="text-sm text-civic-text-secondary mt-2">
                        "{complaint.feedback.comment}"
                      </p>
                    )}
                    <p className="text-xs text-civic-text-secondary mt-2">
                      Submitted on {formatDate(complaint.feedback.submittedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-civic-text-primary mb-4 flex items-center gap-2">
                    <Star size={20} className="text-civic-blue" />
                    Submit Feedback
                  </h3>
                  <p className="text-sm text-civic-text-secondary mb-4">
                    How satisfied are you with the resolution of this complaint?
                  </p>
                  {!showFeedbackForm ? (
                    <Button
                      onClick={() => setShowFeedbackForm(true)}
                      fullWidth
                      variant="primary"
                    >
                      <Star size={16} className="mr-2" />
                      Rate This Resolution
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-civic-text-primary mb-2">
                          Your Rating <span className="text-status-rejected">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={28}
                                className={star <= feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-civic-text-secondary mt-1">
                          {feedbackRating === 1 && 'Poor'}
                          {feedbackRating === 2 && 'Fair'}
                          {feedbackRating === 3 && 'Good'}
                          {feedbackRating === 4 && 'Very Good'}
                          {feedbackRating === 5 && 'Excellent'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-civic-text-primary mb-2">
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Share your experience with this resolution..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitFeedback}
                          disabled={submittingFeedback || feedbackRating === 0}
                          className="flex-1"
                          loading={submittingFeedback}
                        >
                          Submit Feedback
                        </Button>
                        <Button
                          onClick={() => {
                            setShowFeedbackForm(false);
                            setFeedbackRating(0);
                            setFeedbackComment('');
                          }}
                          disabled={submittingFeedback}
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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