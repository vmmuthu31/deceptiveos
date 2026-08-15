import { readDb, writeDb } from '@/server/db/database';
import { HoneypotProfile, TwinSyncMetadata } from '@/shared/types';
import fs from 'fs';
import os from 'os';
import path from 'path';

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

  db.honeypots.push(newHp);
  writeDb(db);
  return newHp;
}

export async function toggleHoneypotStatus(id: string): Promise<HoneypotProfile | null> {
  const db = readDb();
  const hp = db.honeypots.find((h) => h.id === id);
  if (!hp) return null;

  hp.status = hp.status === 'active' ? 'stopped' : 'active';
  writeDb(db);
  return hp;
}

export async function getDigitalTwinMetadata(): Promise<TwinSyncMetadata> {
  // Real host system metadata dynamic scanner
  const hostname = os.hostname() || 'ciphernest-node';
  const osRelease = `${os.type()} ${os.release()}`;
  const architecture = os.arch();

  // Scan network interfaces for active port info
  const interfaces = os.networkInterfaces();
  const activeIfaces = Object.keys(interfaces).join(', ');

  // Read-only scan of real workspace and home directory names
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
          // ignore permission errors
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
