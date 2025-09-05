import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Member, UserContext, AuthResponse } from './types';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-development-secret-key';
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: UserContext): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode a JWT token (client-safe version)
 */
export function verifyTokenClient(token: string): any {
  try {
    // For client-side, we'll do basic parsing without verification
    // The server will handle proper verification
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode a JWT token (server-only version)
 */
export function verifyToken(token: string): any {
  // Only use this on the server side
  if (typeof window !== 'undefined') {
    return verifyTokenClient(token);
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Convert Member to UserContext (excluding sensitive data)
 */
export function memberToUserContext(member: Member): UserContext {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    roles: member.roles,
    isAdmin: member.is_admin,
    mustChangePassword: member.must_change_password,
    lastLogin: member.last_login,
  };
}

/**
 * Generate a secure random password
 */
export function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Generate email from member name (for migration)
 */
export function generateEmailFromName(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    + '@myband.local';
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if user has specific role
 */
export function hasRole(user: UserContext, role: string): boolean {
  return user.roles.includes(role as any);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserContext, roles: string[]): boolean {
  return roles.some(role => user.roles.includes(role as any));
}
