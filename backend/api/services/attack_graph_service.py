"""Attack graph service — port of src/server/services/attack-graph.service.ts"""
from ..db import read_db

def get_correlated_campaigns() -> list:
    db = read_db()
    profiles = db.get("attackerProfiles", [])
    honeypots = db.get("honeypots", [])
    lures = db.get("lures", [])
    mcp_decoys = db.get("mcpDecoys") or []
    mcp_invocations = db.get("mcpInvocations") or []
    beacons = db.get("beacons", [])
    if not profiles:
        return []
    campaigns = []
    for profile in profiles:
        nodes = []
        links = []
        stages = ["Reconnaissance"]
        nodes.append({"id":f"node-{profile['id']}","label":f"Attacker [{profile['ip']}]","type":"ATTACKER","isDeceptive":False,"threatLevel":profile.get("threatLevel","High"),"details":f"{profile['classification']} ({round(profile['confidence']*100)}% conf) | {profile.get('behavioralDNA',{}).get('toolSignature','')}"})
        for hp in honeypots:
            nodes.append({"id":f"node-{hp['id']}","label":hp["name"],"type":"DECOY_HONEYPOT","isDeceptive":True,"details":f"Decoy Container on Port {hp['port']} (Jitter: {hp['temporalJitterMs']}ms)"})
            links.append({"source":f"node-{profile['id']}","target":f"node-{hp['id']}","action":"SSH Brute-Force & Recon","stage":"Initial Access","timestamp":profile["firstSeenAt"]})
            stages.append("Initial Access")
        for mcp in mcp_decoys[:2]:
            nodes.append({"id":f"node-{mcp['id']}","label":f"MCP Decoy: {mcp['name']}","type":"MCP_DECOY","isDeceptive":True,"details":f"Canary Token: {mcp['canaryToken']}"})
            links.append({"source":f"node-{profile['id']}","target":f"node-{mcp['id']}","action":"Prompt Injection Tool Execution","stage":"Tool Abuse","timestamp":mcp.get("lastTriggeredAt",profile["lastSeenAt"])})
            stages.append("Tool Abuse")
        for lure in lures[:2]:
            nodes.append({"id":f"node-{lure['id']}","label":f"Lure: {lure['title']}","type":"HONEYTOKEN","isDeceptive":True,"details":f"Steganographic Canary ({lure['watermark']['metadataTag']})"})
            links.append({"source":f"node-{profile['id']}","target":f"node-{lure['id']}","action":"Honeytoken Download & Exfiltration","stage":"Exfiltration","timestamp":lure["createdAt"]})
            stages.append("Exfiltration")
        nodes.append({"id":"node-real-core-db","label":"Core Production Customer DB","type":"DATABASE","isDeceptive":False,"threatLevel":"Critical","details":"Protected High-Value Asset (Unbreached - Diverted to Decoys)"})
        risk = 65
        if profile.get("threatLevel") == "Critical": risk = 96
        elif profile.get("threatLevel") == "High": risk = 84
        if mcp_invocations: risk = min(99, risk + 3)
        if beacons: risk = min(100, risk + 2)
        campaigns.append({
            "id":f"camp-{profile['id']}","attackerIp":profile["ip"],
            "attackerDna":f"DNA-{profile['id'][-8:].upper()}",
            "classification":profile["classification"],"overallRiskScore":risk,
            "stagesCompleted":list(dict.fromkeys(stages)),"nodes":nodes,"links":links,
            "status":"ACTIVE" if profile.get("threatLevel")=="Critical" else "MONITORING",
            "firstSeenAt":profile["firstSeenAt"],"lastActivityAt":profile["lastSeenAt"],
        })
    return campaigns
