import { AttackerClass } from '@/shared/types';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export async function checkOllamaHealth(): Promise<{ available: boolean; model: string; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: 'GET', cache: 'no-store' });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      const data = await res.json() as { models?: Array<{ name: string }> };
      const hasModel = data.models?.some((m) => m.name.includes('llama3.1')) || false;
      return { available: true, model: hasModel ? 'llama3.1:8b' : (data.models?.[0]?.name || 'default'), latencyMs };
    }
    return { available: false, model: DEFAULT_MODEL, latencyMs };
  } catch {
    return { available: false, model: DEFAULT_MODEL, latencyMs: Date.now() - start };
  }
}

export async function generateHoneypotSSHResponse(command: string, history: string[]): Promise<{ output: string; delayMs: number }> {
  const prompt = `You are simulating a vulnerable Linux server terminal shell for an SSH honeypot.
Prior command history:
${history.slice(-5).join('\n')}

User command: ${command}

Respond with only the raw Linux shell output to this command. No markdown formatting, no explanations. Make it look 100% authentic to Ubuntu Linux 24.04.`;

  const jitter = Math.floor(Math.random() * 450) + 120; // 120ms - 570ms realistic server latency jitter

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2 },
      }),
    });

    if (res.ok) {
      const data = await res.json() as { response?: string };
      return { output: data.response || `bash: ${command}: command not found`, delayMs: jitter };
    }
  } catch {
    // Fallback deterministic shell outputs when Ollama is offline
  }

  return { output: getFallbackShellOutput(command), delayMs: jitter };
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

  if (commandStr.includes('python') || commandStr.includes('eval') || commandStr.includes('import') || commands.some(c => c.length > 120)) {
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
  const prompt = `Generate a realistic fake confidential ${docType} document for a company named "${company}" operating in the ${industry} industry.
Include authentic-looking fake data such as internal hostnames, project names, or financial metadata. Do not state that this is fake.`;

  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (res.ok) {
      const data = await res.json() as { response?: string };
      if (data.response) return data.response;
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

function getFallbackShellOutput(cmd: string): string {
  const trimmed = cmd.trim();
  if (trimmed === 'ls' || trimmed === 'ls -la') {
    return 'drwxr-xr-x 4 root root 4096 Aug 15 11:02 .\ndrwxr-xr-x 20 root root 4096 Aug 15 11:00 ..\n-rw-r--r-- 1 root root  220 Aug 15 11:00 .bashrc\n-rw-r--r-- 1 root root  807 Aug 15 11:00 .profile\n-rw------- 1 root root 1420 Aug 15 11:02 database_backup.sql\n-rw-r--r-- 1 root root 4096 Aug 15 11:02 config.env';
  }
  if (trimmed.startsWith('cat ')) {
    return 'DB_HOST=10.0.4.12\nDB_USER=admin\nDB_PASS=CipherNestSecret2026!\nREDIS_URL=redis://10.0.4.15:6379';
  }
  if (trimmed === 'whoami') return 'root';
  if (trimmed === 'uname -a') return 'Linux cipher-node-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC Thu Aug 15 10:14:02 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux';
  return `bash: ${trimmed.split(' ')[0]}: command executed successfully`;
}
