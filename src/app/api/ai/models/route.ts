import { OPENCODE_MODELS, checkOllamaHealth } from '@/server/services/ai.service';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = await checkOllamaHealth();
  const currentKey = process.env.OPENCODE_API_KEY ? 'Configured' : 'Not Set (Using Local Ollama)';
  const activeModel = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';

  return NextResponse.json({
    activeProvider: health.provider,
    activeModel: health.model,
    openCodeKeyStatus: currentKey,
    configuredOpenCodeModel: activeModel,
    availableOpenCodeModels: OPENCODE_MODELS,
  });
}
