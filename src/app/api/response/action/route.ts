import { NextRequest, NextResponse } from 'next/server';
import { executeContainmentAction, getAllContainmentActions } from '@/server/services/response.service';
import { z } from 'zod';

const ContainmentSchema = z.object({
  type: z.enum(['BLOCK_IP', 'REVOKE_HONEYTOKEN', 'RESTRICT_MCP_TOOL', 'ISOLATE_DECOY', 'EXPORT_INCIDENT']),
  targetId: z.string().min(1),
  targetName: z.string().min(1),
  reason: z.string().optional(),
});

export async function GET() {
  try {
    const actions = await getAllContainmentActions();
    return NextResponse.json({ actions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch containment log' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ContainmentSchema.parse(body);

    const action = await executeContainmentAction(validated);
    return NextResponse.json({ success: true, action });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute containment action' },
      { status: 400 },
    );
  }
}
