import { createHoneypot, getAllHoneypots, toggleHoneypotStatus } from '@/server/services/honeypot.service';
import { CreateHoneypotSchema } from '@/shared/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getAllHoneypots();
  return NextResponse.json({ success: true, honeypots: data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = CreateHoneypotSchema.parse(body);
    const newHoneypot = await createHoneypot(validated);
    return NextResponse.json({ success: true, honeypot: newHoneypot }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = (await req.json()) as { id: string };
    const updated = await toggleHoneypotStatus(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Honeypot not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, honeypot: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
