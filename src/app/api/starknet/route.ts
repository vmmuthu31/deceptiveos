import { getStarknetDeceptionStatus } from '@/server/services/starknet.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const status = await getStarknetDeceptionStatus();
  return NextResponse.json({ success: true, status });
}
