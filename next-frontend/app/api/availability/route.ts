import { NextRequest, NextResponse } from "next/server";
import { getAvailability, setAvailability } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-check";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const availability = await getAvailability();
    return NextResponse.json(availability);
  } catch (error) {
    console.error("❌ Error in GET /api/availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, personId, state } = await request.json();

    if (!eventId || (typeof eventId !== "string" && typeof eventId !== "number")) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    if (!["A", "U", "?"].includes(state)) {
      return NextResponse.json({ error: "Invalid availability state" }, { status: 400 });
    }

    // Verify the caller is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins can write for any member; regular users can only write their own row
    const adminId = await requireAdmin();
    if (!adminId) {
      // Confirm personId belongs to the authenticated user's member record
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!member || member.id !== personId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await setAvailability(eventId, personId, state);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in POST /api/availability:", error);

    if (error instanceof Error && error.message === "Person not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to set availability" },
      { status: 500 }
    );
  }
}
