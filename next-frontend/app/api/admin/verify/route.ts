import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-check";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const adminId = await requireAdmin();
    return NextResponse.json({ isAdmin: adminId !== null });
  } catch (error) {
    console.error("❌ Error in /api/admin/verify:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
