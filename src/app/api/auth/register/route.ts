import { registerPendingUserAccount } from '@/server/security/auth';
import { sendRegistrationOTPEmail } from '@/server/services/email.service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  organization: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    const { email, otpCode } = await registerPendingUserAccount(parsed);

    // Dispatch OTP verification email
    await sendRegistrationOTPEmail(email, otpCode);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email,
      otpCode, // Returned for dev testing convenience
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
