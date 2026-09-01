"""
CipherNest FastAPI Backend
Replaces all 32 Next.js /app/api/* routes with real Python endpoints.
Runs on port 8000. Next.js rewrites /api/* → http://localhost:8000/api/*
"""
import hashlib, os, secrets, time
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, EmailStr, field_validator

from .db import read_db, write_db, append_audit_block, verify_audit_chain
from .utils import calculate_shannon_entropy
from .auth import (
    verify_session_token, authenticate_login, register_pending_user,
    verify_user_otp, resend_user_otp, create_password_reset_token,
    reset_user_password, get_admin_emails,
)
from .services.ai_service import (
    check_opencode_health, generate_ssh_response, classify_attacker,
    generate_lure_document, OPENCODE_MODELS,
)
from .services.fingerprint_service import get_all_events, get_all_attacker_profiles, add_session_event
from .services.honeypot_service import get_all_honeypots, create_honeypot, toggle_honeypot, get_digital_twin_metadata, check_docker_status
from .services.lure_service import get_all_lures, get_lure_by_id, create_lure, get_all_beacons, record_beacon_hit
from .services.mcp_deception_service import get_all_decoys, get_all_invocations, get_all_canaries, create_decoy, trigger_decoy, export_mcp_config
from .services.compliance_service import get_compliance_summary, generate_compliance_report
from .services.export_service import generate_stix_bundle, generate_sigma_rules
from .services.network_service import get_anonymized_threat_graph
from .services.response_service import get_all_containment_actions, execute_containment
from .services.effectiveness_service import get_effectiveness_score
from .services.attack_graph_service import get_correlated_campaigns
from .services.starknet_service import get_starknet_status
from .services.treasury_service import get_treasury, execute_transaction
from .services.bounty_service import get_all_bounties, fund_bounty, claim_bounty
from .services.email_service import (
    send_test_email, send_otp_email, send_password_reset_email,
)

app = FastAPI(title="CipherNest API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "app://.", "file://"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COOKIE_NAME = "cipher_token"

def _now(): return datetime.now(timezone.utc).isoformat()

def _get_current_user(cipher_token: Optional[str]) -> Optional[dict]:
    if not cipher_token:
        return None
    return verify_session_token(cipher_token)

def _require_user(cipher_token: Optional[str]) -> dict:
    user = _get_current_user(cipher_token)
    if not user:
        raise HTTPException(401, "Unauthorized")
    return user

def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    return real or (request.client.host if request.client else "127.0.0.1")

# ─────────────────────── AUTH ───────────────────────

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class RegisterBody(BaseModel):
    email: EmailStr
    password: str
    name: str
    organization: Optional[str] = None

class VerifyOtpBody(BaseModel):
    email: EmailStr
    otpCode: str

class ResendOtpBody(BaseModel):
    email: EmailStr

class ForgotPasswordBody(BaseModel):
    email: EmailStr

class ResetPasswordBody(BaseModel):
    token: str
    newPassword: str

@app.post("/api/auth/login")
async def auth_login(body: LoginBody, response: Response):
    try:
        result = authenticate_login(body.email, body.password)
        response.set_cookie(COOKIE_NAME, result["token"], httponly=True, samesite="lax", path="/", max_age=604800)
        return {"success": True, "user": result["user"]}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/auth/register")
async def auth_register(body: RegisterBody):
    try:
        result = register_pending_user(body.model_dump())
        email_sent = send_otp_email(result["email"], result["otpCode"])
        return {"success": True, "requiresOtp": True, "email": result["email"], "emailSent": email_sent, "otpCode": result["otpCode"]}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.get("/api/auth/me")
async def auth_me(cipher_token: Optional[str] = Cookie(None)):
    user = _get_current_user(cipher_token)
    if not user:
        return {"authenticated": False, "user": None}
    return {"authenticated": True, "user": user}

@app.post("/api/auth/logout")
async def auth_logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"success": True, "message": "Logged out successfully"}

@app.post("/api/auth/verify-otp")
async def auth_verify_otp(body: VerifyOtpBody, response: Response):
    try:
        result = verify_user_otp(body.email, body.otpCode)
        response.set_cookie(COOKIE_NAME, result["token"], httponly=True, samesite="lax", path="/", max_age=604800)
        return {"success": True, "user": result["user"]}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/auth/resend-otp")
async def auth_resend_otp(body: ResendOtpBody):
    try:
        new_otp = resend_user_otp(body.email)
        email_sent = send_otp_email(body.email, new_otp)
        return {"success": True, "emailSent": email_sent, "message": "A new OTP verification code has been sent to your email.", "otpCode": new_otp}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/auth/forgot-password")
