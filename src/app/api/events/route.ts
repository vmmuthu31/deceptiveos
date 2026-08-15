import { addSessionEvent, getAllEvents } from '@/server/services/fingerprint.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const events = await getAllEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newEvent = await addSessionEvent(body);
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
