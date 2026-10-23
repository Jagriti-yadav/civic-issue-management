import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Lock, Phone, Building2, Users } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(user?.id);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setErrors({});
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateProfile = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errs.phone = 'Please provide a valid phone number with country code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) errs.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errs.newPassword = 'New password is required';
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setSaving(true);
    try {
      const data = await userService.updateUser(user?.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      // Update local user state
      setUser({
        ...user,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      });

      // Update localStorage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      }));

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      await userService.changePassword(user?.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRole = (role) => {
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Profile"
          description="Manage your department head account settings"
          icon={User}
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
          title="Profile"
          description="Manage your department head account settings"
          icon={User}
        />
        <ErrorState
          message={error}
          onRetry={loadUserProfile}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your department head account settings"
        icon={User}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-civic-text-primary">Basic Information</h3>
              {!isEditing ? (
                <Button size="sm" variant="outline" leftIcon={<Edit2 size={16} />} onClick={handleEdit}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" leftIcon={<X size={16} />} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" leftIcon={<Save size={16} />} onClick={handleSaveProfile} loading={saving}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-civic-text-secondary mb-1">Name</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    error={errors.name}
                    placeholder="Your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-civic-text-secondary" />
                    <span className="text-civic-text-primary">{user?.name || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-civic-text-secondary mb-1">Email</label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    error={errors.email}
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-civic-text-secondary" />
                    <span className="text-civic-text-primary">{user?.email || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-civic-text-secondary mb-1">Phone Number</label>
                {isEditing ? (
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    error={errors.phone}
                    placeholder="+1234567890"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-civic-text-secondary" />
                    <span className="text-civic-text-primary">{user?.phone || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-civic-text-primary">Change Password</h3>
              {!showPasswordForm && (
                <Button size="sm" variant="outline" leftIcon={<Lock size={16} />} onClick={() => setShowPasswordForm(true)}>
                  Change Password
                </Button>
              )}
            </div>

            {showPasswordForm ? (
              <div className="space-y-4">
                <Input
                  name="currentPassword"
                  type="password"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={errors.currentPassword}
                  placeholder="Enter your current password"
                />
                <Input
                  name="newPassword"
                  type="password"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                  placeholder="Enter your new password"
                />
                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your new password"
                />
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleChangePassword} loading={saving}>
                    Update Password
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-civic-text-secondary">
                Click "Change Password" to update your password. We recommend using a strong password with at least 6 characters.
              </p>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-6">
          <div className="card-base p-6">
            <h3 className="text-lg font-semibold text-civic-text-primary mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Role</p>
                  <p className="text-sm text-civic-text-secondary">{formatRole(user?.role || 'department_head')}</p>
                </div>
              </div>

              {user?.department && (
                <div className="flex items-start gap-3">
                  <Building2 size={18} className="text-civic-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-civic-text-primary">Department</p>
                    <p className="text-sm text-civic-text-secondary">{user.department}</p>
                  </div>
                </div>
              )}

              {user?.designation && (
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-civic-text-secondary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-civic-text-primary">Designation</p>
                    <p className="text-sm text-civic-text-secondary">{user.designation}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Member Since</p>
                  <p className="text-sm text-civic-text-secondary">{formatDate(user?.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={18} className="text-civic-text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-civic-text-primary">Account Status</p>
                  <p className="text-sm text-civic-text-secondary">
                    {user?.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-base p-6 bg-civic-hover">
            <h3 className="text-lg font-semibold text-civic-text-primary mb-2">Department Head</h3>
            <p className="text-sm text-civic-text-secondary mb-4">
              As a Department Head, you can manage complaints and officers within your department.
            </p>
            <div className="flex items-start gap-2 text-xs text-civic-text-secondary">
              <Building2 size={14} className="mt-0.5" />
              <span>SmartCivic Issue Management System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
