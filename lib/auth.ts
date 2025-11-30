import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { cookies } from 'next/headers';

// Configuration with fallbacks for development
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production-32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '604800', 10); // 7 days
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export interface TokenPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Increased rounds for better security
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Check if account is locked
export async function isAccountLocked(userId: number): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });
  
  if (!user?.lockedUntil) return false;
  return user.lockedUntil > new Date();
}

// Record failed login attempt
export async function recordFailedLogin(userId: number): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { failedLogins: true },
  });
  
  const newFailedCount = (user?.failedLogins || 0) + 1;
  const shouldLock = newFailedCount >= MAX_FAILED_LOGINS;
  
  await db.user.update({
    where: { id: userId },
    data: {
      failedLogins: newFailedCount,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION) : null,
    },
  });
}

// Reset failed login attempts
export async function resetFailedLogins(userId: number): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      failedLogins: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

// Get session expiry date
export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE * 1000);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Check if session exists and is valid
    const session = await db.session.findFirst({
      where: {
        userId: payload.userId,
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      return null;
    }

    // Get user with roles and permissions
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return null;
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions: [...new Set(permissions)],
    };
  } catch {
    return null;
  }
}

// Invalidate all sessions for a user
export async function invalidateAllSessions(userId: number): Promise<void> {
  await db.session.deleteMany({
    where: { userId },
  });
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

export async function hasPermission(
  user: { permissions: string[] },
  resource: string,
  action: string
): Promise<boolean> {
  const permission = `${resource}:${action}`;
  return user.permissions.includes(permission) || user.permissions.includes(`${resource}:*`);
}

export async function hasRole(user: { roles: string[] }, roleName: string): Promise<boolean> {
  return user.roles.includes(roleName);
}

export async function isAdmin(user: { roles: string[] }): Promise<boolean> {
  return user.roles.includes('admin') || user.roles.includes('superadmin');
}

