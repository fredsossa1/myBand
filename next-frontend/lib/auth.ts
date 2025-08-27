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
    return {
      id: member.id,
      name: member.name,
      role: member.role as Role,
      isAdmin: member.role === "admin",
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
  return userContext !== null && userContext.role === requiredRole;
}

export function canAccessStats(userContext: UserContext | null): boolean {
  // Only admins can access stats
  return userContext !== null && userContext.isAdmin;
}

export function canCreateEvents(userContext: UserContext | null): boolean {
  // Only admins can create events
  return userContext !== null && userContext.isAdmin;
}