async def auth_forgot_password(body: ForgotPasswordBody):
    try:
        token = create_password_reset_token(body.email)
        send_password_reset_email(body.email, token)
        return {"success": True, "message": "Password reset link sent! Check your email inbox.", "token": token}
    except ValueError as e:
        raise HTTPException(400, str(e))

@app.post("/api/auth/reset-password")
async def auth_reset_password(body: ResetPasswordBody):
    try:
        reset_user_password(body.token, body.newPassword)
        return {"success": True, "message": "Password reset successfully! You can now log in with your new password."}
    except ValueError as e:
        raise HTTPException(400, str(e))

# ─────────────────────── EVENTS ───────────────────────

@app.get("/api/events")
async def get_events():
    return {"success": True, "events": get_all_events()}

@app.post("/api/events")
async def post_event(request: Request):
    try:
        body = await request.json()
        event = add_session_event(body)
        return JSONResponse({"success": True, "event": event}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

# ─────────────────────── ALERTS ───────────────────────

@app.get("/api/alerts")
async def get_alerts():
    return {"success": True, "profiles": get_all_attacker_profiles()}

# ─────────────────────── HONEYPOTS ───────────────────────

@app.get("/api/honeypots")
async def get_honeypots():
    return {"success": True, "honeypots": get_all_honeypots()}

class CreateHoneypotBody(BaseModel):
    name: str
    type: str
    port: int
    temporalJitterMs: int = 200
    twinSyncEnabled: bool = False

@app.post("/api/honeypots")
async def post_honeypot(body: CreateHoneypotBody):
    try:
        hp = create_honeypot(body.model_dump())
        return JSONResponse({"success": True, "honeypot": hp}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

@app.patch("/api/honeypots")
async def patch_honeypot(request: Request):
    try:
        body = await request.json()
        hp_id = body.get("id")
        result = toggle_honeypot(hp_id)
        if not result:
            raise HTTPException(404, "Honeypot not found")
        return {"success": True, "honeypot": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))

@app.get("/api/honeypots/twin")
async def get_twin():
    try:
        meta = get_digital_twin_metadata()
        return {"success": True, "metadata": meta}
    except Exception as e:
        raise HTTPException(500, str(e))

# ─────────────────────── LURES ───────────────────────

@app.get("/api/lures")
async def get_lures():
    return {"success": True, "lures": get_all_lures()}

class CreateLureBody(BaseModel):
    title: str
    docType: str
    targetCompany: str
    industry: str
    customContext: Optional[str] = None

@app.post("/api/lures")
async def post_lure(body: CreateLureBody):
    try:
        result = create_lure(body.model_dump())
        return JSONResponse({"success": True, "lure": result["lure"], "content": result["documentContent"]}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

@app.get("/api/lures/beacon")
async def get_beacons():
    return {"success": True, "beacons": get_all_beacons()}

class BeaconHitBody(BaseModel):
    watermarkToken: str
    sourceIp: Optional[str] = None
    userAgent: Optional[str] = None

@app.post("/api/lures/beacon")
async def post_beacon(body: BeaconHitBody, request: Request):
    ip = body.sourceIp or _client_ip(request)
    ua = body.userAgent or request.headers.get("user-agent","")
    beacon = record_beacon_hit(body.watermarkToken, ip, ua)
    if not beacon:
        raise HTTPException(404, "Invalid watermark token")
    return {"success": True, "beacon": beacon}

@app.get("/api/lures/download/{lure_id}")
async def download_lure(lure_id: str):
    result = get_lure_by_id(lure_id)
    if not result:
        raise HTTPException(404, "Lure document not found")
    filename = result["lure"].get("title") or f"lure_{lure_id}.txt"
    ctype = "text/plain; charset=utf-8"
    if filename.endswith(".json"): ctype = "application/json; charset=utf-8"
    elif filename.endswith(".csv"): ctype = "text/csv; charset=utf-8"
    return Response(content=result["content"], media_type=ctype,
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})

# ─────────────────────── MCP DECEPTION ───────────────────────

@app.get("/api/mcp-deception")
async def get_mcp_deception(request: Request):
    try:
        export_fmt = request.query_params.get("export")
        if export_fmt:
            config = export_mcp_config(export_fmt)
            return {"format": export_fmt, "config": config}
        decoys = get_all_decoys()
        invocations = get_all_invocations()
        canaries = get_all_canaries()
        total_triggers = sum(d.get("triggerCount",0) for d in decoys)
        return {
            "decoys": decoys, "invocations": invocations, "promptCanaries": canaries,
            "stats": {
                "totalDecoys": len(decoys), "totalTriggers": total_triggers,
                "activeCanaries": len(canaries),
                "criticalSeverityCount": sum(1 for i in invocations if i.get("riskScore",0) >= 90),
            },
        }
    except Exception as e:
        raise HTTPException(500, str(e))

class CreateDecoyBody(BaseModel):
    name: str
    description: str
    category: str
    parametersSchema: Optional[dict] = None

@app.post("/api/mcp-deception")
async def post_mcp_decoy(body: CreateDecoyBody):
    try:
        decoy = create_decoy(body.model_dump())
        return JSONResponse({"success": True, "decoy": decoy}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

class TriggerDecoyBody(BaseModel):
    toolId: str
    callerIp: Optional[str] = None
    agentPersona: Optional[str] = None
    promptSnippet: Optional[str] = None
    argumentsReceived: Optional[dict] = None

@app.post("/api/mcp-deception/trigger")
async def post_trigger(body: TriggerDecoyBody, request: Request):
    try:
        ip = _client_ip(request) or body.callerIp or "127.0.0.1"
        data = body.model_dump()
        data["callerIp"] = ip
        result = trigger_decoy(data)
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))

