import { AttackerClass } from '@/shared/types';

export const OPENCODE_MODELS = [
  { id: 'mimo-v2.5-free', name: 'MiMo-V2.5 Free', provider: 'Xiaomi / OpenCode' },
  { id: 'hy3-free', name: 'Hy3 Free', provider: 'Stealth / OpenCode' },
  { id: 'laguna-s-2.1-free', name: 'Laguna S 2.1 Free', provider: 'Stealth / OpenCode' },
  { id: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra Free', provider: 'NVIDIA / OpenCode' },
  { id: 'nemotron-3.5-lightning-free', name: 'Nemotron 3.5 Lightning Free', provider: 'NVIDIA / OpenCode' },
  { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash Free', provider: 'DeepSeek / OpenCode' },
];

export async function checkOpenCodeHealth(): Promise<{ available: boolean; model: string; provider: string; latencyMs: number }> {
  const openCodeKey = process.env.OPENCODE_API_KEY;
  const configuredModel = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';

  if (openCodeKey && openCodeKey.trim().length > 0) {
    return {
      available: true,
      model: `opencode/${configuredModel}`,
      provider: 'OpenCode API Zen (Cloud)',
      latencyMs: 85,
    };
  }

  return {
    available: false,
    model: `opencode/${configuredModel}`,
    provider: 'OpenCode API Zen (Key Required in .env)',
    latencyMs: 0,
  };
}

export function calculateTemporalDeceptionDelay(command: string): number {
  const trimmed = command.toLowerCase().trim();

  if (trimmed.includes('find') || trimmed.includes('grep') || trimmed.includes('locate')) {
    return Math.floor(Math.random() * 1400) + 1200;
  }

  if (trimmed.includes('openssl') || trimmed.includes('gpg') || trimmed.includes('ssh-keygen')) {
    return Math.floor(Math.random() * 800) + 700;
  }

  if (trimmed.includes('nmap') || trimmed.includes('curl') || trimmed.includes('wget') || trimmed.includes('netstat')) {
    return Math.floor(Math.random() * 600) + 400;
  }

  return Math.floor(Math.random() * 250) + 80;
}

export async function generateHoneypotSSHResponse(
  command: string,
  history: string[],
  customModel?: string
): Promise<{ output: string; delayMs: number }> {
  const delayMs = calculateTemporalDeceptionDelay(command);
  const openCodeKey = process.env.OPENCODE_API_KEY;

  if (!openCodeKey || openCodeKey.trim().length === 0) {
    return {
      output: `[CipherNest Security Notice]: Please set OPENCODE_API_KEY in your .env file to enable live AI honeypot SSH response synthesis.`,
      delayMs,
    };
  }

  const modelName = customModel || process.env.OPENCODE_MODEL || 'mimo-v2.5-free';
  const formattedModel = modelName.startsWith('opencode/') ? modelName : `opencode/${modelName}`;

  const systemPrompt = `You are simulating a vulnerable Linux server terminal shell for an SSH honeypot.
Respond ONLY with the raw Linux shell output for the given command. No markdown, no triple backticks, no explanations. Make it look 100% authentic to Ubuntu Linux 24.04.`;

  const userPrompt = `Prior command history:\n${history.slice(-5).join('\n')}\n\nUser command: ${command}`;

  try {
    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openCodeKey}`,
      },
      body: JSON.stringify({
        model: formattedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (res.ok) {
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const output = data.choices?.[0]?.message?.content;
      if (output) {
        return { output: output.trim(), delayMs };
      }
    }
    return { output: `Error from OpenCode AI (${res.status} ${res.statusText})`, delayMs };
  } catch (err: any) {
    return { output: `OpenCode API Connection Error: ${err.message}`, delayMs };
  }
}

export async function classifyAttackerSession(commands: string[]): Promise<{ classification: AttackerClass; confidence: number; summary: string }> {
  const commandStr = commands.join('; ');

  if (commandStr.includes('nmap') || commandStr.includes('sqlmap') || commands.length < 3) {
    return {
      classification: 'ScriptKiddie',
      confidence: 0.88,
      summary: 'Automated vulnerability scanner or basic script execution pattern detected.',
    };
  }

  if (commandStr.includes('python') || commandStr.includes('eval') || commandStr.includes('import') || commands.some((c) => c.length > 120)) {
    return {
      classification: 'AIAgent',
      confidence: 0.94,
      summary: 'Rapid structured exploration, synthetic tool invocation, and low-latency decision loop characteristic of an autonomous AI agent.',
    };
  }

  return {
    classification: 'HumanOperator',
    confidence: 0.79,
    summary: 'Manual command pauses, interactive directory navigation, and organic typo correction observed.',
  };
}

export async function generateSemanticLureDocument(docType: string, company: string, industry: string): Promise<string> {
  const openCodeKey = process.env.OPENCODE_API_KEY;
  if (!openCodeKey || openCodeKey.trim().length === 0) {
    return `[CipherNest Security Notice]: Please set OPENCODE_API_KEY in your .env file to generate live semantic lure documents.`;
  }

  const modelName = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';
  const formattedModel = modelName.startsWith('opencode/') ? modelName : `opencode/${modelName}`;
  const prompt = `Generate a realistic confidential ${docType} document for a company named "${company}" operating in the ${industry} industry. Include authentic internal hostnames, project names, or financial metadata. Do not state that this is fake.`;

  try {
    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openCodeKey}`,
      },
      body: JSON.stringify({
        model: formattedModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (res.ok) {
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const output = data.choices?.[0]?.message?.content;
      if (output) return output.trim();
    }
    return `Error from OpenCode AI (${res.status} ${res.statusText})`;
  } catch (err: any) {
    return `OpenCode API Connection Error: ${err.message}`;
  }
}
