"""Export service — port of src/server/services/export.service.ts"""
import json, time
from datetime import datetime, timezone
from ..db import read_db

def _now(): return datetime.now(timezone.utc).isoformat()

def generate_stix_bundle() -> str:
    db = read_db()
    objects = [{
        "type":"identity","spec_version":"2.1",
        "id":"identity--d8c903a4-8f92-4f3b-8c8a-112233445566",
        "name":"CipherNest Deception Engine","identity_class":"system",
        "created":_now(),"modified":_now(),
    }]
    for p in db.get("attackerProfiles", []):
        actor_id = f"threat-actor--{p['id'].replace('_','-')}"
        ind_id = f"indicator--ind-{p['id'].replace('_','-')}"
        objects.append({"type":"threat-actor","spec_version":"2.1","id":actor_id,
            "name":f"Attacker IP {p['ip']}",
            "threat_actor_types":["autonomous-agent" if p["classification"]=="AIAgent" else "script-kiddie"],
            "aliases":[p["ip"]],"confidence":round(p["confidence"]*100),
            "created":p["firstSeenAt"],"modified":p["lastSeenAt"]})
        objects.append({"type":"indicator","spec_version":"2.1","id":ind_id,
            "name":f"Malicious Activity from {p['ip']}",
            "pattern":f"[ipv4-addr:value = '{p['ip']}']","pattern_type":"stix",
            "valid_from":p["firstSeenAt"],"created":p["firstSeenAt"],"modified":p["lastSeenAt"]})
    bundle = {"type":"bundle","id":f"bundle--{int(time.time()):x}-ciphernest","spec_version":"2.1","objects":objects}
    return json.dumps(bundle, indent=2)

def generate_sigma_rules() -> str:
    db = read_db()
    ips = ", ".join(f"'{p['ip']}'" for p in db.get("attackerProfiles", [])) or "'194.26.29.112', '45.142.214.7'"
    return f"""title: CipherNest Detected Threat Actor SSH Activity
id: 8f9a2c4e-1122-3344-5566-778899aabbcc
status: experimental
description: Auto-generated Sigma rule capturing suspicious command execution sequences and honeypot traps from CipherNest.
author: CipherNest Adversarial AI Engine
date: {_now()[:10]}
references:
  - https://github.com/ciphernest/ciphernest
logsource:
  category: process_creation
  product: linux
detection:
  selection_ip:
    SrcIP:
      - {ips}
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
  - attack.t1105"""
