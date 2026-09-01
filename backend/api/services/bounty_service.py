"""Ghost bounty service — port of src/server/services/bounty.service.ts"""
import re, time
from datetime import datetime, timezone
from ..db import read_db, write_db, append_audit_block
from .starknet_service import private_transfer
from .treasury_service import get_treasury

def _now(): return datetime.now(timezone.utc).isoformat()

def get_all_bounties() -> list:
    db = read_db()
    if not db.get("ghostBounties"):
        db["ghostBounties"] = []
        write_db(db)
    return db.get("ghostBounties", [])

def fund_bounty(data: dict) -> dict:
    treasury = get_treasury()
    amount = data["rewardStrk"]
    if amount > treasury.get("availableShieldedStrk", 0):
        raise ValueError(f"Insufficient shielded balance: need {amount} STRK, have {treasury['availableShieldedStrk']} STRK")
    result = private_transfer(treasury["publicWalletAddress"], amount)
    db = read_db()
    if not db.get("ghostBounties"): db["ghostBounties"] = []
    bounty = {
        "id": f"gb-{int(time.time()*1000):x}",
        "dnaFingerprint": data.get("dnaFingerprint") or "DNA-8A:99:C4",
        "title": data["title"], "description": data["description"],
        "rewardStrk": amount, "shieldedStatus": "SHIELDED",
        "confidenceScore": 95.0, "matchedCampaignsCount": 1,
        "mitreTtps": data.get("mitreTtps") or ["T1059 (Command Scripting)","T1082 (System Discovery)"],
        "createdAt": _now(), "fundedTxHash": result["txHash"],
    }
    db["ghostBounties"].insert(0, bounty)
    treasury = db.get("treasury") or get_treasury()
    treasury["committedBountyStrk"] = treasury.get("committedBountyStrk",0) + amount
    treasury["availableShieldedStrk"] = treasury.get("availableShieldedStrk",0) - amount
    db["treasury"] = treasury
    write_db(db)
    append_audit_block("GHOSTBOUNTY_FUNDED", {"id":bounty["id"],"dna":bounty["dnaFingerprint"],"rewardStrk":amount,"txHash":result["txHash"]})
    return bounty

def claim_bounty(bounty_id: str, intel: str, researcher: str) -> dict | None:
    if not re.match(r"^0x[0-9a-fA-F]+$", researcher):
        raise ValueError("Invalid researcher address")
    db = read_db()
    bounty = next((b for b in (db.get("ghostBounties") or []) if b["id"] == bounty_id), None)
    if not bounty: return None
    if bounty.get("shieldedStatus") != "SHIELDED":
        raise ValueError(f"Bounty {bounty_id} is not in SHIELDED status")
    result = private_transfer(researcher, bounty["rewardStrk"])
    treasury = db.get("treasury") or get_treasury()
    treasury["committedBountyStrk"] = treasury.get("committedBountyStrk",0) - bounty["rewardStrk"]
    bounty["shieldedStatus"] = "CLAIMED"
    bounty["claimantHash"] = result["txHash"]
    db["treasury"] = treasury
    write_db(db)
    append_audit_block("GHOSTBOUNTY_CLAIMED",{"bountyId":bounty_id,"researcherAddress":researcher,"rewardStrk":bounty["rewardStrk"],"txHash":result["txHash"],"intelligenceSnippet":intel[:50]})
    return bounty
