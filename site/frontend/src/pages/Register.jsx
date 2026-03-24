import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AuthCard from '@/components/AuthCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/register', data);
      const { token, apiKey, email } = res.data;
      login(token, apiKey, email);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.error) {
        setServerError(err.response.data.error);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <AuthCard
      title="Create an Account"
      subtitle="Start tracking your UTM conversions in minutes."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{serverError}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--text-primary)]">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            disabled={isSubmitting}
            className="bg-[var(--bg-base)] border-[var(--bg-border)] focus:border-[var(--accent-indigo)] focus-visible:ring-1 focus-visible:ring-[var(--accent-indigo)]"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--text-primary)]">Password</Label>
          <Input
            id="password"
            type="password"
            disabled={isSubmitting}
            className="bg-[var(--bg-base)] border-[var(--bg-border)] focus:border-[var(--accent-indigo)] focus-visible:ring-1 focus-visible:ring-[var(--accent-indigo)]"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[var(--accent-indigo)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Register
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[var(--accent-indigo)] hover:text-[var(--text-primary)] transition-colors"
        >
          Log in
        </Link>
      </div>
    </AuthCard>
  );
}
