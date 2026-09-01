"""
CipherNest Auth — Python port of src/server/security/auth.ts
bcrypt + JWT (PyJWT) + PostgreSQL (asyncpg/psycopg2) with in-memory fallback.
"""
import hashlib
import os
import secrets
import time
from datetime import datetime, timezone
from typing import Optional

import bcrypt
import jwt

JWT_SECRET = os.environ.get("JWT_SECRET", "ciphernest-prod-jwt-key-334455667788")
JWT_ALGO = "HS256"
JWT_EXP_SECS = 60 * 60 * 24 * 7  # 7 days
COOKIE_NAME = "cipher_token"

# In-memory fallback stores
_user_store: dict[str, dict] = {}
_reset_store: dict[str, dict] = {}

# PostgreSQL pool (optional)
_db_pool = None

def _init_pg():
    global _db_pool
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return
    try:
        import psycopg2
        from psycopg2 import pool as pg_pool
        _db_pool = pg_pool.ThreadedConnectionPool(1, 5, dsn=db_url)
        _ensure_tables()
    except Exception as e:
        print(f"[Auth] PostgreSQL init failed (using in-memory fallback): {e}")
        print("[Auth] ⚠️  WARNING: Users registered now will be LOST on restart. Set DATABASE_URL in .env for persistence.")
        _db_pool = None

