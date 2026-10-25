import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { complaintService } from '@/services/complaintService';
import { Building2, User, AlertCircle, FileText } from 'lucide-react';

export function DepartmentHeadAssignmentModal({ isOpen, onClose, complaint, onAssignSuccess }) {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOfficers();
      // Pre-select the currently assigned officer if any
      if (complaint?.assignedTo?._id) {
        setSelectedOfficer(complaint.assignedTo._id);
      }
    }
  }, [isOpen, complaint]);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDepartmentOfficersWithWorkload({});
      setOfficers(data.officers || []);
    } catch (err) {
      console.error('Failed to load officers:', err);
      setError(err.message || 'Failed to load officers');
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) {
      toast.error('Please select an officer');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      const data = await complaintService.assignComplaint(complaint._id, selectedOfficer);
      
      toast.success('Complaint assigned successfully');
      onAssignSuccess?.(data.complaint);
      handleClose();
    } catch (err) {
      console.error('Failed to assign complaint:', err);
      setError(err.message || 'Failed to assign complaint');
      toast.error(err.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedOfficer('');
    setOfficers([]);
    setError(null);
    onClose();
  };

  const complaintDepartment = complaint?.department || user?.department || 'Not specified';
  const isReassignment = complaint?.assignedTo && selectedOfficer !== complaint.assignedTo._id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isReassignment ? 'Reassign Complaint' : 'Assign Complaint'}
      size="md"
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            loading={assigning}
            disabled={!selectedOfficer || loading}
          >
            {isReassignment ? 'Reassign' : 'Assign'}
          </Button>
        </div>
      }
    >
      {loading && !officers.length ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <AlertCircle size={40} className="mx-auto text-status-rejected mb-3" />
          <p className="text-civic-text-secondary mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOfficers}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Complaint Info */}
          <div className="bg-civic-bg/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-civic-blue mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-civic-text-primary mb-2">
                  {complaint?.title || 'Untitled Complaint'}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-civic-text-secondary" />
                    <span className="text-civic-text-secondary">Department:</span>
                    <span className="font-medium text-civic-text-primary">{complaintDepartment}</span>
                  </div>
                  {complaint?.complaintId && (
                    <div className="text-civic-text-secondary">
                      ID: <span className="font-mono">{complaint.complaintId}</span>
                    </div>
                  )}
                  {complaint?.assignedTo && (
                    <div className="text-civic-text-secondary">
                      Currently assigned to: <span className="font-medium text-civic-text-primary">{complaint.assignedTo.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Officer Selection */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : officers.length === 0 ? (
              <div className="text-center py-4 bg-civic-bg/50 rounded-lg">
                <User size={32} className="mx-auto text-civic-text-secondary mb-2" />
                <p className="text-sm text-civic-text-secondary">
                  No active officers found in your department
                </p>
              </div>
            ) : (
              <div>
                <Select
                  label="Select Officer"
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  placeholder="Choose an officer"
                  required
                  options={officers.map(officer => ({
                    value: officer._id,
                    label: `${officer.name} (${officer.email}) - ${officer.workload?.total || 0} complaints`
                  }))}
                />
                <p className="mt-1.5 text-xs text-civic-text-secondary">
                  Showing only active officers from your department with current workload
                </p>
              </div>
            )}
          </div>

          {/* Reassignment warning */}
          {isReassignment && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This will reassign the complaint from {complaint.assignedTo.name} to the selected officer.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
