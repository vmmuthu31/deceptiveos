"""
CipherNest Real SSH Interactive Honeypot Daemon
Listens on live TCP socket, delivers real-time Ollama counter-agent responses,
and records forensic attacker DNA telemetry.
"""

import asyncio
import json
import os
import random
import re
import socket
import sys
import time
import hashlib
import urllib.request
from datetime import datetime
from typing import Dict, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ciphernest-store.json")

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")

SYSTEM_PROMPT = """You are a Linux bash terminal on an Ubuntu 24.04 LTS server (hostname: core-prod-01, user: root).
Respond ONLY with the exact realistic stdout/stderr output of the executed command.
Do not include any conversational filler, explanation, or markdown formatting.
Simulate real corporate production server contents:
- Directory structure includes /opt/app, /var/log, /etc, /root, /home/admin
- Files contain corporate config, docker-compose.yml, environment secrets, and databases.
If an attacker runs 'id', output 'uid=0(root) gid=0(root) groups=0(root)'.
If an attacker runs 'uname -a', output 'Linux core-prod-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'."""

FALLBACK_COMMANDS = {
    "id": "uid=0(root) gid=0(root) groups=0(root)",
    "whoami": "root",
    "uname -a": "Linux core-prod-01 6.8.0-40-generic #40-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux",
    "hostname": "core-prod-01",
    "pwd": "/root",
    "ls": "backup.sh  docker-compose.yml  production.env  vault_key.pem",
    "ls -la": "total 32\ndrwx------ 4 root root 4096 Aug 12 14:10 .\ndrwxr-xr-x 20 root root 4096 Aug 10 11:20 ..\n-rwxr-xr-x 1 root root  420 Aug 12 14:12 backup.sh\n-rw-r--r-- 1 root root 1240 Aug 12 14:10 docker-compose.yml\n-rw------- 1 root root  890 Aug 12 14:15 production.env\n-rw------- 1 root root 1675 Aug 12 14:10 vault_key.pem",
    "cat /etc/passwd": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nadmin:x:1000:1000:admin:/home/admin:/bin/bash\npostgres:x:1001:1001:PostgreSQL server:/var/lib/postgresql:/bin/bash\nsecops:x:1002:1002:SecOps Agent:/home/secops:/bin/bash",
    "cat production.env": "APP_ENV=production\nDATABASE_URL=postgresql://vault_admin:Sup3rS3cr3t2026!@10.0.4.12:5432/core_db\nSTRIPE_SECRET_KEY=sk_live_51M_CYBERDECEPT_TRAP_KEY\nAWS_ACCESS_KEY_ID=AKIA99881122334455\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY99881122",
    "ps aux": "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1 168340 11240 ?        Ss   Aug10   0:04 /sbin/init\nroot       412  0.1  0.8 740120 68400 ?        Ssl  Aug10   1:12 /usr/bin/dockerd\npostgres   890  0.0  1.2 920400 98200 ?        Ss   Aug10   0:45 postgres: core_db\nroot      1402  0.0  0.2 120400 18400 pts/0    Ss   14:20   0:00 -bash",
    "netstat -tulpn": "Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      812/sshd\ntcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      890/postgres\ntcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN      1104/node",
}

def query_ollama(command: str) -> Optional[str]:
    """Attempt local Ollama LLM counter-generation."""
    try:
        payload = json.dumps({
            "model": OLLAMA_MODEL,
            "prompt": f"Command: {command}",
            "system": SYSTEM_PROMPT,
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 250}
        }).encode('utf-8')
        
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get("response", "").strip()
    except Exception:
        return None

def get_command_output(command: str) -> str:
    """Generate dynamic command response using Ollama with heuristic fallback."""
    clean_cmd = command.strip().lower()
    
    # 1. Try Ollama LLM first for non-templated AI-first deception
    ollama_resp = query_ollama(clean_cmd)
    if ollama_resp and len(ollama_resp) > 0:
        return ollama_resp
    
    # 2. Check predefined realistic outputs
    if clean_cmd in FALLBACK_COMMANDS:
        return FALLBACK_COMMANDS[clean_cmd]
    
    for k, v in FALLBACK_COMMANDS.items():
        if clean_cmd.startswith(k):
            return v
            
    if clean_cmd.startswith("cat "):
        filename = clean_cmd.split(" ", 1)[1]
        return f"# {filename}\n[CONFIDENTIAL CIPHERNEST RECON ASSET]\nTOKEN=tok_live_vault_{hashlib.md5(filename.encode()).hexdigest()[:12]}"
    elif clean_cmd.startswith("cd "):
        return ""
    elif clean_cmd.startswith("curl ") or clean_cmd.startswith("wget "):
        return "HTTP/1.1 200 OK\nContent-Type: application/octet-stream\nSaving to: payload.bin [100%]"
    
    return f"bash: {command.split()[0] if command.split() else command}: command not found"

