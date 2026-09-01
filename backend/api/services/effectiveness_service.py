"""Effectiveness service — port of src/server/services/effectiveness.service.ts"""
from ..db import read_db

def get_effectiveness_score() -> dict:
    db = read_db()
    events = db.get("events", [])
    beacons = db.get("beacons", [])
    lures = db.get("lures", [])
    profiles = db.get("attackerProfiles", [])
    honeypots = db.get("honeypots", [])
    sessions = len({e["sessionId"] for e in events}) or 1
    active_hp = sum(1 for h in honeypots if h.get("status") == "active")
    trapped = min(99.9, sessions / (sessions + active_hp) * 100) if active_hp else 0.0
    engagement = min(99.9, len(beacons) / len(lures) * 100) if lures else 0.0
    all_ttps: set = set()
    for p in profiles:
        all_ttps.update(p.get("mitreTechniques", []))
    avg_conf = sum(p.get("confidence", 0) for p in profiles) / len(profiles) if profiles else 0.0
    avg_lat = 1.8
    if events:
        total = 0.0
        for e in events:
            cmds = e.get("commands", [])
            if cmds:
                total += sum(c.get("executionDelayMs", 0) for c in cmds) / len(cmds)
        avg_lat = total / len(events) / 1000

    return {
        "attackerTrappedRate": round(trapped, 1),
        "decoyEngagementRate": round(engagement, 1),
        "realAssetExposureRate": 0.0,
        "detectionLatencySeconds": round(avg_lat, 1),
        "attackerDwellDelayMinutes": round(avg_lat * 10),
        "extractedTtpsCount": len(all_ttps),
        "dnaConfidencePercentage": round(avg_conf * 100, 1),
        "comparisonBenchmark": [
            {"metric":"Detection Latency","staticHoneypot":"12.4s","ciphernest":f"{round(avg_lat,1)}s"},
            {"metric":"Attacker Dwell Time Delay","staticHoneypot":"2m","ciphernest":f"+{round(avg_lat*10)}m"},
            {"metric":"Decoy Tool Interaction","staticHoneypot":"21%","ciphernest":f"{round(engagement,1)}%"},
            {"metric":"Extracted TTP Signatures","staticHoneypot":"4","ciphernest":f"{len(all_ttps)} MITRE ATT&CK TTPs"},
            {"metric":"Cross-Session Attacker DNA","staticHoneypot":"IP Only (Spoofable)","ciphernest":"Multi-Session Behavioral DNA"},
            {"metric":"Private STRK20 Threat Settlement","staticHoneypot":"None","ciphernest":"STRK20 GhostBounty Protocol"},
        ],
    }
