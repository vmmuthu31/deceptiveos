'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import {
  RiAlertLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiShieldCrossLine
} from 'react-icons/ri';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token. Please request a new password reset email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json() as { success: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Set New Password</h2>
        <p className="text-xs text-slate-500 mt-1">Specify your new password to regain access to your account.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <RiAlertLine className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 font-bold text-sm">
            <RiCheckDoubleLine className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Password updated! Redirecting to Sign In...</span>
          </div>
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full py-2.5 rounded-xl font-semibold text-xs">
              Go to Sign In Now →
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <RiLockPasswordLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <RiLockPasswordLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
              >
                {showConfirmPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>

            {confirmPassword && (
              <div className="mt-1 text-[10px] font-mono flex items-center gap-1">
                {passwordsMatch ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                    <RiCheckLine className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold">Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || (confirmPassword.length > 0 && !passwordsMatch)}
            variant="primary"
            className="w-full py-2.5 rounded-xl font-semibold text-xs shadow-md mt-2"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            <RiArrowRightLine className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Back to{' '}
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md border border-indigo-400/40">
            <RiShieldCrossLine className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            CIPHER<span className="text-indigo-600">NEST</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-tight">ADVERSARIAL AI DEFENSE ENGINE</p>
        </div>

        <Suspense fallback={<div className="text-xs text-slate-400 text-center">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
