import { readDb } from '@/server/db/database';

export async function generateStix21Bundle(): Promise<string> {
  const db = readDb();

  const stixObjects: unknown[] = [
    {
      type: 'identity',
      spec_version: '2.1',
      id: 'identity--d8c903a4-8f92-4f3b-8c8a-112233445566',
      name: 'CipherNest Deception Engine',
      identity_class: 'system',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  ];

  for (const profile of db.attackerProfiles) {
    const actorId = `threat-actor--${profile.id.replace(/[^a-z0-9-]/g, '')}`;
    stixObjects.push({
      type: 'threat-actor',
      spec_version: '2.1',
      id: actorId,
      name: `Attacker IP ${profile.ip}`,
      threat_actor_types: [profile.classification === 'AIAgent' ? 'autonomous-agent' : 'script-kiddie'],
      aliases: [profile.ip],
      confidence: Math.round(profile.confidence * 100),
      created: profile.firstSeenAt,
      modified: profile.lastSeenAt,
    });

    const indicatorId = `indicator--ind-${profile.id.replace(/[^a-z0-9-]/g, '')}`;
    stixObjects.push({
      type: 'indicator',
      spec_version: '2.1',
      id: indicatorId,
      name: `Malicious Activity from ${profile.ip}`,
      pattern: `[ipv4-addr:value = '${profile.ip}']`,
      pattern_type: 'stix',
      valid_from: profile.firstSeenAt,
      created: profile.firstSeenAt,
      modified: profile.lastSeenAt,
    });
  }

  const bundle = {
    type: 'bundle',
    id: `bundle--${Date.now().toString(36)}-ciphernest`,
    spec_version: '2.1',
    objects: stixObjects,
  };

  return JSON.stringify(bundle, null, 2);
}

export async function generateSigmaRules(): Promise<string> {
  const db = readDb();
  const activeIps = db.attackerProfiles.map((p) => `'${p.ip}'`).join(', ');

  return `title: CipherNest Detected Threat Actor SSH Activity
id: 8f9a2c4e-1122-3344-5566-778899aabbcc
status: experimental
description: Auto-generated Sigma rule capturing suspicious command execution sequences and honeypot traps from CipherNest.
author: CipherNest Adversarial AI Engine
date: ${new Date().toISOString().substring(0, 10)}
references:
  - https://github.com/ciphernest/ciphernest
logsource:
  category: process_creation
  product: linux
detection:
  selection_ip:
    SrcIP:
      - ${activeIps || "'194.26.29.112', '45.142.214.7'"}
  selection_command:
    CommandLine|contains:
      - 'cat /etc/passwd'
      - 'uname -a'
      - 'curl -s http'
      - 'wget'
  condition: selection_ip and selection_command
falsepositives:
  - Authorized internal penetration testing
level: high
tags:
  - attack.t1059.004
  - attack.t1082
  - attack.t1105`;
}
