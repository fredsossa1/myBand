import { NextRequest, NextResponse } from "next/server";
import { getAvailabilityByRole } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    const availabilityByRole = await getAvailabilityByRole(eventId ? parseInt(eventId) : undefined);
    return NextResponse.json(availabilityByRole);
  } catch (error) {
    console.error("❌ Error in /api/availability/by-role:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability by role" },
      { status: 500 }
    );
  }
}
