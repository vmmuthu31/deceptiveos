"""
CipherNest Python Adversarial Deception Engine — Master Daemon
Orchestrates live SSH Honeypots, Steganography Beacon Receivers, and Forensic Telemetry.
"""

import asyncio
import http.server
import json
import os
import signal
import socketserver
import sys
import threading
import time
from datetime import datetime

from ssh_honeypot import start_ssh_honeypot
from stego_engine import decode_zw_to_token

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ciphernest-store.json")
BEACON_PORT = int(os.environ.get("BEACON_PORT", 8001))
HONEYPOT_PORT = int(os.environ.get("HONEYPOT_PORT", 2222))

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
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            db.setdefault("beacons", []).insert(0, beacon_event)
            with open(DB_PATH, "w", encoding="utf-8") as f:
                json.dump(db, f, indent=2)
        except Exception as e:
            print(f"[Beacon Log Error]: {e}")
            
        # Return a 1x1 transparent tracking pixel
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # Minimal 1x1 transparent PNG
        pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        self.wfile.write(pixel)
        
    def log_message(self, format, *args):
        pass

def run_beacon_server():
    """Run beacon callback receiver on background thread."""
    try:
        with socketserver.TCPServer(("0.0.0.0", BEACON_PORT), BeaconHttpHandler) as httpd:
            print(f"[*] CipherNest Beacon Receiver active on port {BEACON_PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"[Beacon Server Notice]: {e}")

async def main():
    if "--test" in sys.argv:
        print("[+] CipherNest Python Deception Core Health Check: OK")
        sys.exit(0)
        
    print("=================================================================")
    print("  CipherNest Adversarial AI Defense Engine — Real Python Core    ")
    print(f"  Live SSH Honeypot:    0.0.0.0:{HONEYPOT_PORT}")
    print(f"  Lure Beacon Receiver: 0.0.0.0:{BEACON_PORT}")
    print("=================================================================")
    
    # Start beacon receiver thread
    t = threading.Thread(target=run_beacon_server, daemon=True)
    t.start()
    
    # Start live SSH Honeypot
    await start_ssh_honeypot(port=HONEYPOT_PORT)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[!] Shutting down CipherNest Python Core.")
