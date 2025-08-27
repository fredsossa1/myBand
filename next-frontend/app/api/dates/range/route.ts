import { NextRequest, NextResponse } from 'next/server';
import { addDate, verifyAdmin } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { start, end, stepDays = 7, adminPassword } = await request.json();
    
    // Require admin access for creating date ranges
    if (!adminPassword || !(await verifyAdmin(adminPassword))) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    if (!start || !end) {
      return NextResponse.json(
        { error: "Missing start/end dates" },
        { status: 400 }
      );
    }
    
    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");
    
    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      await addDate(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + stepDays);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in POST /api/dates/range:", error);
    return NextResponse.json(
      { error: "Failed to add date range" },
      { status: 500 }
    );
  }
}
