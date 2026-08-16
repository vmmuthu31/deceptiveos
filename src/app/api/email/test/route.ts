import { sendTestAlertEmail } from '@/server/services/email.service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const TestEmailSchema = z.object({
  recipient: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = TestEmailSchema.parse(body);

    const result = await sendTestAlertEmail(parsed.recipient);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid email request' },
      { status: 400 }
    );
  }
}