def save_session_event(
    session_id: str,
    client_ip: str,
    command: str,
    output: str,
    delay_ms: int
):
    """Write real-time attacker session event into data/ciphernest-store.json."""
    try:
        db = {"events": [], "attackerProfiles": [], "honeypots": []}
        if os.path.exists(DB_PATH):
            with open(DB_PATH, "r", encoding="utf-8") as f:
                db = json.load(f)
        
        timestamp = datetime.utcnow().isoformat() + "Z"
        cmd_event = {
            "id": f"cmd-{int(time.time()*1000)}",
            "sessionId": session_id,
            "honeypotId": "hp-live-ssh-01",
            "timestamp": timestamp,
            "command": command,
            "output": output,
            "executionDelayMs": delay_ms,
            "entropyScore": round(random.uniform(3.2, 4.8), 2)
        }
        
        # Find existing session or create new
        existing_session = None
        for evt in db.get("events", []):
            if evt.get("sessionId") == session_id:
                existing_session = evt
                break
        
        if existing_session:
            existing_session.setdefault("commands", []).append(cmd_event)
            existing_session["payload"] = f"{existing_session['payload']}; {command}"
        else:
            new_session = {
                "id": f"evt-{int(time.time()*1000)}",
                "sessionId": session_id,
                "honeypotId": "hp-live-ssh-01",
                "honeypotName": "Live SSH Linux Terminal (Port 2222)",
                "attackerIp": client_ip,
                "location": "Local / Interactive Shell",
                "kind": "command_exec",
                "payload": command,
                "timestamp": timestamp,
                "commands": [cmd_event]
            }
            db.setdefault("events", []).insert(0, new_session)
        
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"[Honeypot Telemetry Error]: {e}", file=sys.stderr)

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    """Handle interactive terminal session for connected attacker."""
    addr = writer.get_extra_info('peername')
    client_ip = addr[0] if addr else "127.0.0.1"
    session_id = f"sess-{hashlib.md5(f'{client_ip}{time.time()}'.encode()).hexdigest()[:8]}"
    
    print(f"[SSH Honeypot] Attacker connection from {client_ip}:{addr[1] if addr else '?'}")
    
    banner = "SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13\r\n"
    writer.write(banner.encode('utf-8'))
    await writer.drain()
    
    # Prompt loop
    prompt = "root@core-prod-01:~# "
    writer.write(prompt.encode('utf-8'))
    await writer.drain()
    
    try:
        while True:
            line = await reader.readline()
            if not line:
                break
            
            command = line.decode('utf-8', errors='ignore').strip()
            if not command:
                writer.write(prompt.encode('utf-8'))
                await writer.drain()
                continue
            
            if command in ["exit", "quit", "logout"]:
                writer.write(b"logout\r\nConnection to core-prod-01 closed.\r\n")
                await writer.drain()
                break
            
            # Realistic timing jitter (50 - 450ms) to fool automated AI scanners
            delay_ms = random.randint(50, 450)
            await asyncio.sleep(delay_ms / 1000.0)
            
            output = get_command_output(command)
            save_session_event(session_id, client_ip, command, output, delay_ms)
            
            formatted_output = f"{output}\r\n{prompt}"
            writer.write(formatted_output.encode('utf-8'))
            await writer.drain()
    except Exception as e:
        print(f"[SSH Honeypot Error] {e}")
    finally:
        writer.close()
        await writer.wait_closed()
        print(f"[SSH Honeypot] Connection closed for {client_ip}")

async def start_ssh_honeypot(host: str = "0.0.0.0", port: int = 2222):
    """Start the live SSH honeypot TCP server."""
    server = await asyncio.start_server(handle_client, host, port)
    print(f"[*] CipherNest Live SSH Honeypot listening on {host}:{port}")
    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("HONEYPOT_PORT", 2222))
    asyncio.run(start_ssh_honeypot(port=port))
