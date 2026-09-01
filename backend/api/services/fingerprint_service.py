"""Fingerprint service — port of src/server/services/fingerprint.service.ts"""
import time
from datetime import datetime, timezone
from ..db import read_db, write_db, append_audit_block
from ..utils import calculate_shannon_entropy

BASH_DICT = ["ls","cd","pwd","cat","grep","find","chmod","chown","systemctl","service",
             "docker","sudo","curl","wget","ssh","scp","tar","unzip","python","bash"]

def _levenshtein(a: str, b: str) -> int:
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j])
    return dp[m][n]

def _typo_ratio(commands: list[str]) -> float:
    if not commands: return 0.0
    typos = 0
    for cmd in commands:
        word = cmd.strip().split()[0].lower() if cmd.strip() else ""
        min_dist = min(_levenshtein(word, v) for v in BASH_DICT)
        if 0 < min_dist <= 2:
            typos += 1
    return round(typos / len(commands), 2)

def _mitre_classify(commands: list[str]) -> dict:
    combined = "; ".join(commands).lower()
    techs = []
    if any(x in combined for x in ("cat /etc", "shadow", "passwd")):
        techs += ["T1005 (Data from Local System)", "T1087.001 (Local Account Discovery)"]
    if any(x in combined for x in ("uname", "lscpu", "hostname")):
        techs.append("T1082 (System Information Discovery)")
    if any(x in combined for x in ("curl", "wget")):
        techs.append("T1105 (Ingress Tool Transfer)")
    if any(x in combined for x in ("chmod +x", "sudo", "su root")):
        techs.append("T1068 (Exploitation for Privilege Escalation)")
    if any(x in combined for x in ("nmap", "sqlmap", "hydra")):
        techs.append("T1595 (Active Scanning)")
    if not techs:
        techs.append("T1059.004 (Unix Shell Command Execution)")
    if "python" in combined or "import" in combined or any(len(c) > 120 for c in commands):
        return {"techniques": techs, "classification": "AIAgent", "confidence": 0.95}
    if "nmap" in combined or "sqlmap" in combined or len(commands) <= 2:
        return {"techniques": techs, "classification": "ScriptKiddie", "confidence": 0.88}
    return {"techniques": techs, "classification": "HumanOperator", "confidence": 0.82}

def get_all_events() -> list:
    return read_db().get("events", [])

def get_all_attacker_profiles() -> list:
    return read_db().get("attackerProfiles", [])

def add_session_event(event_data: dict) -> dict:
    db = read_db()
    processed_cmds = [
        {**cmd, "entropyScore": calculate_shannon_entropy(cmd.get("command", ""))}
        for cmd in event_data.get("commands", [])
    ]
    ts = datetime.now(timezone.utc).isoformat()
    new_evt = {
        **event_data,
        "commands": processed_cmds,
        "id": f"evt-{int(time.time()*1000):x}",
        "timestamp": ts,
    }
    events = db.get("events", [])
    events.insert(0, new_evt)
    db["events"] = events

    raw_cmds = [c.get("command", "") for c in event_data.get("commands", [])]
    typo_ratio = _typo_ratio(raw_cmds)
    result = _mitre_classify(raw_cmds)
    classification = result["classification"]
    confidence = result["confidence"]
    techniques = result["techniques"]

    profiles = db.get("attackerProfiles", [])
    ip = event_data.get("attackerIp", "")
    profile = next((p for p in profiles if p["ip"] == ip), None)

    if not profile:
        cmds = event_data.get("commands", [])
        timing_jitter = 0
        if len(cmds) > 1:
            timing_jitter = sum(
                abs(cmds[i]["executionDelayMs"] - cmds[i-1]["executionDelayMs"])
                for i in range(1, len(cmds))
            ) / (len(cmds) - 1)
        elif cmds:
            timing_jitter = cmds[0].get("executionDelayMs", 0)
        cmd_velocity = round(len(cmds) / max(1, len(cmds) * 0.5), 1) if cmds else 0
        profile = {
            "id": f"atk-profile-{int(time.time()*1000):x}",
            "ip": ip,
            "classification": classification,
            "confidence": confidence,
            "firstSeenAt": ts,
            "lastSeenAt": ts,
            "totalSessions": 1,
            "totalCommands": len(cmds),
            "timingJitterAvgMs": round(timing_jitter),
            "mitreTechniques": techniques,
            "threatLevel": "Critical" if classification == "AIAgent" else "High",
            "behavioralDNA": {
                "commandVelocityPerMin": cmd_velocity,
                "typoFrequencyScore": typo_ratio,
                "toolSignature": "Autonomous AI Red Team Agent" if classification == "AIAgent" else "Interactive Shell Operator",
                "timezoneEstimate": "Unknown",
                "botProbability": 0.95 if classification == "AIAgent" else 0.20,
            },
        }
        profiles.insert(0, profile)
    else:
        profile["lastSeenAt"] = ts
        profile["totalSessions"] = profile.get("totalSessions", 0) + 1
        profile["totalCommands"] = profile.get("totalCommands", 0) + len(event_data.get("commands", []))
        profile["mitreTechniques"] = list(set(profile.get("mitreTechniques", []) + techniques))

    db["attackerProfiles"] = profiles
    write_db(db)
    append_audit_block("SESSION_EVENT_RECORDED", {"sessionId": new_evt["sessionId"], "ip": ip, "kind": new_evt.get("kind")})
    return new_evt
