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
    const { date, personId, state } = await request.json();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (!["A", "U", "?"].includes(state)) {
      return NextResponse.json(
        { error: "Invalid availability state" },
        { status: 400 }
      );
    }

    await setAvailability(date, personId, state);
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
