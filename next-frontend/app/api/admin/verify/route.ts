import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const isAdmin = await verifyAdmin(password);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("❌ Error in /api/admin/verify:", error);
    return NextResponse.json(
      { error: "Failed to verify admin" },
      { status: 500 }
    );
  }
}
