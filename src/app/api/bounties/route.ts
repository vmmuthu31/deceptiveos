import { claimGhostBounty, fundGhostBounty, getAllGhostBounties } from '@/server/services/bounty.service';
import { FundBountySchema, ClaimBountySchema } from '@/shared/schemas';
import { NextResponse } from 'next/server';

export async function GET() {
  const bounties = await getAllGhostBounties();
  return NextResponse.json({ success: true, bounties });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = FundBountySchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ success: false, error: errors }, { status: 400 });
    }
    const bounty = await fundGhostBounty(parsed.data);
    return NextResponse.json({ success: true, bounty }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parsed = ClaimBountySchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json({ success: false, error: errors }, { status: 400 });
    }
    const updated = await claimGhostBounty(
      parsed.data.bountyId,
      parsed.data.intelligenceReport,
      parsed.data.researcherAddress,
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Bounty not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, bounty: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
