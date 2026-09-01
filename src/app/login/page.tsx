'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { RiAlertLine, RiArrowRightLine, RiEyeLine, RiEyeOffLine, RiLockPasswordLine, RiMailLine, RiShieldLine } from 'react-icons/ri';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      const data = (await res.json()) as { success: boolean; error?: string };

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

        {/* Auth Card */}
        <Card className="shadow-2xl border-[#172338] bg-[#0C1322] p-6 sm:p-8 rounded-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access security telemetry and decoy fleet.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
              <RiAlertLine className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
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
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CipherNest'}</span>
              <RiArrowRightLine className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#172338] text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Create User Account
            </Link>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] font-mono text-slate-500">
          Protected by SHA-256 Cryptographic Audit Ledger & OpenCode AI
        </div>
      </div>
    </div>
  );
}
