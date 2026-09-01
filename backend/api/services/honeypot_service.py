"""Honeypot service — port of src/server/services/honeypot.service.ts"""
import os, secrets, subprocess, platform
from datetime import datetime, timezone
from ..db import read_db, write_db, append_audit_block

def _now(): return datetime.now(timezone.utc).isoformat()

def check_docker_status() -> dict:
    try:
        out = subprocess.check_output(
            ['docker','ps','--format','{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}'],
            timeout=3, stderr=subprocess.DEVNULL
        ).decode()
        containers = []
        for line in out.strip().splitlines():
            if not line: continue
            parts = (line + "|||").split("|")
            containers.append({"id": parts[0], "name": parts[1], "status": parts[2], "ports": parts[3]})
        return {"available": True, "activeContainersCount": len(containers), "containers": containers}
    except Exception:
        return {"available": False, "activeContainersCount": 0, "containers": []}

def get_all_honeypots() -> list:
    return read_db().get("honeypots", [])

def create_honeypot(data: dict) -> dict:
    db = read_db()
    container_id = secrets.token_hex(8)
    started = False
    try:
        subprocess.run(
            ['docker','run','-d','--name',f'cipher-{container_id}',
             '-p',f'{data["port"]}:{data["port"]}',
             '--label','ciphernest.honeypot=true',
             'ciphernest-honeypot-01'],  # built from docker/Dockerfile.honeypot
            timeout=4, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        started = True
    except Exception:
        pass
    hp = {
        "id": f"hp-{data['type'].lower()}-{int(__import__('time').time()*1000):x}",
        "name": data["name"], "type": data["type"],
        "status": "active" if started else "error",
        "port": data["port"], "ip": "127.0.0.1",
        "containerId": container_id,
        "twinSyncEnabled": data.get("twinSyncEnabled", False),
        "temporalJitterMs": data.get("temporalJitterMs", 200),
        "activeSessionsCount": 0, "totalEventsCount": 0,
        "createdAt": _now(),
    }
    honeypots = db.get("honeypots", [])
    honeypots.append(hp)
    db["honeypots"] = honeypots
    write_db(db)
    append_audit_block("HONEYPOT_DECOY_CREATED", {"id": hp["id"], "type": hp["type"], "port": hp["port"]})
    return hp

def toggle_honeypot(hp_id: str):
    db = read_db()
    hp = next((h for h in db.get("honeypots", []) if h["id"] == hp_id), None)
    if not hp: return None
    new_status = "stopped" if hp["status"] == "active" else "active"
    hp["status"] = new_status
    try:
        cmd = "stop" if new_status == "stopped" else "start"
        subprocess.run(['docker', cmd, f'cipher-{hp["containerId"]}'],
                       timeout=3, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass
    write_db(db)
    append_audit_block("HONEYPOT_STATUS_TOGGLED", {"id": hp["id"], "newStatus": new_status})
    return hp

def get_digital_twin_metadata() -> dict:
    import socket, os as _os
    hostname = socket.gethostname()
    os_info = f"{platform.system()} {platform.release()}"
    arch = platform.machine()
    import psutil
    ifaces = list(psutil.net_if_addrs().keys()) if hasattr(psutil, "net_if_addrs") else ["lo", "eth0"]
    cwd = _os.getcwd()
    dirs = []
    try:
        for item in _os.listdir(cwd):
            if not item.startswith("."):
                full = _os.path.join(cwd, item)
                if _os.path.isdir(full):
                    dirs.append(item)
    except Exception:
        dirs = ["src", "public", "backend", "data"]
    return {
        "hostname": hostname,
        "osRelease": os_info,
        "architecture": arch,
        "activePortRange": f"2222-2225 (Ifaces: {', '.join(ifaces)[:30]})",
        "directoryNaming": list(set(dirs))[:8],
        "filePatterns": ["*.env", "*.config.json", "package.json", "tsconfig.json"],
        "lastSyncedAt": _now(),
        "syncApproved": True,
    }
