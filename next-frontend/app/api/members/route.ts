import { NextRequest, NextResponse } from "next/server";
import { getMembers } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("📥 GET /api/members request received");
    }
    const members = await getMembers();
    if (process.env.NODE_ENV === "development") {
      console.log("📤 Sending members response:", members.length, "members");
    }
    return NextResponse.json(members);
  } catch (error) {
    console.error("❌ Error in /api/members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
