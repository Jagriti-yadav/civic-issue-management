import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { useToast } from '@/context/ToastContext';
import { complaintService } from '@/services/complaintService';
import { AlertTriangle, Clock, CheckCircle2, XCircle, Zap, ArrowRight } from 'lucide-react';

export function StatusPriorityModal({ isOpen, onClose, complaint, onUpdateSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [updateType, setUpdateType] = useState('status'); // 'status' or 'priority'
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [note, setNote] = useState('');

  // Valid status transitions
  const VALID_TRANSITIONS = {
    pending: ['assigned', 'rejected'],
    assigned: ['in_progress', 'rejected'],
    in_progress: ['resolved', 'rejected'],
    resolved: [],
    rejected: []
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  useEffect(() => {
    if (isOpen && complaint) {
      setSelectedStatus(complaint.status || '');
      setSelectedPriority(complaint.priority || '');
      setNote('');
      setUpdateType('status');
    }
  }, [isOpen, complaint]);

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const formatPriority = (priority) => {
    if (!priority) return 'N/A';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getAllowedTransitions = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
  };

  const handleUpdate = async () => {
    if (updateType === 'status') {
      await handleStatusUpdate();
    } else {
      await handlePriorityUpdate();
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    // Validate transition
    const currentStatus = complaint?.status;
    const allowedTransitions = getAllowedTransitions(currentStatus);

    if (currentStatus === selectedStatus) {
      toast.error('Please select a different status');
      return;
    }

    if (allowedTransitions.length > 0 && !allowedTransitions.includes(selectedStatus)) {
      toast.error(`Cannot transition from ${formatStatus(currentStatus)} to ${formatStatus(selectedStatus)}`);
      return;
    }

    try {
      setLoading(true);
      const data = await complaintService.updateComplaintStatus(
        complaint._id || complaint.id,
        selectedStatus,
        note
      );

      toast.success('Status updated successfully');
      onUpdateSuccess?.(data.complaint);
      handleClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityUpdate = async () => {
    if (!selectedPriority) {
      toast.error('Please select a priority');
      return;
    }

    if (complaint?.priority === selectedPriority) {
      toast.error('Please select a different priority');
      return;
    }

    try {
      setLoading(true);
      const data = await complaintService.updateComplaintPriority(
        complaint._id || complaint.id,
        selectedPriority,
        note
      );

      toast.success('Priority updated successfully');
      onUpdateSuccess?.(data.complaint);
      handleClose();
    } catch (err) {
      console.error('Failed to update priority:', err);
      toast.error(err.message || 'Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus('');
    setSelectedPriority('');
    setNote('');
    setUpdateType('status');
    onClose();
  };

  const currentStatus = complaint?.status;
  const currentPriority = complaint?.priority;
  const allowedTransitions = getAllowedTransitions(currentStatus);
  const filteredStatusOptions = statusOptions.filter(opt => 
    allowedTransitions.includes(opt.value) || opt.value === currentStatus
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Complaint"
      size="md"
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            loading={loading}
            disabled={
              (updateType === 'status' && (!selectedStatus || selectedStatus === currentStatus)) ||
              (updateType === 'priority' && (!selectedPriority || selectedPriority === currentPriority))
            }
          >
            Update
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Complaint Info */}
        <div className="bg-civic-bg/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-civic-text-primary mb-2">
            {complaint?.title || 'Untitled Complaint'}
          </h4>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-civic-text-secondary">Status:</span>
              <StatusBadge status={formatStatus(currentStatus)} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-civic-text-secondary">Priority:</span>
              <PriorityBadge priority={formatPriority(currentPriority)} size="sm" />
            </div>
          </div>
        </div>

        {/* Update Type Selection */}
        <div>
          <label className="block text-sm font-medium text-civic-text-primary mb-2">
            What would you like to update?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUpdateType('status')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                updateType === 'status'
                  ? 'bg-civic-blue text-white'
                  : 'bg-civic-bg/50 text-civic-text-secondary hover:bg-civic-hover'
              }`}
            >
              <Clock size={16} className="inline mr-1" />
              Status
            </button>
            <button
              type="button"
              onClick={() => setUpdateType('priority')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                updateType === 'priority'
                  ? 'bg-civic-blue text-white'
                  : 'bg-civic-bg/50 text-civic-text-secondary hover:bg-civic-hover'
              }`}
            >
              <AlertTriangle size={16} className="inline mr-1" />
              Priority
            </button>
          </div>
        </div>

        {/* Status Update */}
        {updateType === 'status' && (
          <div>
            <Select
              label="Select New Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Choose a status"
              required
              options={filteredStatusOptions}
            />
            {allowedTransitions.length > 0 && allowedTransitions.length < statusOptions.length && (
              <p className="mt-1.5 text-xs text-civic-text-secondary">
                Allowed transitions from {formatStatus(currentStatus)}: {allowedTransitions.map(formatStatus).join(', ')}
              </p>
            )}
            {allowedTransitions.length === 0 && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  This complaint cannot be transitioned from {formatStatus(currentStatus)}. Only priority can be updated.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Priority Update */}
        {updateType === 'priority' && (
          <div>
            <Select
              label="Select New Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              placeholder="Choose a priority"
              required
              options={priorityOptions}
            />
          </div>
        )}

        {/* Note/Reason */}
        <div>
          <Textarea
            label="Note (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note explaining this change..."
            rows={3}
          />
        </div>

        {/* Transition Info */}
        {updateType === 'status' && selectedStatus && selectedStatus !== currentStatus && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <ArrowRight size={16} className="text-civic-blue" />
            <span className="text-sm text-blue-800">
              {formatStatus(currentStatus)} → {formatStatus(selectedStatus)}
            </span>
          </div>
        )}

        {updateType === 'priority' && selectedPriority && selectedPriority !== currentPriority && (
          <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <ArrowRight size={16} className="text-civic-teal" />
            <span className="text-sm text-teal-800">
              {formatPriority(currentPriority)} → {formatPriority(selectedPriority)}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
