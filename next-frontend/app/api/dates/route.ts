import { NextRequest, NextResponse } from 'next/server';
import { getDates, addDate } from '@/lib/db';

export async function GET() {
  try {
    const dates = await getDates();
    return NextResponse.json(dates);
  } catch (error) {
    console.error("❌ Error in GET /api/dates:", error);
    return NextResponse.json(
      { error: "Failed to fetch dates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json();
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
    
    await addDate(date);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in POST /api/dates:", error);
    return NextResponse.json(
      { error: "Failed to add date" },
      { status: 500 }
    );
  }
}
