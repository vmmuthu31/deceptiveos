"""Email service — Python port of src/server/services/email.service.ts using smtplib."""
import os, smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from ..auth import get_admin_emails

SMTP_HOST = os.environ.get("SMTP_HOST","smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT","587"))
SMTP_USER = os.environ.get("SMTP_USER","")
SMTP_PASS = os.environ.get("SMTP_PASS","").replace(" ","")
SMTP_FROM = os.environ.get("SMTP_FROM","") or (f"CipherNest Security <{SMTP_USER}>" if SMTP_USER else "CipherNest Security <alerts@ciphernest.ai>")

def _recipients(override: str | None = None) -> list[str]:
    if override and override.strip():
        return [override.strip()]
    return get_admin_emails()

def _send(to: list[str], subject: str, html: str) -> dict:
    if not to:
        return {"success": False, "error": "No recipients configured"}
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = ", ".join(to)
    msg.attach(MIMEText(html, "html"))
    try:
        if SMTP_PORT == 465:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=10) as s:
                s.login(SMTP_USER, SMTP_PASS)
                s.sendmail(SMTP_FROM, to, msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as s:
                s.ehlo()
                s.starttls()
                s.login(SMTP_USER, SMTP_PASS)
                s.sendmail(SMTP_FROM, to, msg.as_string())
        return {"success": True, "messageId": f"<{os.urandom(8).hex()}@ciphernest>"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def send_test_email(recipient: str | None = None) -> dict:
    to = _recipients(recipient)
    html = f"""<div style="font-family:Arial,sans-serif;background-color:#f8fafc;padding:24px;border-radius:12px;color:#0f172a;">
<h2 style="color:#2563eb;margin-top:0;">CipherNest Security Alert System</h2>
<p>This is a verified test notification confirming your <strong>SMTP Integration</strong> is operational.</p>
<div style="background:#fff;padding:16px;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;">
<p><strong>Status:</strong> OPERATIONAL</p>
<p><strong>SMTP Server:</strong> {SMTP_HOST}:{SMTP_PORT}</p>
<p><strong>Sender:</strong> {SMTP_FROM}</p>
<p><strong>Recipients:</strong> {', '.join(to)}</p>
</div></div>"""
    return _send(to, "🚨 [CipherNest] Security Alert Engine Test Notification", html)

def send_otp_email(email: str, otp: str) -> bool:
    html = f"""<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:28px;border-radius:12px;color:#0f172a;max-width:540px;">
<h2 style="color:#2563eb;">CIPHER<span style="color:#0f172a;">NEST</span></h2>
<h3>Verify Your Email Address</h3>
<p>Enter this 6-digit code to complete your registration:</p>
<div style="text-align:center;margin:24px 0;">
<div style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-size:28px;letter-spacing:8px;display:inline-block;font-family:monospace;">{otp}</div>
</div>
<p style="font-size:12px;color:#64748b;text-align:center;">Valid for <strong>10 minutes</strong>.</p></div>"""
    r = _send([email], f"🔑 [CipherNest] {otp} is your Email Verification Code", html)
    return r["success"]

def send_password_reset_email(email: str, token: str) -> bool:
    app_url = os.environ.get("NEXT_PUBLIC_APP_URL","http://localhost:3000")
    reset_url = f"{app_url}/reset-password?token={token}"
    html = f"""<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:28px;border-radius:12px;color:#0f172a;max-width:540px;">
<h2 style="color:#2563eb;">CIPHER<span style="color:#0f172a;">NEST</span></h2>
<h3>Password Reset Request</h3>
<p>Click the button below to reset your password. Valid for <strong>1 hour</strong>.</p>
<div style="text-align:center;margin:24px 0;">
<a href="{reset_url}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;">Reset Password Now →</a>
</div>
<div style="background:#fff;padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:11px;word-break:break-all;">{reset_url}</div></div>"""
    r = _send([email], "🔐 [CipherNest] Password Reset Request", html)
    return r["success"]

def send_breach_alert(event: dict) -> bool:
    to = _recipients()
    html = f"""<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;border-radius:12px;color:#0f172a;">
<h2 style="color:#ef4444;">🚨 Critical Honeypot Breach Detected</h2>
<div style="background:#fff;padding:16px;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;">
<p><strong>Honeypot:</strong> {event.get('honeypotName')}</p>
<p><strong>Attacker IP:</strong> {event.get('attackerIp')} ({event.get('location')})</p>
<p><strong>Type:</strong> {event.get('kind','').upper()}</p>
<p><strong>Payload:</strong> {event.get('payload')}</p>
<p><strong>Timestamp:</strong> {event.get('timestamp')}</p></div></div>"""
    r = _send(to, f"🚨 [CRITICAL] Honeypot Breach on {event.get('honeypotName')}", html)
    return r["success"]

def send_beacon_alert(beacon: dict) -> bool:
    to = _recipients()
    html = f"""<div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;border-radius:12px;color:#0f172a;">
<h2 style="color:#f59e0b;">⚠️ Steganographic Watermark Beacon Triggered</h2>
<div style="background:#fff;padding:16px;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;">
<p><strong>Document:</strong> {beacon.get('documentTitle')}</p>
<p><strong>Token:</strong> {beacon.get('watermarkToken')}</p>
<p><strong>Exfil IP:</strong> {beacon.get('sourceIp')} ({beacon.get('location')})</p>
<p><strong>User Agent:</strong> {beacon.get('userAgent')}</p></div></div>"""
    r = _send(to, f"⚠️ [CANARY ALERT] Watermark Beacon Triggered: {beacon.get('documentTitle')}", html)
    return r["success"]
