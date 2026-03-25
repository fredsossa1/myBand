import { NextRequest, NextResponse } from "next/server";
import { addEvent } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/admin-check";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { event } = await request.json();
    await addEvent(event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in /api/admin/events:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}
