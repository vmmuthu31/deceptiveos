import { NextResponse } from 'next/server';
import { getCorrelatedAttackCampaigns } from '@/server/services/attack-graph.service';

export async function GET() {
  try {
    const campaigns = await getCorrelatedAttackCampaigns();
    return NextResponse.json({
      campaigns,
      count: campaigns.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate attack graph' },
      { status: 500 },
    );
  }
}
