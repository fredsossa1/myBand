import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-check";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .select("id, name, role, user_id")
      .order("role")
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Don't expose raw user_id UUIDs — just the linked status
    return NextResponse.json(
      data.map((m) => ({ id: m.id, name: m.name, role: m.role, linked: m.user_id != null }))
    );
  } catch (error) {
    console.error("❌ Error in GET /api/admin/members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
