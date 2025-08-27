import { NextRequest, NextResponse } from 'next/server';
import { getMemberById } from '@/lib/db';
import { UserContext } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }
    
    // Get member information
    const members = await getMemberById(memberId);
    
    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }
    
    const member = members[0];
    
    // Create user context
    const userContext: UserContext = {
      id: member.id,
      name: member.name,
      role: member.role,
      isAdmin: member.role === 'admin'
    };
    
    return NextResponse.json({ user: userContext });
  } catch (error) {
    console.error("❌ Error in /api/auth/login:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
