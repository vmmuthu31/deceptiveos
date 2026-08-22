import { claimGhostBounty, fundGhostBounty, getAllGhostBounties } from '@/server/services/bounty.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const bounties = await getAllGhostBounties();
  return NextResponse.json({ success: true, bounties });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bounty = await fundGhostBounty(body);
    return NextResponse.json({ success: true, bounty }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { bountyId, intelligenceReport, researcherAddress } = await req.json();
    const updated = await claimGhostBounty(bountyId, intelligenceReport, researcherAddress);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Bounty not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bounty: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
