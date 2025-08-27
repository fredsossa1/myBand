import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityByRole } from "@/lib/db";

export async function GET() {
  try {
    const availabilityByRole = await getAvailabilityByRole();
    return NextResponse.json(availabilityByRole);
  } catch (error) {
    console.error("❌ Error in /api/availability/by-role:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability by role" },
      { status: 500 }
    );
  }
}
