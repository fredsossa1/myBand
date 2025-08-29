import { NextRequest, NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
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

    await initSchema(defaultMembers);

    return NextResponse.json({
      ok: true,
      message: "Database initialized successfully",
      membersLoaded: defaultMembers.length,
    });
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
