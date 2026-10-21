import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Registration successful! Welcome to Smart Civic.');
      navigate('/citizen/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Smart Civic to report and track civic issues in your community"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full name"
          name="name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<User size={18} />}
          required
          autoComplete="name"
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={18} />}
          required
          autoComplete="email"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-civic-text-secondary hover:text-civic-text-primary pointer-events-auto"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            leftIcon={<Lock size={18} />}
            required
            autoComplete="new-password"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-civic-text-secondary cursor-pointer">
          <input type="checkbox" required className="mt-0.5 rounded border-civic-border text-civic-blue focus:ring-civic-blue" />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={!loading && <ArrowRight size={18} />}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-civic-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-civic-blue hover:text-civic-blue-hover transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
