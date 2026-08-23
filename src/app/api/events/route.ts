import { addSessionEvent, getAllEvents } from '@/server/services/fingerprint.service';
import { SessionEventSchema } from '@/shared/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const events = await getAllEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SessionEventSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ success: false, error: errors }, { status: 400 });
    }
    const newEvent = await addSessionEvent(parsed.data);
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
