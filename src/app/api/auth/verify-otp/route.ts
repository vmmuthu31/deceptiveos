import { verifyUserOtp } from '@/server/security/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().min(6).max(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.parse(body);

    const { user, token } = await verifyUserOtp(parsed);

    const cookieStore = await cookies();
    cookieStore.set('cipher_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'OTP verification failed' },
      { status: 400 }
    );
  }
}
