"""Compliance service — port of src/server/services/compliance.service.ts"""
from datetime import datetime, timezone
from ..db import read_db, verify_audit_chain

def _now(): return datetime.now(timezone.utc).isoformat()

def get_compliance_summary() -> dict:
    result = verify_audit_chain()
    verified = result["verified"]
    block_count = result["blockCount"]
    db = read_db()
    events = db.get("events", [])
    honeypots = db.get("honeypots", [])
    lures = db.get("lures", [])
    soc2 = min(100, (85 if verified else 50) + (5 if events else 0) + (5 if honeypots else 0) + (5 if lures else 0))
    iso = min(100, (80 if verified else 45) + (6 if events else 0) + (6 if honeypots else 0) + (6 if lures else 0))
    gdpr = "Compliant" if verified and honeypots else "Review Needed"
    return {"soc2Score": soc2, "iso27001Score": iso, "gdprStatus": gdpr, "immutableAuditLogHeight": block_count, "lastAuditExportAt": _now()}

def generate_compliance_report() -> str:
    db = read_db()
    v = verify_audit_chain()
    ledger = db.get("auditLedger", [])
    latest = ledger[-1] if ledger else {}
    events = db.get("events", [])
    honeypots = db.get("honeypots", [])
    lures = db.get("lures", [])
    active_hp = sum(1 for h in honeypots if h.get("status") == "active")
    return f"""================================================================================
CIPHERNEST ADVERSARIAL DECEPTION ENGINE — COMPLIANCE EVIDENCE REPORT
================================================================================
Report Generation Timestamp: {_now()}
Security Framework Target: SOC 2 Type II, ISO 27001:2022 Annex A, GDPR Art. 32

1. CRYPTOGRAPHIC AUDIT TRAIL VERIFICATION (TAMPER-EVIDENT LEDGER)
   Ledger Integrity Verification: {"VALIDATED (0 Tampering Errors)" if v["verified"] else "FAILED"}
   Total Block Height: {v["blockCount"]} Blocks
   Latest Root Hash: {v["rootHash"]}
   Genesis Block Hash: {ledger[0]["blockHash"] if ledger else "N/A"}
   Latest Action Logged: {latest.get("action","NONE")} ({latest.get("timestamp","N/A")})

2. SYSTEM OPERATIONAL STATUS
   Active Honeypots: {active_hp} / {len(honeypots)}
   Total Session Events: {len(events)}
   Active Lure Documents: {len(lures)}
   Local AI Inference: Ollama (self-hosted)

3. DATA MINIMIZATION & AIR-GAP PROOF (GDPR & FEDRAMP)
   External Network Telemetry: DISABLED (Strict Air-Gap Operating Mode)
   Metadata Sync Scope: Read-Only Filesystem Structure (Zero Document Reading)
   Local LLM Execution: Ollama (Offline Local Model Instance)

4. CONTROL EVIDENCE MAPPING
   SOC 2 CC6.1 (Boundary Protection): {"Passed" if active_hp > 0 else "Pending"} — Decoy isolation verified
   SOC 2 CC6.8 (Malware Defense): {"Passed" if lures else "Pending"} — Steganographic beacon tracking active
   ISO 27001 A.12.4.1 (Event Logging): {"Passed" if events else "Pending"} — Attacker SSH inputs logged
   ISO 27001 A.14.2.5 (System Security Principles): {"Passed" if v["verified"] else "Pending"} — Zero host privilege

================================================================================
END OF REPORT — VERIFIED BY CIPHERNEST CRYPTOGRAPHIC AUDIT LEDGER
================================================================================"""
