import { NextRequest } from "next/server";
import { getMemberById } from "./db";
import { UserContext, Role } from "./types";

export async function getUserFromRequest(
  request: NextRequest
): Promise<UserContext | null> {
  try {
    // Try to get user ID from request headers or body
    const authHeader = request.headers.get("x-user-id");
    if (!authHeader) {
      return null;
    }

    const members = await getMemberById(authHeader);
    if (!members || members.length === 0) {
      return null;
    }

    const member = members[0];
    
    // Handle both legacy (single role) and new (roles array) member formats  
    const memberRole = (member as any).role || 'bv';
    
    return {
      id: member.id,
      name: member.name,
      email: (member as any).email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@myband.local`,
      roles: [memberRole],
      isAdmin: memberRole === "admin",
      mustChangePassword: false, // Legacy auth doesn't require password change
    };
  } catch (error) {
    console.error("❌ Error getting user from request:", error);
    return null;
  }
}

export function requireAdmin(userContext: UserContext | null): boolean {
  return userContext !== null && userContext.isAdmin;
}

export function requireRole(
  userContext: UserContext | null,
  requiredRole: string
): boolean {
  return userContext !== null && userContext.roles.includes(requiredRole as Role);
}

export function canAccessStats(userContext: UserContext | null): boolean {
  // Only admins can access stats
  return userContext !== null && userContext.isAdmin;
}

export function canCreateEvents(userContext: UserContext | null): boolean {
  // Only admins can create events
  return userContext !== null && userContext.isAdmin;
}
