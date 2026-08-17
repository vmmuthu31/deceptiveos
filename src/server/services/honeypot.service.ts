import { appendAuditBlock, readDb, writeDb } from '@/server/db/database';
import { HoneypotProfile, TwinSyncMetadata } from '@/shared/types';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export interface DockerStatus {
  available: boolean;
  activeContainersCount: number;
  containers: Array<{ id: string; name: string; status: string; ports: string }>;
}

export async function checkDockerDaemonStatus(): Promise<DockerStatus> {
  try {
    const stdout = execSync('docker ps --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"', {
      timeout: 3000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    const lines = stdout.trim().split('\n').filter(Boolean);
    const containers = lines.map((line) => {
      const [id, name, status, ports] = line.split('|');
      return { id: id || 'unknown', name: name || 'unknown', status: status || 'running', ports: ports || '' };
    });

    return {
      available: true,
      activeContainersCount: containers.length,
      containers,
    };
  } catch {
    return {
      available: false,
      activeContainersCount: 0,
      containers: [],
    };
  }
}

export async function getAllHoneypots(): Promise<HoneypotProfile[]> {
  const db = readDb();
  return db.honeypots;
}

export async function createHoneypot(data: {
  name: string;
  type: 'Cowrie' | 'Dionaea' | 'CustomLLM';
  port: number;
  temporalJitterMs: number;
  twinSyncEnabled: boolean;
}): Promise<HoneypotProfile> {
  const db = readDb();
  const containerId = `doc-${Math.random().toString(36).substring(2, 10)}`;


  try {
    execSync(`docker run -d --name cipher-${containerId} -p ${data.port}:${data.port} alpine sleep infinity`, {
      timeout: 4000,
      stdio: 'ignore',
    });
  } catch {

  }

  const newHp: HoneypotProfile = {
    id: `hp-${data.type.toLowerCase()}-${Date.now().toString(36)}`,
    name: data.name,
    type: data.type,
    status: 'active',
    port: data.port,
    ip: '127.0.0.1',
    containerId,
    twinSyncEnabled: data.twinSyncEnabled,
    temporalJitterMs: data.temporalJitterMs,
    activeSessionsCount: 0,
    totalEventsCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.honeypots.push(newHp);
  writeDb(db);


  appendAuditBlock('HONEYPOT_DECOY_CREATED', { id: newHp.id, type: newHp.type, port: newHp.port });

  return newHp;
}

export async function toggleHoneypotStatus(id: string): Promise<HoneypotProfile | null> {
  const db = readDb();
  const hp = db.honeypots.find((h) => h.id === id);
  if (!hp) return null;

  const nextStatus = hp.status === 'active' ? 'stopped' : 'active';
  hp.status = nextStatus;


  try {
    if (nextStatus === 'stopped') {
      execSync(`docker stop cipher-${hp.containerId}`, { timeout: 3000, stdio: 'ignore' });
    } else {
      execSync(`docker start cipher-${hp.containerId}`, { timeout: 3000, stdio: 'ignore' });
    }
  } catch {

  }

  writeDb(db);
  appendAuditBlock('HONEYPOT_STATUS_TOGGLED', { id: hp.id, newStatus: nextStatus });

  return hp;
}

export async function getDigitalTwinMetadata(): Promise<TwinSyncMetadata> {
  const hostname = os.hostname() || 'ciphernest-node';
  const osRelease = `${os.type()} ${os.release()}`;
  const architecture = os.arch();

  const interfaces = os.networkInterfaces();
  const activeIfaces = Object.keys(interfaces).join(', ');

  const scannedDirs: string[] = [];
  try {
    const rootItems = fs.readdirSync(process.cwd());
    for (const item of rootItems) {
      if (!item.startsWith('.')) {
        const full = path.join(process.cwd(), item);
        try {
          if (fs.statSync(full).isDirectory()) {
            scannedDirs.push(item);
          }
        } catch {

        }
      }
    }
  } catch {
    scannedDirs.push('src', 'public', 'node_modules', 'config');
  }

  return {
    hostname,
    osRelease,
    architecture,
    activePortRange: `2222-2225 (Ifaces: ${activeIfaces.substring(0, 30)})`,
    directoryNaming: Array.from(new Set(scannedDirs)).slice(0, 8),
    filePatterns: ['*.env', '*.config.json', 'package.json', 'tsconfig.json', 'salary_review.csv'],
    lastSyncedAt: new Date().toISOString(),
    syncApproved: true,
  };
}
