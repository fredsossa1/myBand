import { NextResponse } from "next/server";
import { resetData } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/admin-check";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const membersConfigPath = path.join(process.cwd(), "data", "members.json");
    const membersData = JSON.parse(fs.readFileSync(membersConfigPath, "utf8"));

    const defaultMembers: { id: string; name: string; role: string }[] = [];
    Object.entries(membersData).forEach(([role, members]) => {
      if (Array.isArray(members)) {
        members.forEach((member: { id: string; name: string }) => {
          defaultMembers.push({ id: member.id, name: member.name, role });
        });
      }
    });

    await resetData(defaultMembers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in /api/reset:", error);
    return NextResponse.json({ error: "Failed to reset data" }, { status: 500 });
  }
}
