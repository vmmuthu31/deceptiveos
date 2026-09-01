import { NextRequest, NextResponse } from 'next/server';
import {
  createMcpDecoy,
  exportMcpServerConfig,
  getAllMcpDecoys,
  getAllMcpInvocations,
  getAllPromptCanaries,
} from '@/server/services/mcp-deception.service';
import { z } from 'zod';

const CreateDecoySchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(10).max(500),
  category: z.enum(['database', 'admin', 'finance', 'cloud', 'custom']),
  parametersSchema: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('export') as 'antigravity' | 'claude' | 'cursor' | 'openai' | null;

    if (exportFormat) {
      const config = await exportMcpServerConfig(exportFormat);
      return NextResponse.json({ format: exportFormat, config });
    }

    const [decoys, invocations, promptCanaries] = await Promise.all([
      getAllMcpDecoys(),
      getAllMcpInvocations(),
      getAllPromptCanaries(),
    ]);

    const totalTriggers = decoys.reduce((acc, d) => acc + d.triggerCount, 0);

    return NextResponse.json({
      decoys,
      invocations,
      promptCanaries,
      stats: {
        totalDecoys: decoys.length,
        totalTriggers,
        activeCanaries: promptCanaries.length,
        criticalSeverityCount: invocations.filter((i) => i.riskScore >= 90).length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch MCP decoys' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateDecoySchema.parse(body);

    const newDecoy = await createMcpDecoy(validated);
    return NextResponse.json({ success: true, decoy: newDecoy }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request payload' },
      { status: 400 },
    );
  }
}
