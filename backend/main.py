"""
CipherNest Python Adversarial Deception Engine — Master Daemon
Orchestrates FastAPI server (port 8000), SSH Honeypots (port 2222),
and Steganography Beacon Receivers (port 8001).
"""

# Load .env from project root before anything else reads os.environ
import os as _os
_env_path = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), ".env")
try:
    from dotenv import load_dotenv as _load_dotenv
    _load_dotenv(_env_path, override=False)
except ImportError:
    # Fallback: parse .env manually
    if _os.path.exists(_env_path):
        for _line in open(_env_path):
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                _v = _v.strip().strip('"').strip("'")
                _os.environ.setdefault(_k.strip(), _v)

import asyncio
import http.server
import json
import os
import socketserver
import sys
import threading
import time
from datetime import datetime

# Ensure backend/ is in sys.path so `api` package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ssh_honeypot import start_ssh_honeypot
from stego_engine import decode_zw_to_token

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ciphernest-store.json")
BEACON_PORT  = int(os.environ.get("BEACON_PORT",  8001))
HONEYPOT_PORT = int(os.environ.get("HONEYPOT_PORT", 2222))
API_PORT     = int(os.environ.get("API_PORT",     8000))


# ─── Beacon HTTP receiver ─────────────────────────────────────────────────────

class BeaconHttpHandler(http.server.BaseHTTPRequestHandler):
    """Real HTTP callback beacon receiver for exfiltrated steganographic lure documents."""

    def do_GET(self):
        token = self.path.split("token=")[-1] if "token=" in self.path else "unknown"
        client_ip = self.client_address[0]
        user_agent = self.headers.get("User-Agent", "Unknown Document Viewer")

        print(f"[Beacon Alert] Lure Document opened from {client_ip} (Token: {token})")

        try:
            db = {"beacons": []}
            if os.path.exists(DB_PATH):
                with open(DB_PATH, "r", encoding="utf-8") as f:
                    db = json.load(f)

            beacon_event = {
                "id": f"beacon-{int(time.time()*1000)}",
                "lureId": "lure-live-01",
                "documentTitle": "Exfiltrated Corporate Asset",
                "watermarkToken": token,
                "sourceIp": client_ip,
                "location": "External Host / Exfiltration Node",
                "userAgent": user_agent,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            db.setdefault("beacons", []).insert(0, beacon_event)
            with open(DB_PATH, "w", encoding="utf-8") as f:
                json.dump(db, f, indent=2)
        except Exception as e:
            print(f"[Beacon Log Error]: {e}")

        # Return a 1×1 transparent tracking pixel
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        pixel = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
            b'\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00'
            b'\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4'
            b'\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        self.wfile.write(pixel)

    def log_message(self, format, *args):
        pass  # suppress default access logs


def run_beacon_server():
    """Run beacon callback receiver on background thread."""
    try:
        with socketserver.TCPServer(("0.0.0.0", BEACON_PORT), BeaconHttpHandler) as httpd:
            print(f"[*] CipherNest Beacon Receiver active on port {BEACON_PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"[Beacon Server Notice]: {e}")


# ─── FastAPI / uvicorn ────────────────────────────────────────────────────────

def run_fastapi():
    """Run FastAPI server via uvicorn on API_PORT (default 8000)."""
    try:
        import uvicorn
        print(f"[*] CipherNest FastAPI server starting on port {API_PORT}")
        uvicorn.run(
            "api.app:app",
            host="0.0.0.0",
            port=API_PORT,
            log_level="warning",
            access_log=False,
        )
    except ImportError:
        print("[!] uvicorn not installed — FastAPI server skipped. Run: pip3 install -r backend/requirements.txt")
    except Exception as e:
        print(f"[FastAPI Error]: {e}")


# ─── Entry point ──────────────────────────────────────────────────────────────

async def main():
    if "--test" in sys.argv:
        print("[+] CipherNest Python Deception Core Health Check: OK")
        sys.exit(0)

    print("=================================================================")
    print("  CipherNest Adversarial AI Defense Engine — Python Core         ")
    print(f"  FastAPI REST Server:   0.0.0.0:{API_PORT}")
    print(f"  Live SSH Honeypot:     0.0.0.0:{HONEYPOT_PORT}")
    print(f"  Lure Beacon Receiver:  0.0.0.0:{BEACON_PORT}")
    print("=================================================================")

    # Start FastAPI (uvicorn) on a daemon thread
    t_api = threading.Thread(target=run_fastapi, daemon=True)
    t_api.start()

    # Start beacon receiver on a daemon thread
    t_beacon = threading.Thread(target=run_beacon_server, daemon=True)
    t_beacon.start()

    # Run SSH honeypot (asyncio — blocks until cancelled)
    # Port 2222 requires root on Linux/Mac; falls back to keep API + beacon alive
    try:
        await start_ssh_honeypot(port=HONEYPOT_PORT)
    except PermissionError:
        print(f"[SSH Honeypot] ⚠️  Cannot bind port {HONEYPOT_PORT} (try: sudo python3 backend/main.py, or set HONEYPOT_PORT=2223)")
        print("[SSH Honeypot] FastAPI + Beacon still running. Press Ctrl+C to quit.")
        # Keep running so FastAPI + beacon threads stay alive
        try:
            while True:
                await asyncio.sleep(60)
        except asyncio.CancelledError:
            pass
    except Exception as e:
        print(f"[SSH Honeypot] Error: {e} — continuing without SSH honeypot")
        try:
            while True:
                await asyncio.sleep(60)
        except asyncio.CancelledError:
            pass


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[!] Shutting down CipherNest Python Core.")