# ─────────────────────── ANALYTICS ───────────────────────

@app.get("/api/analytics/attack-graph")
async def get_attack_graph():
    try:
        campaigns = get_correlated_campaigns()
        return {"campaigns": campaigns, "count": len(campaigns), "timestamp": _now()}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/analytics/score")
async def get_score():
    score = get_effectiveness_score()
    return {"success": True, "score": score}

# ─────────────────────── NETWORK ───────────────────────

@app.get("/api/network")
async def get_network():
    return {"success": True, "nodes": get_anonymized_threat_graph()}

# ─────────────────────── COMPLIANCE ───────────────────────

@app.get("/api/compliance")
async def get_compliance():
    summary = get_compliance_summary()
    return {"success": True, "summary": summary}

@app.post("/api/compliance")
async def post_compliance():
    content = generate_compliance_report()
    return Response(content=content, media_type="text/plain; charset=utf-8",
                    headers={"Content-Disposition": 'attachment; filename="CipherNest_SOC2_Evidence_Report.txt"'})

@app.get("/api/compliance/verify")
async def get_compliance_verify():
    result = verify_audit_chain()
    return {"success": True, **result}

# ─────────────────────── EXPORT ───────────────────────

@app.get("/api/export/sigma")
async def export_sigma():
    content = generate_sigma_rules()
    return Response(content=content, media_type="text/yaml; charset=utf-8",
                    headers={"Content-Disposition": 'attachment; filename="CipherNest_Sigma_Detection_Rules.yml"'})

@app.get("/api/export/stix")
async def export_stix():
    content = generate_stix_bundle()
    return Response(content=content, media_type="application/json; charset=utf-8",
                    headers={"Content-Disposition": 'attachment; filename="CipherNest_STIX2.1_ThreatIntel.json"'})

# ─────────────────────── RESPONSE / CONTAINMENT ───────────────────────

@app.get("/api/response/action")
async def get_actions():
    try:
        return {"actions": get_all_containment_actions()}
    except Exception as e:
        raise HTTPException(500, str(e))

class ContainmentBody(BaseModel):
    type: str
    targetId: str
    targetName: str
    reason: Optional[str] = None

@app.post("/api/response/action")
async def post_action(body: ContainmentBody):
    try:
        action = execute_containment(body.model_dump())
        return {"success": True, "action": action}
    except Exception as e:
        raise HTTPException(400, str(e))

# ─────────────────────── BOUNTIES ───────────────────────

@app.get("/api/bounties")
async def get_bounties():
    return {"success": True, "bounties": get_all_bounties()}

class FundBountyBody(BaseModel):
    dnaFingerprint: Optional[str] = None
    title: str
    description: str
    rewardStrk: float
    mitreTtps: Optional[list[str]] = None

