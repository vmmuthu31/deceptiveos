'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  RiAlertLine,
  RiArrowRightLine,
  RiBuilding4Line,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockPasswordLine,
  RiMailLine,
  RiShieldLine,
  RiUser3Line
} from 'react-icons/ri';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('Cyber Deception Ops');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organization, password }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (res.ok && data.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || 'Registration failed');
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
            <h2 className="text-lg font-bold text-white">Create Operator Account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Initialize local deception node credentials for security telemetry.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
              <RiAlertLine className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <RiUser3Line className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <RiMailLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@defense.internal"
                  className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
              <div className="relative">
                <RiBuilding4Line className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Security Operations"
                  className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <RiLockPasswordLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
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
              {password && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className={`h-1 flex-1 rounded-full ${strength.color}`} />
                  <span className="text-[10px] text-slate-400 font-mono">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <RiLockPasswordLine className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-500 focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 mt-3"
            >
              <span>{loading ? 'Registering Node...' : 'Register Operator Node'}</span>
              <RiArrowRightLine className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#172338] text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
