import { NextRequest, NextResponse } from 'next/server';
import { triggerMcpDecoy } from '@/server/services/mcp-deception.service';
import { z } from 'zod';

const TriggerSchema = z.object({
  toolId: z.string().min(1),
  callerIp: z.string().optional(),
  agentPersona: z.string().optional(),
  promptSnippet: z.string().optional(),
  argumentsReceived: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TriggerSchema.parse(body);

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || validated.callerIp || '127.0.0.1';

    const result = await triggerMcpDecoy({
      toolId: validated.toolId,
      callerIp: clientIp,
      agentPersona: validated.agentPersona,
      promptSnippet: validated.promptSnippet,
      argumentsReceived: validated.argumentsReceived,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger MCP decoy' },
      { status: 400 },
    );
  }
}
