import { getDigitalTwinMetadata } from '@/server/services/honeypot.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const metadata = await getDigitalTwinMetadata();
  return NextResponse.json({ success: true, metadata });
}
