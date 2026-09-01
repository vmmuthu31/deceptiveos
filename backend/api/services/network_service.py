"""Network service — port of src/server/services/network.service.ts"""
import hashlib
from ..db import read_db

def get_anonymized_threat_graph() -> list:
    db = read_db()
    nodes = []
    for p in db.get("attackerProfiles", []):
        dna = hashlib.sha256(p["ip"].encode()).hexdigest()[:8].upper()
        nodes.append({
            "id": f"node-{p['id']}",
            "anonymousDna": f"DNA: {dna}",
            "threatLevel": p.get("threatLevel","High"),
            "toolSignature": p.get("behavioralDNA",{}).get("toolSignature",""),
            "mitreTechniques": p.get("mitreTechniques",[]),
            "contributingDefendersCount": max(1, p.get("totalSessions",1)),
            "botProbability": p.get("behavioralDNA",{}).get("botProbability",0.2),
            "firstSeenAt": p.get("firstSeenAt",""),
            "lastActiveAt": p.get("lastSeenAt",""),
        })
    return nodes
