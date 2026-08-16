import { AttackerClass } from '@/shared/types';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export const OPENCODE_MODELS = [
  { id: 'mimo-v2.5-free', name: 'MiMo-V2.5 Free', provider: 'Xiaomi / OpenCode' },
  { id: 'hy3-free', name: 'Hy3 Free', provider: 'Stealth / OpenCode' },
  { id: 'laguna-s-2.1-free', name: 'Laguna S 2.1 Free', provider: 'Stealth / OpenCode' },
  { id: 'nemotron-3-ultra-free', name: 'Nemotron 3 Ultra Free', provider: 'NVIDIA / OpenCode' },
  { id: 'nemotron-3.5-lightning-free', name: 'Nemotron 3.5 Lightning Free', provider: 'NVIDIA / OpenCode' },
  { id: 'deepseek-v4-flash-free', name: 'DeepSeek V4 Flash Free', provider: 'DeepSeek / OpenCode' },
];

export async function checkOllamaHealth(): Promise<{ available: boolean; model: string; provider: string; latencyMs: number }> {
  const start = Date.now();
  const openCodeKey = process.env.OPENCODE_API_KEY;
  const configuredModel = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';

  if (openCodeKey && openCodeKey.trim().length > 0) {
    return {
      available: true,
      model: `opencode/${configuredModel}`,
      provider: 'OpenCode API Zen (Cloud)',
      latencyMs: 110,
    };
  }

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: 'GET', cache: 'no-store' });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      const data = await res.json() as { models?: Array<{ name: string }> };
      const hasModel = data.models?.some((m) => m.name.includes('llama3.1')) || false;
      return {
        available: true,
        model: hasModel ? 'llama3.1:8b' : (data.models?.[0]?.name || 'default'),
        provider: 'Local Air-Gap Ollama Engine',
        latencyMs,
      };
    }
    return { available: false, model: DEFAULT_OLLAMA_MODEL, provider: 'Local Air-Gap Engine', latencyMs };
  } catch {
    return { available: false, model: DEFAULT_OLLAMA_MODEL, provider: 'Local Air-Gap Engine', latencyMs: Date.now() - start };
  }
}

/**
 * Temporal Deception Engine: Calculate command delay based on Linux command complexity
 */
export function calculateTemporalDeceptionDelay(command: string): number {
  const trimmed = command.toLowerCase().trim();

  // Heavy filesystem searches & regex scans
  if (trimmed.includes('find') || trimmed.includes('grep') || trimmed.includes('locate')) {
    return Math.floor(Math.random() * 1400) + 1200; // 1200ms - 2600ms
  }

  // Cryptographic & key generation ops
  if (trimmed.includes('openssl') || trimmed.includes('gpg') || trimmed.includes('ssh-keygen')) {
    return Math.floor(Math.random() * 800) + 700; // 700ms - 1500ms
  }

  // Network recon & tool downloads
  if (trimmed.includes('nmap') || trimmed.includes('curl') || trimmed.includes('wget') || trimmed.includes('netstat')) {
    return Math.floor(Math.random() * 600) + 400; // 400ms - 1000ms
  }

  // Standard interactive commands (ls, whoami, pwd, cat)
  return Math.floor(Math.random() * 250) + 80; // 80ms - 330ms
}

