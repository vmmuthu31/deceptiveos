"""AI service — port of src/server/services/ai.service.ts"""
import os, time, random
import urllib.request, json

OPENCODE_MODELS = [
    {"id": "mimo-v2.5-free", "name": "MiMo-V2.5 Free", "provider": "Xiaomi / OpenCode"},
    {"id": "hy3-free", "name": "Hy3 Free", "provider": "Stealth / OpenCode"},
    {"id": "laguna-s-2.1-free", "name": "Laguna S 2.1 Free", "provider": "Stealth / OpenCode"},
    {"id": "nemotron-3-ultra-free", "name": "Nemotron 3 Ultra Free", "provider": "NVIDIA / OpenCode"},
    {"id": "nemotron-3.5-lightning-free", "name": "Nemotron 3.5 Lightning Free", "provider": "NVIDIA / OpenCode"},
    {"id": "deepseek-v4-flash-free", "name": "DeepSeek V4 Flash Free", "provider": "DeepSeek / OpenCode"},
]

def _opencode_key():
    return os.environ.get("OPENCODE_API_KEY", "").strip()

def _opencode_model():
    m = os.environ.get("OPENCODE_MODEL", "mimo-v2.5-free")
    return m if m.startswith("opencode/") else f"opencode/{m}"

def check_opencode_health() -> dict:
    key = _opencode_key()
    model = _opencode_model()
    if not key:
        return {"available": False, "model": model, "provider": "OpenCode API Zen (Key Required in .env)", "latencyMs": 0}
    start = time.time()
    try:
        req = urllib.request.Request(
            "https://opencode.ai/zen/v1/models",
            headers={"Authorization": f"Bearer {key}"},
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            latency = int((time.time() - start) * 1000)
            return {"available": r.status == 200, "model": model, "provider": "OpenCode API Zen (Cloud)", "latencyMs": latency}
    except Exception:
        return {"available": False, "model": model, "provider": "OpenCode API Zen (Cloud)", "latencyMs": int((time.time() - start) * 1000)}


def _temporal_delay(command: str) -> int:
    cmd = command.lower().strip()
    if any(x in cmd for x in ("find", "grep", "locate")):
        return random.randint(1200, 2600)
    if any(x in cmd for x in ("openssl", "gpg", "ssh-keygen")):
        return random.randint(700, 1500)
    if any(x in cmd for x in ("nmap", "curl", "wget", "netstat")):
        return random.randint(400, 1000)
    return random.randint(80, 330)


def _opencode_chat(messages: list, temperature: float = 0.2) -> str | None:
    key = _opencode_key()
    if not key:
        return None
    body = json.dumps({"model": _opencode_model(), "messages": messages, "temperature": temperature}).encode()
    req = urllib.request.Request(
        "https://opencode.ai/zen/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"OpenCode API Error: {e}"


def generate_ssh_response(command: str, history: list[str]) -> dict:
    delay = _temporal_delay(command)
    key = _opencode_key()
    if not key:
        return {
            "output": "[CipherNest Security Notice]: Please set OPENCODE_API_KEY in your .env file to enable live AI honeypot SSH response synthesis.",
            "delayMs": delay,
        }
    system_prompt = (
        "You are simulating a vulnerable Linux server terminal shell for an SSH honeypot. "
        "Respond ONLY with the raw Linux shell output for the given command. "
        "No markdown, no triple backticks, no explanations. Make it look 100% authentic to Ubuntu Linux 24.04."
    )
    user_prompt = f"Prior command history:\n{chr(10).join(history[-5:])}\n\nUser command: {command}"
    output = _opencode_chat([{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}], 0.2)
    return {"output": output or f"[SSH response generation failed]", "delayMs": delay}


def classify_attacker(commands: list[str]) -> dict:
    if not commands:
        return {"classification": "HumanOperator", "confidence": 0.5, "summary": "No commands observed."}
    avg_len = sum(len(c) for c in commands) / len(commands)
    has_long = any(len(c) > 120 for c in commands)
    has_auto = any(x in c.lower() for c in commands for x in ("nmap", "sqlmap", "hydra", "masscan", "zmap"))
    has_script = any(x in c.lower() for c in commands for x in ("python", "perl", "ruby", "eval", "import"))
    unique = len({c.split()[0].lower() for c in commands})
    variety = unique / len(commands)
    score = 0.0
    signals = []
    if has_auto: score += 0.3; signals.append("automated scanning tools")
    if has_script: score += 0.2; signals.append("scripting language usage")
    if has_long: score += 0.15; signals.append("long structured commands")
    if avg_len > 60: score += 0.1; signals.append("above-average command complexity")
    if variety < 0.3 and len(commands) > 3: score += 0.15; signals.append("low command variety (repetitive)")
    if score >= 0.5:
        return {"classification": "AIAgent", "confidence": round(min(0.98, 0.7 + score * 0.3), 2), "summary": f"Autonomous agent indicators: {', '.join(signals)}."}
    if score >= 0.25 or len(commands) <= 2:
        return {"classification": "ScriptKiddie", "confidence": round(min(0.95, 0.6 + score * 0.4), 2), "summary": f"Basic tool usage: {', '.join(signals) or 'limited command set'}."}
    return {"classification": "HumanOperator", "confidence": round(max(0.5, 0.85 - score * 0.3), 2), "summary": "Interactive manual session with varied commands."}


def generate_lure_document(doc_type: str, company: str, industry: str) -> str:
    key = _opencode_key()
    if not key:
        return "[CipherNest Security Notice]: Please set OPENCODE_API_KEY in your .env file to generate live semantic lure documents."
    prompt = (
        f'Generate a realistic confidential {doc_type} document for a company named "{company}" '
        f"operating in the {industry} industry. Include authentic internal hostnames, project names, "
        f"or financial metadata. Do not state that this is fake."
    )
    return _opencode_chat([{"role": "user", "content": prompt}], 0.7) or f"[Lure generation failed]"
