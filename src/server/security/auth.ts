import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { Pool } from 'pg';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  organization: string;
  role: 'admin' | 'analyst';
  createdAt: string;
}

export interface UserRecord extends UserProfile {
  passwordHash: string;
  isVerified?: boolean;
  otpCode?: string;
  otpExpiresAt?: number;
}

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ciphernest-prod-jwt-key-334455667788'
);

const COOKIE_NAME = 'cipher_token';

// Real PostgreSQL Pool (Connected via DATABASE_URL)
let dbPool: Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } catch {
    dbPool = null;
  }
}

// In-Memory User Store (Empty runtime store, NO HARDCODED INITIAL SEEDS)
const runtimeUserStore: Map<string, UserRecord> = new Map();
const runtimeResetStore: Map<string, { email: string; expiresAt: number }> = new Map();

// Helper to initialize PostgreSQL tables
async function ensureTablesExist() {
  if (!dbPool) return;
  try {
    await dbPool.query(`
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
    `);
  } catch (err) {
    console.error('PostgreSQL Table Init Notice:', err);
  }
}

// Fire table check non-blocking
ensureTablesExist().catch(() => {});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: UserProfile): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    organization: user.organization,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<UserProfile | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      organization: payload.organization as string,
      role: payload.role as 'admin' | 'analyst',
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const normalized = email.toLowerCase();

  if (dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          email: row.email,
          name: row.name,
          organization: row.organization,
          role: row.role,
          passwordHash: row.password_hash,
          isVerified: row.is_verified,
          otpCode: row.otp_code,
          otpExpiresAt: row.otp_expires_at ? Number(row.otp_expires_at) : undefined,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        };
      }
    } catch {
      // Fallthrough
    }
  }

  return runtimeUserStore.get(normalized);
}

export async function registerPendingUserAccount(data: {
  email: string;
  password: string;
  name: string;
  organization?: string;
}): Promise<{ email: string; otpCode: string }> {
  const normalizedEmail = data.email.toLowerCase();

  const existing = await findUserByEmail(normalizedEmail);
  if (existing && existing.isVerified) {
    throw new Error('An account with this email address already exists and is verified.');
  }

  const passwordHash = await hashPassword(data.password);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes
  const userId = existing?.id || `usr_${Date.now().toString(36)}`;
  const organization = data.organization || 'SecOps Team';

  if (dbPool) {
    try {
      await dbPool.query(
        `INSERT INTO users (id, email, name, organization, role, password_hash, is_verified, otp_code, otp_expires_at)
         VALUES ($1, $2, $3, $4, 'admin', $5, false, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           organization = EXCLUDED.organization,
           password_hash = EXCLUDED.password_hash,
           otp_code = EXCLUDED.otp_code,
           otp_expires_at = EXCLUDED.otp_expires_at`,
        [userId, normalizedEmail, data.name, organization, passwordHash, otpCode, otpExpiresAt]
      );
      return { email: normalizedEmail, otpCode };
    } catch (err: any) {
      console.error('PostgreSQL Register Error:', err);
    }
  }

  // Runtime store fallback if DB is not attached
  const pendingUser: UserRecord = {
    id: userId,
    email: normalizedEmail,
    name: data.name,
    organization,
    role: 'admin',
    passwordHash,
    isVerified: false,
    otpCode,
    otpExpiresAt,
    createdAt: new Date().toISOString(),
  };

  runtimeUserStore.set(normalizedEmail, pendingUser);
  return { email: normalizedEmail, otpCode };
}

export async function verifyUserOtp(data: {
  email: string;
  otpCode: string;
}): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error('User registration record not found.');
  }

  if (user.isVerified) {
    const { passwordHash: _, otpCode: __, otpExpiresAt: ___, ...profile } = user;
    const token = await createSessionToken(profile);
    return { user: profile, token };
  }

  if (!user.otpCode || user.otpCode !== data.otpCode.trim()) {
    throw new Error('Invalid OTP verification code.');
  }

  if (user.otpExpiresAt && Date.now() > user.otpExpiresAt) {
    throw new Error('OTP code has expired. Please request a new verification code.');
  }

  user.isVerified = true;
  delete user.otpCode;
  delete user.otpExpiresAt;

  if (dbPool) {
    try {
      await dbPool.query(
        `UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE LOWER(email) = $1`,
        [normalizedEmail]
      );
    } catch (err) {
      console.error('PostgreSQL Verify Error:', err);
    }
  }

  runtimeUserStore.set(normalizedEmail, user);

  const { passwordHash: _, ...profile } = user;
  const token = await createSessionToken(profile);
  return { user: profile, token };
}

