import { NextRequest, NextResponse } from "next/server";
import { getAvailability, setAvailability } from "@/lib/db";

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

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!["A", "U", "?"].includes(state)) {
      return NextResponse.json(
        { error: "Invalid availability state" },
        { status: 400 }
      );
    }

    await setAvailability(eventId, personId, state);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in POST /api/availability:", error);

    if (error instanceof Error && error.message === "Person not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message === "Event not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to set availability" },
      { status: 500 }
    );
  }
}
