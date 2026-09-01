"""Treasury service — port of src/server/services/treasury.service.ts"""
import time
from datetime import datetime, timezone
from ..db import read_db, write_db, append_audit_block
from .starknet_service import shield_strk, unshield_strk, private_transfer, _get_config

def _now(): return datetime.now(timezone.utc).isoformat()

def get_treasury() -> dict:
    db = read_db()
    if not db.get("treasury"):
        cfg = _get_config()
        db["treasury"] = {
            "publicWalletAddress": cfg["accountAddress"],
            "publicBalanceStrk": 10000,
            "shieldedBalanceStrk": 0,
            "committedBountyStrk": 0,
            "availableShieldedStrk": 0,
            "transactions": [],
        }
        write_db(db)
    return db["treasury"]

def execute_transaction(data: dict) -> dict:
    db = read_db()
    treasury = get_treasury()
    amount = data["amountStrk"]
    tx_type = data["type"]

    if tx_type == "SHIELD":
        result = shield_strk(amount)
        tx_hash = result["txHash"]
        utxo = f"0xutxo_{result['blockNumber']}"
        treasury["publicBalanceStrk"] -= amount
        treasury["shieldedBalanceStrk"] += amount
        treasury["availableShieldedStrk"] += amount
    elif tx_type == "UNSHIELD":
        result = unshield_strk(amount, data.get("recipient"))
        tx_hash = result["txHash"]
        utxo = f"0xutxo_{result['blockNumber']}"
        treasury["shieldedBalanceStrk"] -= amount
        treasury["availableShieldedStrk"] -= amount
        treasury["publicBalanceStrk"] += amount
    elif tx_type == "PRIVATE_TRANSFER":
        if not data.get("recipient"):
            raise ValueError("Recipient required for private transfer")
        result = private_transfer(data["recipient"], amount)
        tx_hash = result["txHash"]
        utxo = f"0xutxo_{result['blockNumber']}"
        treasury["availableShieldedStrk"] -= amount
        treasury["committedBountyStrk"] += amount
    else:
        raise ValueError(f"Unknown transaction type: {tx_type}")

    new_tx = {
        "id": f"tx-{int(time.time()*1000):x}",
        "type": tx_type, "amountStrk": amount,
        "txHash": tx_hash, "utxoCommitment": utxo,
        "status": "CONFIRMED", "timestamp": _now(),
        "memo": data.get("memo", ""),
    }
    if not treasury.get("transactions"):
        treasury["transactions"] = []
    treasury["transactions"].insert(0, new_tx)
    db = read_db()
    db["treasury"] = treasury
    write_db(db)
    append_audit_block(f"STRK20_{tx_type}_EXECUTED", {"amountStrk": amount, "txHash": tx_hash, "utxoCommitment": utxo})
    return {"treasury": treasury, "transaction": new_tx}
