import { getAnonymizedThreatGraph } from '@/server/services/network.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const nodes = await getAnonymizedThreatGraph();
  return NextResponse.json({ success: true, nodes });
}
