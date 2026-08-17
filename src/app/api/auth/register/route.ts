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


    const emailSent = await sendRegistrationOTPEmail(email, otpCode);
    console.log(`[REGISTER OTP DISPATCH]: Email to ${email} | Sent: ${emailSent} | OTP: ${otpCode}`);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email,
      emailSent,
      otpCode,
    });
  } catch (error: any) {
    console.error('[REGISTER API ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
