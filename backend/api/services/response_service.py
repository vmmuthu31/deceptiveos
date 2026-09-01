"""Response / containment service — port of src/server/services/response.service.ts"""
import time
from ..db import read_db, write_db, append_audit_block

def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()

def get_all_containment_actions() -> list:
    return read_db().get("containmentActions") or []

def execute_containment(data: dict) -> dict:
    db = read_db()
    if not db.get("containmentActions"): db["containmentActions"] = []
    executed_by = data.get("executedBy", "SOC Operator (CipherNest Desktop)")
    details = data.get("reason") or f"Automated containment rule executed for target: {data['targetName']}"
    action_type = data["type"]
    target_id = data["targetId"]

    if action_type == "BLOCK_IP":
        for p in db.get("attackerProfiles", []):
            if p["ip"] == target_id or p["id"] == target_id:
                p["threatLevel"] = "Critical"
    elif action_type == "RESTRICT_MCP_TOOL":
        for t in (db.get("mcpDecoys") or []):
            if t["id"] == target_id or t["name"] == target_id:
                t["enabled"] = False
    elif action_type == "ISOLATE_DECOY":
        for h in db.get("honeypots", []):
            if h["id"] == target_id:
                h["status"] = "stopped"

    audit = append_audit_block(f"CONTAINMENT_{action_type}", {
        "targetId": target_id,
        "targetName": data["targetName"],
        "executedBy": executed_by,
        "details": details,
    })
    action = {
        "id": f"act-{int(time.time()*1000):x}",
        "type": action_type,
        "targetId": target_id,
        "targetName": data["targetName"],
        "status": "EXECUTED",
        "executedBy": executed_by,
        "timestamp": _now(),
        "auditBlockHash": audit["blockHash"],
        "details": details,
    }
    db["containmentActions"].insert(0, action)
    write_db(db)
    return action
