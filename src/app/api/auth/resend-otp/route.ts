import { resendUserOtp } from '@/server/security/auth';
import { sendRegistrationOTPEmail } from '@/server/services/email.service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ResendOtpSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResendOtpSchema.parse(body);

    const newOtpCode = await resendUserOtp(parsed.email);
    const emailSent = await sendRegistrationOTPEmail(parsed.email, newOtpCode);
    console.log(`[RESEND OTP DISPATCH]: Email to ${parsed.email} | Sent: ${emailSent} | OTP: ${newOtpCode}`);

    return NextResponse.json({
      success: true,
      emailSent,
      message: 'A new OTP verification code has been sent to your email.',
      otpCode: newOtpCode,
    });
  } catch (error: any) {
    console.error('[RESEND OTP API ERROR]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend OTP code' },
      { status: 400 }
    );
  }
}
