import { verifyAuditChain } from '@/server/db/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = verifyAuditChain();
  return NextResponse.json({ success: true, ...result });
}
