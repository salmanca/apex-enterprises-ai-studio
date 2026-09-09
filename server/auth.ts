import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, AdminUser } from './db.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'apex-enterprises-secure-admin-secret-key-2026';

// In-memory rate limiting tracker for failed attempts
interface FailedAttemptInfo {
  count: number;
  lockedUntil?: number;
}
const loginAttempts: Map<string, FailedAttemptInfo> = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginRateLimit(identifier: string): { isLocked: boolean; waitSeconds?: number } {
  const key = identifier.toLowerCase().trim();
  const attempt = loginAttempts.get(key);
  if (!attempt) return { isLocked: false };

  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return { isLocked: true, waitSeconds };
  }

  // Lockout expired, reset if needed
  if (attempt.lockedUntil && attempt.lockedUntil <= Date.now()) {
    loginAttempts.delete(key);
  }

  return { isLocked: false };
}

export function recordFailedLoginAttempt(identifier: string): { remainingAttempts: number; isLocked: boolean; waitSeconds?: number } {
  const key = identifier.toLowerCase().trim();
  const attempt = loginAttempts.get(key) || { count: 0 };
  attempt.count += 1;

  if (attempt.count >= MAX_FAILED_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    loginAttempts.set(key, attempt);
    return {
      remainingAttempts: 0,
      isLocked: true,
      waitSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
    };
  }

  loginAttempts.set(key, attempt);
  return {
    remainingAttempts: MAX_FAILED_ATTEMPTS - attempt.count,
    isLocked: false
  };
}

export function clearLoginAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  loginAttempts.delete(key);
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin authentication token required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized. User does not exist or has been disabled.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized or expired session token. Please log in again.' });
  }
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAdmin(req, res, () => {
    if (req.user?.role !== 'super_admin') {
      res.status(403).json({ error: 'Forbidden. Super Administrator privileges required for this action.' });
      return;
    }
    next();
  });
}
