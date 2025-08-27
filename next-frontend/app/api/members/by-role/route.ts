import { NextRequest, NextResponse } from 'next/server';
import { getMembersByRole } from '@/lib/db';

export async function GET() {
  try {
    console.log("📥 GET /api/members/by-role request received");
    const membersByRole = await getMembersByRole();
    console.log(
      "📤 Sending members by role response:",
      Object.keys(membersByRole),
      "- total entries:",
      Object.keys(membersByRole).length
    );
    console.log(
      "🔍 Full membersByRole data:",
      JSON.stringify(membersByRole, null, 2)
    );
    return NextResponse.json(membersByRole);
  } catch (error) {
    console.error("❌ Error in /api/members/by-role:", error);
    return NextResponse.json(
      { error: "Failed to fetch members by role" },
      { status: 500 }
    );
  }
}