def _ensure_tables():
    if not _db_pool:
        return
    try:
        conn = _db_pool.getconn()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                organization VARCHAR(255) NOT NULL,
                role VARCHAR(32) NOT NULL DEFAULT 'admin',
                password_hash TEXT NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                otp_code VARCHAR(16),
                otp_expires_at BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS password_resets (
                token VARCHAR(128) PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                expires_at BIGINT NOT NULL
            );
        """)
        conn.commit()
        cur.close()
        _db_pool.putconn(conn)
    except Exception as e:
        print(f"[Auth] Table init error: {e}")

_init_pg()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(10)).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_session_token(user: dict) -> str:
    payload = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "organization": user["organization"],
        "role": user["role"],
        "isVerified": user.get("isVerified", False),
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXP_SECS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_session_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return {
            "id": payload["id"],
            "email": payload["email"],
            "name": payload["name"],
            "organization": payload["organization"],
            "role": payload["role"],
            "isVerified": payload.get("isVerified", False),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    except Exception:
        return None


def _pg_query(sql: str, params: tuple = ()) -> Optional[list]:
    if not _db_pool:
        return None
    try:
        conn = _db_pool.getconn()
        cur = conn.cursor()
        cur.execute(sql, params)
        if cur.description:
            cols = [d[0] for d in cur.description]
            rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        else:
            rows = []
        conn.commit()
        cur.close()
        _db_pool.putconn(conn)
        return rows
    except Exception as e:
        print(f"[Auth] PG query error: {e}")
        return None


def find_user_by_email(email: str) -> Optional[dict]:
    normalized = email.lower()
    rows = _pg_query("SELECT * FROM users WHERE LOWER(email) = %s LIMIT 1", (normalized,))
    if rows:
        row = rows[0]
        return {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "organization": row["organization"],
            "role": row["role"],
            "passwordHash": row["password_hash"],
            "isVerified": row["is_verified"],
            "otpCode": row.get("otp_code"),
            "otpExpiresAt": int(row["otp_expires_at"]) if row.get("otp_expires_at") else None,
            "createdAt": row["created_at"].isoformat() if row.get("created_at") else datetime.now(timezone.utc).isoformat(),
        }
    return _user_store.get(normalized)


def register_pending_user(data: dict) -> dict:
    normalized = data["email"].lower()
    existing = find_user_by_email(normalized)
    if existing and existing.get("isVerified"):
        raise ValueError("An account with this email address already exists and is verified.")
    pw_hash = hash_password(data["password"])
    otp_code = str(secrets.randbelow(900000) + 100000)
    otp_expires_at = int(time.time() * 1000) + 600_000
    user_id = existing["id"] if existing else f"usr_{int(time.time() * 1000):x}"
    organization = data.get("organization") or "SecOps Team"
    rows = _pg_query(
        """INSERT INTO users (id, email, name, organization, role, password_hash, is_verified, otp_code, otp_expires_at)
           VALUES (%s, %s, %s, %s, 'admin', %s, false, %s, %s)
           ON CONFLICT (email) DO UPDATE SET
             name = EXCLUDED.name, organization = EXCLUDED.organization,
             password_hash = EXCLUDED.password_hash, otp_code = EXCLUDED.otp_code,
             otp_expires_at = EXCLUDED.otp_expires_at""",
        (user_id, normalized, data["name"], organization, pw_hash, otp_code, otp_expires_at),
    )
    if rows is None:
        # in-memory fallback
        _user_store[normalized] = {
            "id": user_id, "email": normalized, "name": data["name"],
            "organization": organization, "role": "admin",
            "passwordHash": pw_hash, "isVerified": False,
            "otpCode": otp_code, "otpExpiresAt": otp_expires_at,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    return {"email": normalized, "otpCode": otp_code}


def verify_user_otp(email: str, otp_code: str) -> dict:
    normalized = email.lower()
    user = find_user_by_email(normalized)
    if not user:
        raise ValueError("User registration record not found.")
    if user.get("isVerified"):
        token = create_session_token(user)
        profile = {k: v for k, v in user.items() if k not in ("passwordHash", "otpCode", "otpExpiresAt")}
        return {"user": profile, "token": token}
    if user.get("otpCode") != otp_code.strip():
        raise ValueError("Invalid OTP verification code.")
    if user.get("otpExpiresAt") and int(time.time() * 1000) > user["otpExpiresAt"]:
        raise ValueError("OTP code has expired. Please request a new verification code.")
    user["isVerified"] = True
    user.pop("otpCode", None)
    user.pop("otpExpiresAt", None)
    _pg_query("UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE LOWER(email) = %s", (normalized,))
    _user_store[normalized] = user
    profile = {k: v for k, v in user.items() if k != "passwordHash"}
    token = create_session_token(profile)
    return {"user": profile, "token": token}


def resend_user_otp(email: str) -> str:
    normalized = email.lower()
    user = find_user_by_email(normalized)
    if not user:
        raise ValueError("User registration record not found.")
    if user.get("isVerified"):
        raise ValueError("Account is already verified. You can log in directly.")
    new_otp = str(secrets.randbelow(900000) + 100000)
    new_exp = int(time.time() * 1000) + 600_000
    rows = _pg_query("UPDATE users SET otp_code = %s, otp_expires_at = %s WHERE LOWER(email) = %s", (new_otp, new_exp, normalized))
    if rows is None:
        user["otpCode"] = new_otp
        user["otpExpiresAt"] = new_exp
        _user_store[normalized] = user
    return new_otp


def authenticate_login(email: str, password: str) -> dict:
    normalized = email.lower()
    user = find_user_by_email(normalized)
    if not user:
        raise ValueError("Invalid email or password.")
    if not verify_password(password, user["passwordHash"]):
        raise ValueError("Invalid email or password.")
    profile = {k: v for k, v in user.items() if k not in ("passwordHash", "otpCode", "otpExpiresAt")}
    token = create_session_token(profile)
    return {"user": profile, "token": token}


def get_admin_emails() -> list[str]:
    rows = _pg_query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL")
    if rows:
        return [r["email"] for r in rows]
    return [u["email"] for u in _user_store.values() if u.get("role") == "admin"]


def create_password_reset_token(email: str) -> str:
    normalized = email.lower()
    user = find_user_by_email(normalized)
    if not user:
        raise ValueError("No user account found with that email address.")
    token = f"rst_{secrets.token_hex(32)}"
    expires_at = int(time.time() * 1000) + 3_600_000
    rows = _pg_query("INSERT INTO password_resets (token, email, expires_at) VALUES (%s, %s, %s)", (token, normalized, expires_at))
    if rows is None:
        _reset_store[token] = {"email": normalized, "expiresAt": expires_at}
    return token


def reset_user_password(token: str, new_password: str) -> bool:
    email = None
    expires_at = None
    rows = _pg_query("SELECT * FROM password_resets WHERE token = %s LIMIT 1", (token,))
    if rows:
        email = rows[0]["email"]
        expires_at = int(rows[0]["expires_at"])
    if not email:
        record = _reset_store.get(token)
        if record:
            email = record["email"]
            expires_at = record["expiresAt"]
    if not email:
        raise ValueError("Invalid or expired password reset link.")
    if int(time.time() * 1000) > expires_at:
        _pg_query("DELETE FROM password_resets WHERE token = %s", (token,))
        _reset_store.pop(token, None)
        raise ValueError("Password reset link has expired. Please request a new one.")
    pw_hash = hash_password(new_password)
    _pg_query("UPDATE users SET password_hash = %s WHERE LOWER(email) = %s", (pw_hash, email))
    _pg_query("DELETE FROM password_resets WHERE token = %s", (token,))
    user = _user_store.get(email)
    if user:
        user["passwordHash"] = pw_hash
    _reset_store.pop(token, None)
    return True
