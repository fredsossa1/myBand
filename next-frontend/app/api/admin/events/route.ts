import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, addEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { password, event } = await request.json();

    if (!(await verifyAdmin(password))) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

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
