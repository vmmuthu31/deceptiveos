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
  RiShieldLine
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

      const data = (await res.json()) as { success: boolean; error?: string };

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
    <Card className="shadow-2xl border-[#172338] bg-[#0C1322] p-6 sm:p-8 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Set New Password</h2>
        <p className="text-xs text-slate-400 mt-1">Specify your new password to regain access to your account.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
          <RiAlertLine className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 font-bold text-sm">
            <RiCheckDoubleLine className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Password updated! Redirecting to Sign In...</span>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs">
              Go to Sign In Now →
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <RiLockPasswordLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <RiLockPasswordLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                {showConfirmPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMatch && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-mono">
                <RiCheckLine className="w-3.5 h-3.5" /> Passwords match
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            <RiArrowRightLine className="w-4 h-4" />
          </Button>

          <div className="pt-2 text-center">
            <Link href="/login" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Cancel and Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 font-sans antialiased text-slate-100 selection:bg-purple-600 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mx-auto mb-3 border border-purple-400/30">
            <RiShieldLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
            CIPHER<span className="text-purple-400">NEST</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider">ADVERSARIAL AI DEFENSE ENGINE</p>
        </div>

        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