export async function resendUserOtp(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error('User registration record not found.');
  }

  if (user.isVerified) {
    throw new Error('Account is already verified. You can log in directly.');
  }

  const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const newExpiresAt = Date.now() + 1000 * 60 * 10;

  if (dbPool) {
    try {
      await dbPool.query(
        `UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE LOWER(email) = $3`,
        [newOtpCode, newExpiresAt, normalizedEmail]
      );
      return newOtpCode;
    } catch {
      // Fallthrough
    }
  }

  user.otpCode = newOtpCode;
  user.otpExpiresAt = newExpiresAt;
  runtimeUserStore.set(normalizedEmail, user);

  return newOtpCode;
}

export async function authenticateUserLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.toLowerCase();
  const userRecord = await findUserByEmail(normalizedEmail);

  if (!userRecord) {
    throw new Error('Invalid email or password.');
  }

  const isValid = await verifyPassword(data.password, userRecord.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const { passwordHash: _, otpCode: __, otpExpiresAt: ___, ...profile } = userRecord;
  const token = await createSessionToken(profile);

  return { user: profile, token };
}

export async function getAdminUserEmails(): Promise<string[]> {
  if (dbPool) {
    try {
      const res = await dbPool.query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL");
      if (res.rows.length > 0) {
        return res.rows.map((r: { email: string }) => r.email);
      }
    } catch {
      // Fallthrough
    }
  }

  const adminEmails: string[] = [];
  for (const user of runtimeUserStore.values()) {
    if (user.role === 'admin' && user.email) {
      adminEmails.push(user.email);
    }
  }

  return adminEmails;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const normalized = email.toLowerCase();
  const user = await findUserByEmail(normalized);
  if (!user) {
    throw new Error('No user account found with that email address.');
  }

  const token = `rst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour validity

  if (dbPool) {
    try {
      await dbPool.query(
        `INSERT INTO password_resets (token, email, expires_at) VALUES ($1, $2, $3)`,
        [token, normalized, expiresAt]
      );
      return token;
    } catch {
      // Fallthrough
    }
  }

  runtimeResetStore.set(token, { email: normalized, expiresAt });
  return token;
}

export async function resetUserPassword(token: string, newPassword: string): Promise<boolean> {
  let email: string | null = null;
  let expiresAt: number | null = null;

  if (dbPool) {
    try {
      const res = await dbPool.query('SELECT * FROM password_resets WHERE token = $1 LIMIT 1', [token]);
      if (res.rows.length > 0) {
        email = res.rows[0].email;
        expiresAt = Number(res.rows[0].expires_at);
      }
    } catch {
      // Fallthrough
    }
  }

  if (!email) {
    const record = runtimeResetStore.get(token);
    if (record) {
      email = record.email;
      expiresAt = record.expiresAt;
    }
  }

  if (!email || !expiresAt) {
    throw new Error('Invalid or expired password reset link.');
  }

  if (Date.now() > expiresAt) {
    if (dbPool) {
      await dbPool.query('DELETE FROM password_resets WHERE token = $1', [token]).catch(() => {});
    }
    runtimeResetStore.delete(token);
    throw new Error('Password reset link has expired. Please request a new one.');
  }

  const passwordHash = await hashPassword(newPassword);

  if (dbPool) {
    try {
      await dbPool.query('UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2', [passwordHash, email]);
      await dbPool.query('DELETE FROM password_resets WHERE token = $1', [token]);
    } catch {
      // Fallthrough
    }
  }

  const user = runtimeUserStore.get(email);
  if (user) {
    user.passwordHash = passwordHash;
    runtimeUserStore.set(email, user);
  }
  runtimeResetStore.delete(token);

  return true;
}
