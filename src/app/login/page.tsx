'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { RiAlertLine, RiArrowRightLine, RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiMailLine } from 'react-icons/ri';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('mvairamuthu2003@ciphernest.ai');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { success: boolean; error?: string };

      if (res.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
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

        {/* Login Card */}
        <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access security telemetry and decoy fleet.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <RiAlertLine className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <RiLockPasswordLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-2.5 rounded-xl font-semibold text-xs shadow-md mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CipherNest'}</span>
              <RiArrowRightLine className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
              Create User Account
            </Link>
          </div>
        </Card>

        <p className="text-[11px] text-slate-400 text-center font-mono">
          Protected by SHA-256 Cryptographic Audit Ledger & OpenCode AI
        </p>
      </div>
    </div>
  );
}
