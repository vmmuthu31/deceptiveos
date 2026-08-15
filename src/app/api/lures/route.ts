import { createLureDocument, getAllLures } from '@/server/services/lure.service';
import { GenerateLureSchema } from '@/shared/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const lures = await getAllLures();
  return NextResponse.json({ success: true, lures });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = GenerateLureSchema.parse(body);
    const result = await createLureDocument(validated);
    return NextResponse.json({ success: true, lure: result.lure, content: result.documentContent }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
