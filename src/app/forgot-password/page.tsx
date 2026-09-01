'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import React, { useState } from 'react';
import { RiAlertLine, RiArrowLeftLine, RiArrowRightLine, RiCheckDoubleLine, RiMailLine, RiShieldLine } from 'react-icons/ri';

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

      const data = (await res.json()) as { success: boolean; error?: string; token?: string };

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

        {/* Card */}
        <Card className="shadow-2xl border-[#172338] bg-[#0C1322] p-6 sm:p-8 rounded-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Reset Your Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your work email address to receive a secure password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
              <RiAlertLine className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <RiCheckDoubleLine className="w-5 h-5 text-emerald-400" />
                  <span>Password Reset Email Sent!</span>
                </div>
                <p>Check your email inbox for instructions to reset your password. The link is valid for 1 hour.</p>
              </div>

              {devResetUrl && (
                <div className="p-3 rounded-xl bg-[#070B14] border border-[#172338] text-xs font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Dev Shortcut Link:</span>
                  <Link href={devResetUrl} className="text-purple-400 font-bold underline break-all hover:text-purple-300">
                    Click here to open Reset Password page →
                  </Link>
                </div>
              )}

              <Link href="/login" className="block">
                <Button variant="secondary" className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-[#141E33] border border-[#1E2D4A] hover:bg-[#1C2B47]">
                  <RiArrowLeftLine className="w-4 h-4 mr-1" />
                  <span>Return to Sign In</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <RiMailLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Instructions...' : 'Send Reset Link'}</span>
                <RiArrowRightLine className="w-4 h-4" />
              </Button>

              <div className="pt-2 text-center">
                <Link href="/login" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
                  <RiArrowLeftLine className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
