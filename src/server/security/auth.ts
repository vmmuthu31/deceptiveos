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
}

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ciphernest-dev-secret-key-998877665544'
);

const COOKIE_NAME = 'cipher_token';

// In-Memory User Store (Fallback / Database Pooler Ready Interface)
const userStore: Map<string, UserRecord> = new Map();

// Seed Initial Admin User
const defaultHash = bcrypt.hashSync('Password123!', 10);
const defaultAdmin: UserRecord = {
  id: 'usr_admin_01',
  email: 'mvairamuthu2003@ciphernest.ai',
  name: 'mvairamuthu2003',
  organization: 'Cyber Deception Ops',
  role: 'admin',
  passwordHash: defaultHash,
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

export async function registerUserAccount(data: {
  email: string;
  password: string;
  name: string;
  organization?: string;
}): Promise<{ user: UserProfile; token: string }> {
  const normalizedEmail = data.email.toLowerCase();

  if (userStore.has(normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = await hashPassword(data.password);
  const newUser: UserRecord = {
    id: `usr_${Date.now().toString(36)}`,
    email: normalizedEmail,
    name: data.name,
    organization: data.organization || 'SecOps Team',
    role: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  userStore.set(normalizedEmail, newUser);

  const { passwordHash: _, ...profile } = newUser;
  const token = await createSessionToken(profile);

  return { user: profile, token };
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

