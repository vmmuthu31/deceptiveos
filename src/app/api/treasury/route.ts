import { executeTreasuryTransaction, getPrivateTreasuryState } from '@/server/services/treasury.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const treasury = await getPrivateTreasuryState();
  return NextResponse.json({ success: true, treasury });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await executeTreasuryTransaction(body);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
