import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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
  process.env.JWT_SECRET || 'ciphernest-dev-secret-key-998877665544'
);

const COOKIE_NAME = 'cipher_token';

// In-Memory User Store (Fallback / Database Pooler Ready Interface)
const userStore: Map<string, UserRecord> = new Map();

// Seed Initial Admin User (Pre-verified)
const defaultHash = bcrypt.hashSync('Password123!', 10);
const defaultAdmin: UserRecord = {
  id: 'usr_admin_01',
  email: 'mvairamuthu2003@ciphernest.ai',
  name: 'mvairamuthu2003',
  organization: 'Cyber Deception Ops',
  role: 'admin',
  passwordHash: defaultHash,
  isVerified: true,
  createdAt: new Date().toISOString(),
};
userStore.set(defaultAdmin.email.toLowerCase(), defaultAdmin);

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

export function findUserByEmail(email: string): UserRecord | undefined {
  return userStore.get(email.toLowerCase());
}

export async function registerPendingUserAccount(data: {
  email: string;
  password: string;
  name: string;
  organization?: string;
}): Promise<{ email: string; otpCode: string }> {
  const normalizedEmail = data.email.toLowerCase();

  const existing = userStore.get(normalizedEmail);
  if (existing && existing.isVerified) {
    throw new Error('An account with this email address already exists and is verified.');
  }

  const passwordHash = await hashPassword(data.password);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes

  const pendingUser: UserRecord = {
    id: existing?.id || `usr_${Date.now().toString(36)}`,
    email: normalizedEmail,
    name: data.name,
    organization: data.organization || 'SecOps Team',
    role: 'admin',
    passwordHash,
    isVerified: false,
    otpCode,
    otpExpiresAt,
    createdAt: new Date().toISOString(),
  };

  userStore.set(normalizedEmail, pendingUser);
  return { email: normalizedEmail, otpCode };
}

export async function verifyUserOtp(data: {
  email: string;
  otpCode: string;
}): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.toLowerCase();
  const user = userStore.get(normalizedEmail);

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

  // Mark account as verified
  user.isVerified = true;
  delete user.otpCode;
  delete user.otpExpiresAt;
  userStore.set(normalizedEmail, user);

  const { passwordHash: _, ...profile } = user;
  const token = await createSessionToken(profile);
  return { user: profile, token };
}

export async function resendUserOtp(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase();
  const user = userStore.get(normalizedEmail);

  if (!user) {
    throw new Error('User registration record not found.');
  }

  if (user.isVerified) {
    throw new Error('Account is already verified. You can log in directly.');
  }

  const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = newOtpCode;
  user.otpExpiresAt = Date.now() + 1000 * 60 * 10;
  userStore.set(normalizedEmail, user);

  return newOtpCode;
}

export async function authenticateUserLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.toLowerCase();
  const userRecord = userStore.get(normalizedEmail);

  if (!userRecord) {
    throw new Error('Invalid email or password.');
  }

  const isValid = await verifyPassword(data.password, userRecord.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  const { passwordHash: _, ...profile } = userRecord;
  const token = await createSessionToken(profile);

  return { user: profile, token };
}

export function getAdminUserEmails(): string[] {
  const adminEmails: string[] = [];
  for (const user of userStore.values()) {
    if (user.role === 'admin' && user.email) {
      adminEmails.push(user.email);
    }
  }
  return adminEmails.length > 0 ? adminEmails : ['mvairamuthu2003@ciphernest.ai'];
}

// Reset Token Store (token -> { email, expiresAt })
const resetTokenStore: Map<string, { email: string; expiresAt: number }> = new Map();

export async function createPasswordResetToken(email: string): Promise<string> {
  const normalized = email.toLowerCase();
  const user = userStore.get(normalized);
  if (!user) {
    throw new Error('No user account found with that email address.');
  }

  const token = `rst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour validity

  resetTokenStore.set(token, { email: normalized, expiresAt });
  return token;
}

export async function resetUserPassword(token: string, newPassword: string): Promise<boolean> {
  const record = resetTokenStore.get(token);
  if (!record) {
    throw new Error('Invalid or expired password reset link.');
  }

  if (Date.now() > record.expiresAt) {
    resetTokenStore.delete(token);
    throw new Error('Password reset link has expired. Please request a new one.');
  }

  const user = userStore.get(record.email);
  if (!user) {
    throw new Error('User account not found.');
  }

  user.passwordHash = await hashPassword(newPassword);
  userStore.set(record.email, user);
  resetTokenStore.delete(token);

  return true;
}


