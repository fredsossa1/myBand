import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, resetData } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!(await verifyAdmin(password))) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    // Load default members from data directory
    const membersConfigPath = path.join(process.cwd(), "..", "data", "members.json");
    const defaultMembers = JSON.parse(fs.readFileSync(membersConfigPath, "utf8"));
    
    await resetData(defaultMembers);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error in /api/reset:", error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}
