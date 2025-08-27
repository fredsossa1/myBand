import { NextRequest, NextResponse } from 'next/server';
import { getMembers } from '@/lib/db';

export async function GET() {
  try {
    console.log("📥 GET /api/members request received");
    const members = await getMembers();
    console.log("📤 Sending members response:", members.length, "members");
    return NextResponse.json(members);
  } catch (error) {
    console.error("❌ Error in /api/members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
