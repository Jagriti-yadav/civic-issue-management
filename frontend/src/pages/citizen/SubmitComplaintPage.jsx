import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { FileUpload } from '@/components/common/FileUpload';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { complaintService } from '@/services/complaintService';
import { FileText, MapPin, Upload, Send } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'roads', label: 'Roads & Infrastructure' },
  { value: 'water', label: 'Water Supply' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'sanitation', label: 'Sanitation & Waste' },
  { value: 'public_safety', label: 'Public Safety' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function SubmitComplaintPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: {
      address: '',
      landmark: ''
    },
    images: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setForm({
        ...form,
        location: { ...form.location, [locationField]: value }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleImageUpload = (files) => {
    setForm({ ...form, images: files });
  };

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.description) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';
    if (form.title.length < 5) errs.title = 'Title must be at least 5 characters';
    if (form.description.length < 20) errs.description = 'Description must be at least 20 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const complaintData = {
        ...form,
        submittedBy: user?.id
      };
      const response = await complaintService.createComplaint(complaintData);
      toast.success(`Complaint submitted successfully! ID: ${response.complaint.complaintId}`);
      navigate('/citizen/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Submit a Complaint"
        description="Report a civic issue in your community"
        icon={FileText}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="card-base p-6 space-y-6">
          <Input
            label="Complaint Title"
            name="title"
            placeholder="Brief description of the issue (e.g., Pothole on Main Street)"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <Textarea
            label="Detailed Description"
            name="description"
            placeholder="Provide detailed information about the issue, including when it started and its impact"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              error={errors.category}
              required
            />

            <Select
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              options={PRIORITY_OPTIONS}
              hint="Select the urgency level of this issue"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-civic-text-primary flex items-center gap-2">
              <MapPin size={16} />
              Location Information
            </h3>
            
            <Input
              label="Address"
              name="location.address"
              placeholder="Enter the exact address"
              value={form.location.address}
              onChange={handleChange}
            />

            <Input
              label="Landmark (Optional)"
              name="location.landmark"
              placeholder="Nearby landmark for easier identification"
              value={form.location.landmark}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-civic-text-primary flex items-center gap-2">
              <Upload size={16} />
              Evidence (Optional)
            </h3>
            
            <FileUpload
              files={form.images}
              onFilesChange={handleImageUpload}
              maxFiles={5}
              accept="image/jpeg,image/png"
              hint="Upload photos of the issue (max 5 images)"
            />
          </div>

          <div className="pt-4 border-t border-civic-border">
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={loading}
              rightIcon={!loading && <Send size={18} />}
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}