@app.post("/api/bounties")
async def post_bounty(body: FundBountyBody):
    try:
        bounty = fund_bounty(body.model_dump())
        return JSONResponse({"success": True, "bounty": bounty}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

class ClaimBountyBody(BaseModel):
    bountyId: str
    intelligenceReport: str
    researcherAddress: str

@app.patch("/api/bounties")
async def patch_bounty(body: ClaimBountyBody):
    try:
        bounty = claim_bounty(body.bountyId, body.intelligenceReport, body.researcherAddress)
        if not bounty:
            raise HTTPException(404, "Bounty not found")
        return {"success": True, "bounty": bounty}
    except (ValueError, HTTPException) as e:
        if isinstance(e, HTTPException): raise
        raise HTTPException(400, str(e))

# ─────────────────────── STARKNET ───────────────────────

@app.get("/api/starknet")
async def get_starknet():
    status = get_starknet_status()
    return {"success": True, "status": status}

# ─────────────────────── TREASURY ───────────────────────

@app.get("/api/treasury")
async def get_treasury_route():
    return {"success": True, "treasury": get_treasury()}

class TreasuryTxBody(BaseModel):
    type: str
    amountStrk: float
    recipient: Optional[str] = None
    memo: str

@app.post("/api/treasury")
async def post_treasury(body: TreasuryTxBody):
    try:
        result = execute_transaction(body.model_dump())
        return JSONResponse({"success": True, **result}, status_code=201)
    except Exception as e:
        raise HTTPException(400, str(e))

# ─────────────────────── EMAIL ───────────────────────

class TestEmailBody(BaseModel):
    recipient: Optional[str] = None

@app.post("/api/email/test")
async def post_email_test(request: Request):
    try:
        body = {}
        try:
            body = await request.json()
        except Exception:
            pass
        result = send_test_email(body.get("recipient"))
        if result["success"]:
            return {"success": True, "messageId": result.get("messageId")}
        raise HTTPException(500, result.get("error","Failed to send test email"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, str(e))

# ─────────────────────── AI / SSH ───────────────────────

@app.get("/api/ai/models")
async def get_ai_models():
    health = check_opencode_health()
    key = os.environ.get("OPENCODE_API_KEY","").strip()
    model = os.environ.get("OPENCODE_MODEL","mimo-v2.5-free")
    return {
        "activeProvider": health["provider"],
        "activeModel": health["model"],
        "openCodeKeyStatus": "Configured (Active)" if key else "Not Set (Set OPENCODE_API_KEY in .env)",
        "configuredOpenCodeModel": model,
        "availableOpenCodeModels": OPENCODE_MODELS,
        "health": health,
    }

@app.get("/api/ollama")
async def get_ollama():
    health = check_opencode_health()
    return {"success": True, "health": health}

class SshBody(BaseModel):
    command: str
    history: Optional[list[str]] = []

@app.post("/api/ollama")
async def post_ollama(body: SshBody):
    try:
        result = generate_ssh_response(body.command, body.history or [])
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(400, str(e))

class AiSshBody(BaseModel):
    command: str
    history: Optional[list[str]] = []
    honeypotId: str = "hp-cowrie-01"
    sessionId: Optional[str] = None

@app.post("/api/ai/ssh")
async def post_ai_ssh(body: AiSshBody, request: Request):
    if not body.command or not isinstance(body.command, str):
        raise HTTPException(400, "Command is required")
    session_id = body.sessionId or f"sess-{secrets.token_hex(4)}"
    result = generate_ssh_response(body.command, body.history or [])
    history = list(body.history or []) + [body.command]
    classification = classify_attacker(history)
    db = read_db()
    ts = _now()
    entropy = calculate_shannon_entropy(body.command)
    dna = hashlib.sha256(";".join(history).encode()).hexdigest()[:8].upper()
    attacker_ip = _client_ip(request)
    event = next((e for e in db.get("events",[]) if e.get("sessionId") == session_id), None)
    if not event:
        event = {
            "id": f"evt-{int(time.time()*1000):x}",
            "sessionId": session_id, "honeypotId": body.honeypotId,
            "honeypotName": "SSH Core Decoy (Interactive Sandbox)",
            "attackerIp": attacker_ip, "location": "Local Session",
            "kind": "command_exec", "payload": body.command,
            "timestamp": ts, "commands": [],
        }
        events = db.get("events", [])
        events.insert(0, event)
        db["events"] = events
    event["commands"].append({
        "id": f"cmd-{int(time.time()*1000):x}",
        "sessionId": session_id, "honeypotId": body.honeypotId,
        "timestamp": ts, "command": body.command,
        "output": result["output"], "executionDelayMs": result["delayMs"],
        "entropyScore": entropy,
    })
    write_db(db)
    append_audit_block("INTERACTIVE_COMMAND_EXECUTED", {
        "command": body.command, "outputSnippet": result["output"][:40],
        "delayMs": result["delayMs"], "dna": f"DNA: {dna}",
    })
    return {
        "success": True, "command": body.command,
        "output": result["output"], "delayMs": result["delayMs"],
        "entropyScore": entropy, "classification": classification,
        "dnaFingerprint": f"DNA: {dna}",
    }

# ─────────────────────── HEALTH ───────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "CipherNest Python API", "timestamp": _now()}

@app.get("/api/docker/status")
async def docker_status():
    return check_docker_status()
