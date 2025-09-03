import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, resetData } from "@/lib/db";
import fs from "fs";
export const dynamic = "force-dynamic";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!(await verifyAdmin(password))) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Load default members from data directory
    const membersConfigPath = path.join(process.cwd(), "data", "members.json");
    const membersData = JSON.parse(fs.readFileSync(membersConfigPath, "utf8"));

    // Flatten the members data structure
    const defaultMembers: any[] = [];
    Object.entries(membersData).forEach(([role, members]: [string, any]) => {
      if (Array.isArray(members)) {
        members.forEach((member) => {
          defaultMembers.push({
            id: member.id,
            name: member.name,
            role: role,
          });
        });
      }
    });

    await resetData(defaultMembers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in /api/reset:", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}
