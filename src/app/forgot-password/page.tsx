'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import React, { useState } from 'react';
import { RiAlertLine, RiArrowLeftLine, RiArrowRightLine, RiCheckDoubleLine, RiMailLine } from 'react-icons/ri';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json() as { success: boolean; error?: string; token?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        if (data.token) {
          setDevResetUrl(`/reset-password?token=${data.token}`);
        }
      } else {
        setError(data.error || 'Failed to send password reset link');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="CipherNest Logo"
            className="w-16 h-16 object-contain mx-auto animate-float animate-pulse-glow drop-shadow-xl hover:scale-105 transition-transform cursor-pointer"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
            CIPHER<span className="text-indigo-600">NEST</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-tight">ADVERSARIAL AI DEFENSE ENGINE</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Reset Your Password</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your work email address to receive a secure password reset link.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <RiAlertLine className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <RiCheckDoubleLine className="w-5 h-5 text-emerald-600" />
                  <span>Password Reset Email Sent!</span>
                </div>
                <p>Check your email inbox for instructions to reset your password. The link is valid for 1 hour.</p>
              </div>

              {devResetUrl && (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Dev Shortcut Link:</span>
                  <Link href={devResetUrl} className="text-indigo-600 font-bold underline break-all">
                    Click here to open Reset Password page →
                  </Link>
                </div>
              )}

              <Link href="/login" className="block">
                <Button variant="secondary" className="w-full py-2.5 rounded-xl font-semibold text-xs">
                  <RiArrowLeftLine className="w-4 h-4 mr-1" />
                  <span>Return to Sign In</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email Address</label>
                <div className="relative">
                  <RiMailLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-2.5 rounded-xl font-semibold text-xs shadow-md mt-2"
              >
                <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                <RiArrowRightLine className="w-4 h-4 ml-1" />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
