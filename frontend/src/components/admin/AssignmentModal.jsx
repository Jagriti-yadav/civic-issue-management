import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import { complaintService } from '@/services/complaintService';
import { Building2, User, AlertCircle } from 'lucide-react';

export function AssignmentModal({ isOpen, onClose, complaint, onAssignSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      // Pre-select the complaint's department if available
      if (complaint?.department) {
        setSelectedDepartment(complaint.department);
      }
    }
  }, [isOpen, complaint]);

  useEffect(() => {
    if (selectedDepartment) {
      loadOfficers(selectedDepartment);
    } else {
      setOfficers([]);
      setSelectedOfficer('');
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDepartments();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError(err.message || 'Failed to load departments');
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async (department) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getOfficersByDepartment(department);
      setOfficers(data.officers || []);
      setSelectedOfficer('');
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
    setSelectedDepartment('');
    setSelectedOfficer('');
    setOfficers([]);
    setError(null);
    onClose();
  };

  const complaintDepartment = complaint?.department || 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Complaint"
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
            Assign Officer
          </Button>
        </div>
      }
    >
      {loading && !departments.length ? (
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
            onClick={loadDepartments}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Complaint Info */}
          <div className="bg-civic-bg/50 rounded-lg p-4">
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
            </div>
          </div>

          {/* Department Selection */}
          <div>
            <Select
              label="Select Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              placeholder="Choose a department"
              required
              options={departments.map(dept => ({
                value: dept,
                label: dept
              }))}
            />
            <p className="mt-1.5 text-xs text-civic-text-secondary">
              Only officers from this department will be shown
            </p>
          </div>

          {/* Officer Selection */}
          {selectedDepartment && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : officers.length === 0 ? (
                <div className="text-center py-4 bg-civic-bg/50 rounded-lg">
                  <User size={32} className="mx-auto text-civic-text-secondary mb-2" />
                  <p className="text-sm text-civic-text-secondary">
                    No active officers found in {selectedDepartment}
                  </p>
                </div>
              ) : (
                <Select
                  label="Select Officer"
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  placeholder="Choose an officer"
                  required
                  options={officers.map(officer => ({
                    value: officer._id,
                    label: `${officer.name} (${officer.email})`
                  }))}
                />
              )}
            </div>
          )}

          {/* Warning if no department selected */}
          {!selectedDepartment && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please select a department to view available officers
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
