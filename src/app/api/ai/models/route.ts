import { OPENCODE_MODELS, checkOpenCodeHealth } from '@/server/services/ai.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = await checkOpenCodeHealth();
  const currentKeyStatus = process.env.OPENCODE_API_KEY && process.env.OPENCODE_API_KEY.trim().length > 0
    ? 'Configured (Active)'
    : 'Not Set (Set OPENCODE_API_KEY in .env)';
  const activeModel = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';

  return NextResponse.json({
    activeProvider: health.provider,
    activeModel: health.model,
    openCodeKeyStatus: currentKeyStatus,
    configuredOpenCodeModel: activeModel,
    availableOpenCodeModels: OPENCODE_MODELS,
    health,
  });
}