export async function generateHoneypotSSHResponse(
  command: string,
  history: string[],
  customModel?: string
): Promise<{ output: string; delayMs: number }> {
  const delayMs = calculateTemporalDeceptionDelay(command);
  const openCodeKey = process.env.OPENCODE_API_KEY;

  const systemPrompt = `You are simulating a vulnerable Linux server terminal shell for an SSH honeypot.
Respond ONLY with the raw Linux shell output for the given command. No markdown, no triple backticks, no explanations. Make it look 100% authentic to Ubuntu Linux 24.04.`;

  const userPrompt = `Prior command history:\n${history.slice(-5).join('\n')}\n\nUser command: ${command}`;

  // If OpenCode API Key is available, use OpenCode API!
  if (openCodeKey && openCodeKey.trim().length > 0) {
    const modelName = customModel || process.env.OPENCODE_MODEL || 'mimo-v2.5-free';
    const formattedModel = modelName.startsWith('opencode/') ? modelName : `opencode/${modelName}`;

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
    } catch {
      // Fallback to local or stateful emulator
    }
  }

  // Local Ollama Inference Fallback
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: { temperature: 0.2 },
      }),
    });

    if (res.ok) {
      const data = await res.json() as { response?: string };
      if (data.response) {
        return { output: data.response.trim(), delayMs };
      }
    }
  } catch {
    // Stateful Linux shell emulator fallback when offline
  }

  return { output: getFallbackStatefulShellOutput(command), delayMs };
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
  const prompt = `Generate a realistic fake confidential ${docType} document for a company named "${company}" operating in the ${industry} industry. Include authentic-looking fake data such as internal hostnames, project names, or financial metadata. Do not state that this is fake.`;

  if (openCodeKey && openCodeKey.trim().length > 0) {
    const modelName = process.env.OPENCODE_MODEL || 'mimo-v2.5-free';
    const formattedModel = modelName.startsWith('opencode/') ? modelName : `opencode/${modelName}`;

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
    } catch {
      // Fallback
    }
  }

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (res.ok) {
      const data = await res.json() as { response?: string };
      if (data.response) return data.response.trim();
    }
  } catch {
    // Fallback template
  }

  return `[CONFIDENTIAL - ${company.toUpperCase()} INTERNAL USE ONLY]
Project Cipher-Twin Infrastructure Configuration
Target Environment: ${company.toLowerCase()}-prod-us-east-1.internal
Database Endpoint: postgresql://admin:P%40ssw0rd2026@db-primary.${company.toLowerCase()}.local:5432/${company.toLowerCase()}_prod
API Gateway Key: sk_live_99a8b7c6d5e4f3a2b1_ciphernest
Internal Services: auth-service:8080, payment-vault:8443, telemetry-node:9090
Contact: secops@${company.toLowerCase()}.com`;
}

function getFallbackStatefulShellOutput(cmd: string): string {
  const trimmed = cmd.trim();

  if (trimmed === 'ls' || trimmed === 'ls -la') {
    return 'drwxr-xr-x 4 root root 4096 Aug 15 11:02 .\ndrwxr-xr-x 20 root root 4096 Aug 15 11:00 ..\n-rw-r--r-- 1 root root  220 Aug 15 11:00 .bashrc\n-rw-r--r-- 1 root root  807 Aug 15 11:00 .profile\n-rw------- 1 root root 1420 Aug 15 11:02 database_backup.sql\n-rw-r--r-- 1 root root 4096 Aug 15 11:02 config.env';
  }
  if (trimmed.startsWith('cat ')) {
    return 'DB_HOST=10.0.4.12\nDB_USER=admin\nDB_PASS=CipherNestSecret2026!\nREDIS_URL=redis://10.0.4.15:6379';
  }
  if (trimmed === 'pwd') return '/root';
  if (trimmed === 'whoami') return 'root';
  if (trimmed === 'ps aux' || trimmed === 'ps') {
    return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  22556  3100 ?        Ss   Aug15   0:02 /sbin/init\nroot       142  0.0  0.2 108420  5400 ?        Ss   11:02   0:00 /usr/sbin/sshd\nroot       891  0.0  0.1  14200  2800 pts/0    Ss+  11:04   0:00 -bash';
  }
  if (trimmed === 'uname -a') {
    return 'Linux cipher-node-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC Thu Aug 15 10:14:02 UTC 2026 x86_64 GNU/Linux';
  }
  return `bash: ${trimmed.split(' ')[0]}: command executed successfully`;
}
