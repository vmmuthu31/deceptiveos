'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
  RiAlertLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiMailCheckLine,
  RiRefreshLine,
  RiShieldLine
} from 'react-icons/ri';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccessMsg('Email verified successfully! Redirecting to Dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Please check your code.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccessMsg('New verification code sent to your email.');
        setResendCooldown(60);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="shadow-2xl border-[#172338] bg-[#0C1322] p-6 sm:p-8 rounded-2xl">
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3">
          <RiMailCheckLine className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-white">Verify Operator Email</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter the 6-digit cryptographic verification token sent to{' '}
          <strong className="text-purple-300 font-mono">{email || 'your email'}</strong>.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
          <RiAlertLine className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <RiCheckDoubleLine className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">6-Digit Verification Token</label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-mono font-bold bg-[#070B14] border border-[#1E2D4A] rounded-xl text-white focus:bg-[#090F1C] focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                required
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || digits.join('').length < 6}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{loading ? 'Verifying...' : 'Verify Email & Enter Dashboard'}</span>
          <RiArrowRightLine className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#172338] flex items-center justify-between text-xs">
        <span className="text-slate-400">Didn&apos;t receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="text-purple-400 font-semibold hover:text-purple-300 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <RiRefreshLine className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
        </button>
      </div>
    </Card>
  );
}

export default function VerifyOtpPage() {
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

        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading verification...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}
