import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Login successful!');

      // Redirect based on user role from the login response
      const user = data.user;
      if (user?.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (user?.role === 'officer') {
        navigate('/officer/dashboard');
      } else if (user?.role === 'department_head') {
        navigate('/department-head/dashboard');
      } else if (user?.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Smart Civic account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
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
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-civic-text-secondary cursor-pointer">
            <input type="checkbox" className="rounded border-civic-border text-civic-blue focus:ring-civic-blue" />
            Remember me
          </label>
          <button type="button" className="text-sm font-medium text-civic-blue hover:text-civic-blue-hover transition-colors">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={!loading && <ArrowRight size={18} />}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-civic-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-civic-blue hover:text-civic-blue-hover transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
