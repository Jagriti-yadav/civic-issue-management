import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { FileText, MapPin, Calendar, User, Clock, Building2, Phone, AlertCircle, Image as ImageIcon } from 'lucide-react';

export function AdminComplaintDetailsModal({ isOpen, onClose, complaintId }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    if (isOpen && complaintId) {
      loadComplaint();
    }
  }, [isOpen, complaintId]);

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintService.getComplaintById(complaintId);
      setComplaint(data.complaint);
    } catch (err) {
      console.error('Failed to load complaint:', err);
      setError(err.message || 'Failed to load complaint details');
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

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

  const handleClose = () => {
    setComplaint(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Complaint Details"
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto text-status-rejected mb-4" />
          <p className="text-civic-text-secondary mb-4">{error}</p>
          <button
            onClick={loadComplaint}
            className="px-4 py-2 bg-civic-blue text-white rounded-lg hover:bg-civic-blue-hover transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !complaint ? (
        <div className="text-center py-8">
          <FileText size={48} className="mx-auto text-civic-text-secondary mb-4" />
          <p className="text-civic-text-secondary">Complaint not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="border-b border-civic-border pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-civic-text-primary mb-1">
                  {complaint.title || 'Untitled Complaint'}
                </h3>
                <p className="text-sm text-civic-text-secondary font-mono">
                  ID: {complaint.complaintId || 'N/A'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={formatStatus(complaint.status)} />
                <PriorityBadge priority={formatPriority(complaint.priority)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Description
                </h4>
                <p className="text-sm text-civic-text-secondary whitespace-pre-wrap bg-civic-bg/50 rounded-lg p-3">
                  {complaint.description || 'No description provided'}
                </p>
              </div>

              {/* Citizen Information */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <User size={16} />
                  Citizen Information
                </h4>
                <div className="bg-civic-bg/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Name:</span>
                    <span className="text-sm font-medium text-civic-text-primary">
                      {complaint.submittedBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Email:</span>
                    <span className="text-sm text-civic-text-primary">
                      {complaint.submittedBy?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Phone:</span>
                    <span className="text-sm text-civic-text-primary">
                      {complaint.phoneNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </h4>
                <div className="bg-civic-bg/50 rounded-lg p-3 space-y-2">
                  {complaint.location?.address && (
                    <div>
                      <span className="text-sm text-civic-text-secondary">Address: </span>
                      <span className="text-sm text-civic-text-primary">{complaint.location.address}</span>
                    </div>
                  )}
                  {complaint.location?.landmark && (
                    <div>
                      <span className="text-sm text-civic-text-secondary">Landmark: </span>
                      <span className="text-sm text-civic-text-primary">{complaint.location.landmark}</span>
                    </div>
                  )}
                  {!complaint.location?.address && !complaint.location?.landmark && (
                    <span className="text-sm text-civic-text-secondary">No location specified</span>
                  )}
                </div>
              </div>

              {/* Uploaded Images */}
              {complaint.images && complaint.images.length > 0 ? (
                <div>
                  <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    Evidence Images ({complaint.images.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {complaint.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-civic-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Department & Assignment */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Department & Assignment
                </h4>
                <div className="bg-civic-bg/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Department:</span>
                    <span className="text-sm font-medium text-civic-text-primary">
                      {complaint.department || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Category:</span>
                    <span className="text-sm text-civic-text-primary">
                      {formatCategory(complaint.category)}
                    </span>
                  </div>
                  {complaint.assignedTo ? (
                    <>
                      <div className="border-t border-civic-border pt-2 mt-2">
                        <span className="text-sm text-civic-text-secondary block mb-1">Assigned Officer:</span>
                        <span className="text-sm font-medium text-civic-text-primary block">
                          {complaint.assignedTo.name}
                        </span>
                        <span className="text-xs text-civic-text-secondary block">
                          {complaint.assignedTo.email}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-civic-border pt-2 mt-2">
                      <span className="text-sm text-civic-text-secondary">Not assigned to any officer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Timeline
                </h4>
                <div className="bg-civic-bg/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Submitted:</span>
                    <span className="text-sm text-civic-text-primary">{formatDate(complaint.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-civic-text-secondary">Last Updated:</span>
                    <span className="text-sm text-civic-text-primary">{formatDate(complaint.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Status History
                </h4>
                <div className="bg-civic-bg/50 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin">
                  {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {complaint.statusHistory.map((history, index) => (
                        <div key={index} className="relative pl-4 pb-3 border-l-2 border-civic-border last:pb-0 last:border-0">
                          <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-civic-blue border-2 border-white shadow-sm -translate-x-[5px]" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-civic-text-primary">
                                {formatStatus(history.status)}
                              </span>
                              <span className="text-xs text-civic-text-secondary">•</span>
                              <span className="text-xs text-civic-text-secondary">{formatDate(history.timestamp)}</span>
                            </div>
                            {history.note && (
                              <p className="text-xs text-civic-text-secondary">{history.note}</p>
                            )}
                            {history.changedBy && (
                              <p className="text-xs text-civic-text-secondary">
                                by {history.changedBy.name || 'System'}
                              </p>
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

              {/* Remarks */}
              {complaint.remarks && complaint.remarks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-civic-text-primary mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Remarks ({complaint.remarks.length})
                  </h4>
                  <div className="bg-civic-bg/50 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin space-y-2">
                    {complaint.remarks.map((remark, index) => (
                      <div key={index} className="bg-white rounded p-2 border border-civic-border">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={12} className="text-civic-text-secondary" />
                          <span className="text-xs font-medium text-civic-text-primary">
                            {remark.user?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-civic-text-secondary">•</span>
                          <span className="text-xs text-civic-text-secondary">{formatDate(remark.timestamp)}</span>
                        </div>
                        <p className="text-xs text-civic-text-secondary">{remark.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
