"""
CipherNest JSON Database — Python port of src/server/db/database.ts
Handles the ciphernest-store.json flat-file database with SHA-256 blockchain audit ledger.
"""
import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent.parent.parent / "data" / "ciphernest-store.json"
_lock = threading.Lock()

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def _block_hash(idx: int, ts: str, action: str, payload_hash: str, prev_hash: str) -> str:
    content = f"{idx}:{ts}:{action}:{payload_hash}:{prev_hash}"
    return _sha256(content)

def _genesis_block() -> dict:
    ts = datetime.fromtimestamp(
        (datetime.now(timezone.utc).timestamp() - 86400 * 5), tz=timezone.utc
    ).isoformat()
    payload_hash = _sha256("GENESIS_BLOCK_CIPHERNEST_INIT")
    bh = _block_hash(0, ts, "GENESIS_INITIALIZATION", payload_hash, GENESIS_PREV_HASH)
    return {
        "blockIndex": 0,
        "timestamp": ts,
        "action": "GENESIS_INITIALIZATION",
        "payloadHash": payload_hash,
        "previousHash": GENESIS_PREV_HASH,
        "blockHash": bh,
    }

INITIAL_SEED = {
    "honeypots": [],
    "events": [],
    "attackerProfiles": [],
    "lures": [],
    "beacons": [],
    "lureContents": {},
    "auditLedger": [_genesis_block()],
    "mcpDecoys": None,
    "mcpInvocations": [],
    "promptCanaries": None,
    "containmentActions": [],
    "ghostBounties": [],
    "treasury": None,
    "threatNetwork": [],
}


def read_db() -> dict:
    with _lock:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not DB_PATH.exists():
            DB_PATH.write_text(json.dumps(INITIAL_SEED, indent=2))
            return dict(INITIAL_SEED)
        try:
            data = json.loads(DB_PATH.read_text())
            if not data.get("auditLedger"):
                data["auditLedger"] = [_genesis_block()]
                DB_PATH.write_text(json.dumps(data, indent=2))
            return data
        except Exception:
            DB_PATH.write_text(json.dumps(INITIAL_SEED, indent=2))
            return dict(INITIAL_SEED)


def write_db(data: dict) -> None:
    with _lock:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        DB_PATH.write_text(json.dumps(data, indent=2))


def append_audit_block(action: str, payload: Any) -> dict:
    db = read_db()
    ledger = db.get("auditLedger", [_genesis_block()])
    last = ledger[-1]
    idx = last["blockIndex"] + 1
    ts = _now()
    prev_hash = last["blockHash"]
    payload_hash = _sha256(json.dumps(payload, separators=(",", ":")))
    bh = _block_hash(idx, ts, action, payload_hash, prev_hash)
    block = {
        "blockIndex": idx,
        "timestamp": ts,
        "action": action,
        "payloadHash": payload_hash,
        "previousHash": prev_hash,
        "blockHash": bh,
    }
    ledger.append(block)
    db["auditLedger"] = ledger
    write_db(db)
    return block


def verify_audit_chain() -> dict:
    db = read_db()
    ledger = db.get("auditLedger", [])
    if not ledger:
        return {"verified": False, "blockCount": 0, "rootHash": "none"}
    for i, block in enumerate(ledger):
        expected_prev = GENESIS_PREV_HASH if i == 0 else ledger[i - 1]["blockHash"]
        if block["previousHash"] != expected_prev:
            return {
                "verified": False,
                "blockCount": len(ledger),
                "rootHash": ledger[-1]["blockHash"],
                "invalidBlockIndex": i,
            }
        calculated = _block_hash(
            block["blockIndex"],
            block["timestamp"],
            block["action"],
            block["payloadHash"],
            block["previousHash"],
        )
        if calculated != block["blockHash"]:
            return {
                "verified": False,
                "blockCount": len(ledger),
                "rootHash": ledger[-1]["blockHash"],
                "invalidBlockIndex": i,
            }
    return {
        "verified": True,
        "blockCount": len(ledger),
        "rootHash": ledger[-1]["blockHash"],
    }
