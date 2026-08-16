import { createPasswordResetToken } from '@/server/security/auth';
import { sendPasswordResetEmail } from '@/server/services/email.service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.parse(body);

    const token = await createPasswordResetToken(parsed.email);
    await sendPasswordResetEmail(parsed.email, token);

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent! Check your email inbox.',
      token, // Returned for dev testing convenience
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset' },
      { status: 400 }
    );
  }
}
