import { HoneypotProfile, TwinSyncMetadata } from '@/shared/types';

let honeypotsStore: HoneypotProfile[] = [
  {
    id: 'hp-cowrie-01',
    name: 'SSH Core Decoy (Cowrie)',
    type: 'Cowrie',
    status: 'active',
    port: 2222,
    ip: '127.0.0.1',
    containerId: 'doc-7f9a8b1c',
    twinSyncEnabled: true,
    temporalJitterMs: 350,
    activeSessionsCount: 3,
    totalEventsCount: 142,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'hp-customllm-02',
    name: 'AI-Native Dynamic Decoy (CustomLLM)',
    type: 'CustomLLM',
    status: 'active',
    port: 2223,
    ip: '127.0.0.1',
    containerId: 'doc-3e2a1d9c',
    twinSyncEnabled: true,
    temporalJitterMs: 480,
    activeSessionsCount: 1,
    totalEventsCount: 89,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'hp-dionaea-03',
    name: 'Malware Trap (Dionaea)',
    type: 'Dionaea',
    status: 'stopped',
    port: 445,
    ip: '127.0.0.1',
    containerId: 'doc-9c8b7a6f',
    twinSyncEnabled: false,
    temporalJitterMs: 150,
    activeSessionsCount: 0,
    totalEventsCount: 23,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function getAllHoneypots(): Promise<HoneypotProfile[]> {
  return honeypotsStore;
}

export async function createHoneypot(data: { name: string; type: 'Cowrie' | 'Dionaea' | 'CustomLLM'; port: number; temporalJitterMs: number; twinSyncEnabled: boolean }): Promise<HoneypotProfile> {
  const newHp: HoneypotProfile = {
    id: `hp-${data.type.toLowerCase()}-${Date.now().toString(36)}`,
    name: data.name,
    type: data.type,
    status: 'active',
    port: data.port,
    ip: '127.0.0.1',
    containerId: `doc-${Math.random().toString(36).substring(2, 10)}`,
    twinSyncEnabled: data.twinSyncEnabled,
    temporalJitterMs: data.temporalJitterMs,
    activeSessionsCount: 0,
    totalEventsCount: 0,
    createdAt: new Date().toISOString(),
  };
  honeypotsStore.push(newHp);
  return newHp;
}

export async function toggleHoneypotStatus(id: string): Promise<HoneypotProfile | null> {
  const hp = honeypotsStore.find((h) => h.id === id);
  if (!hp) return null;
  hp.status = hp.status === 'active' ? 'stopped' : 'active';
  return hp;
}

export async function getDigitalTwinMetadata(): Promise<TwinSyncMetadata> {
  return {
    hostname: 'ciphernest-defense-node',
    osRelease: 'Darwin 24.3.0 / macOS Sequoia',
    architecture: 'arm64 (Apple Silicon)',
    activePortRange: '2222-2225, 8443, 9090',
    directoryNaming: ['deceptiveos', 'documents', 'config', 'security-vault', 'src'],
    filePatterns: ['*.env', '*.config.json', 'database_backup.sql', 'keys.pem', 'salary_review.xlsx'],
    lastSyncedAt: new Date().toISOString(),
    syncApproved: true,
  };
}
