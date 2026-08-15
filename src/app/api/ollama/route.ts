import { checkOllamaHealth, generateHoneypotSSHResponse } from '@/server/services/ai.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = await checkOllamaHealth();
  return NextResponse.json({ success: true, health });
}

export async function POST(req: Request) {
  try {
    const { command, history } = (await req.json()) as { command: string; history?: string[] };
    const response = await generateHoneypotSSHResponse(command, history || []);
    return NextResponse.json({ success: true, ...response });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process command' }, { status: 400 });
  }
}
