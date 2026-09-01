"""Lure service — port of src/server/services/lure.service.ts"""
import os, secrets, time
from datetime import datetime, timezone
from ..db import read_db, write_db, append_audit_block
from ..utils import generate_watermark_signature
from .ai_service import generate_lure_document

def _now(): return datetime.now(timezone.utc).isoformat()

def get_all_lures() -> list:
    return read_db().get("lures", [])

def get_lure_by_id(lure_id: str):
    db = read_db()
    lure = next((l for l in db.get("lures", []) if l["id"] == lure_id), None)
    if not lure: return None
    content = db.get("lureContents", {}).get(lure_id, f"[CONFIDENTIAL - {lure['targetCompany']}]\nDocument Token: {lure['watermark']['token']}")
    return {"lure": lure, "content": content}

def create_lure(data: dict) -> dict:
    db = read_db()
    app_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    token_str = f"wt_{secrets.token_hex(16)}"
    watermark = {
        "token": token_str,
        "embeddedAt": _now(),
        "stegoWhitespaceSignature": generate_watermark_signature(token_str),
        "metadataTag": f"CN-WM-{token_str[3:11].upper()}",
    }
    raw = generate_lure_document(data["docType"], data["targetCompany"], data["industry"])
    doc_type = data["docType"]
    title = data["title"]
    company = data["targetCompany"]
    industry = data["industry"]
    beacon_url = f"{app_url}/api/lures/beacon?watermarkToken={token_str}"

    if doc_type == "PDF":
        content = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{title}</title>
<!-- Steganographic Watermark Tag: {watermark['metadataTag']} {watermark['stegoWhitespaceSignature']} -->
</head><body style="font-family:Arial,sans-serif;padding:40px;color:#1e293b;">
<h1 style="color:#0f172a;border-bottom:2px solid #0284c7;">{company.upper()} — CONFIDENTIAL EXECUTIVE BRIEF</h1>
<p style="color:#ef4444;font-weight:bold;">STRICTLY RESTRICTED ACCESS — INDUSTRY: {industry}</p>
<div style="background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #cbd5e1;font-family:monospace;"><pre>{raw}</pre></div>
<img src="{beacon_url}" width="1" height="1" style="display:none;" alt="pixel-canary"/>
</body></html>"""
    elif doc_type == "JSON":
        import json
        content = json.dumps({
            "company": company, "industry": industry,
            "stego_signature": watermark["stegoWhitespaceSignature"],
            "security_token": watermark["metadataTag"],
            "pixel_canary_beacon": beacon_url,
            "config": {
                "database_url": f"postgresql://admin:{token_str}@db.{company.lower().replace(' ','')}.local:5432/production",
                "api_key": f"sk_live_{token_str}_ciphernest",
            },
        }, indent=2)
    elif doc_type == "ENV":
        content = f"""# Confidential Environment Config - {company}
DB_HOST=db-primary.{company.lower().replace(' ','')}.internal
DB_USER=vault_admin
DB_PASS={token_str}
API_SECRET=sk_live_{token_str}
# STATIVE_TOKEN={watermark['metadataTag']} {watermark['stegoWhitespaceSignature']}"""
    else:
        content = f"{raw}\n\n"

    lure_id = f"lure-doc-{int(time.time()*1000):x}"
    lure = {
        "id": lure_id, "title": title, "docType": doc_type,
        "targetCompany": company, "industry": industry,
        "watermark": watermark, "beaconHitsCount": 0,
        "createdAt": _now(), "downloadUrl": f"/api/lures/download/{lure_id}",
    }
    lures = db.get("lures", [])
    lures.insert(0, lure)
    db["lures"] = lures
    lure_contents = db.get("lureContents", {})
    lure_contents[lure_id] = content
    db["lureContents"] = lure_contents
    write_db(db)
    append_audit_block("LURE_DOCUMENT_GENERATED", {"id": lure_id, "title": title, "token": token_str})
    return {"lure": lure, "documentContent": content}

def get_all_beacons() -> list:
    return read_db().get("beacons", [])

def record_beacon_hit(token: str, source_ip: str = "0.0.0.0", user_agent: str = "") -> dict | None:
    db = read_db()
    lure = next((l for l in db.get("lures", []) if l["watermark"]["token"] == token), None)
    if not lure: return None
    lure["beaconHitsCount"] = lure.get("beaconHitsCount", 0) + 1
    beacon = {
        "id": f"beacon-{int(time.time()*1000):x}",
        "lureId": lure["id"], "documentTitle": lure["title"],
        "watermarkToken": token,
        "sourceIp": source_ip or "0.0.0.0",
        "location": "External Host (Beacon Received)",
        "userAgent": user_agent or "Mozilla/5.0 (Automated Document Parser)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    beacons = db.get("beacons", [])
    beacons.insert(0, beacon)
    db["beacons"] = beacons
    write_db(db)
    append_audit_block("STEGANOGRAPHIC_BEACON_HIT", {"lureId": lure["id"], "token": token, "ip": beacon["sourceIp"]})
    return beacon
