import { NextRequest, NextResponse } from 'next/server';
import { getMembersByRole } from '@/lib/db';

export async function GET() {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("📥 GET /api/members/by-role request received");
    }
    const membersByRole = await getMembersByRole();
    if (process.env.NODE_ENV === "development") {
      console.log(
        "📤 Sending members by role response:",
        Object.keys(membersByRole),
        "- total entries:",
        Object.keys(membersByRole).length
      );
    }
    return NextResponse.json(membersByRole);
  } catch (error) {
    console.error("❌ Error in /api/members/by-role:", error);
    return NextResponse.json(
      { error: "Failed to fetch members by role" },
      { status: 500 }
    );
  }
}
