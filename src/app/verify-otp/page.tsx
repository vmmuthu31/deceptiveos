'use client';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
  RiAlertLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiMailCheckLine,
  RiRefreshLine
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

  // Cooldown timer for Resend OTP
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

    // Auto-advance to next input
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

      const data = await res.json() as { success: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccessMsg('Email verified successfully! Redirecting to Dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Invalid or expired OTP verification code.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json() as { success: boolean; error?: string; message?: string };

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'A new verification code has been sent to your email.');
        setResendCooldown(60);
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/80 p-6 sm:p-8">
      <div className="mb-6 text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
          <RiMailCheckLine className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Check Your Email</h2>
        <p className="text-xs text-slate-500">
          We sent a 6-digit verification code to <strong className="text-slate-900 font-mono">{email || 'your email'}</strong>.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
          <RiAlertLine className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold font-mono">
          <RiCheckDoubleLine className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 text-center mb-3">
            Enter 6-Digit Verification Code
          </label>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || digits.join('').length < 6}
          variant="primary"
          className="w-full py-2.5 rounded-xl font-semibold text-xs shadow-md"
        >
          <span>{loading ? 'Verifying Code...' : 'Verify & Continue to Dashboard'}</span>
          <RiArrowRightLine className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Didn't receive the email?</span>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0 || resending}
          className="text-indigo-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
        >
          <RiRefreshLine className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold font-mono">
          ← Back to Sign In
        </Link>
      </div>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
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

        <Suspense fallback={<div className="text-xs text-slate-400 text-center">Loading verification form...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </div>
  );
}
