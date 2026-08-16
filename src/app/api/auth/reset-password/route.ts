import { resetUserPassword } from '@/server/security/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(5),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.parse(body);

    await resetUserPassword(parsed.token, parsed.newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 400 }
    );
  }
}
