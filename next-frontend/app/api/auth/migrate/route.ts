import { NextRequest, NextResponse } from 'next/server';
import { migrateLegacyMembers, saveMigratedMembers, savePasswordList } from '@/lib/member-migration';

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow this in development or with admin password
    const { adminPassword } = await request.json();
    
    // You should set this in your environment variables
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting member migration...');
    
    // Migrate legacy members
    const { members, passwords } = await migrateLegacyMembers();
    
    // Save migrated members
    await saveMigratedMembers(members);
    
    // Save password list for admin distribution
    savePasswordList(passwords);
    
    console.log(`✅ Migration complete! ${members.length} members migrated.`);
    
    return NextResponse.json({
      success: true,
      message: `Migration successful! ${members.length} members migrated.`,
      summary: {
        totalMembers: members.length,
        passwordsGenerated: passwords.length,
        passwordFile: 'data/initial-passwords.json',
        membersFile: 'data/members-auth.json'
      },
      // Return passwords for immediate admin use (remove in production)
      passwords: process.env.NODE_ENV === 'development' ? passwords : undefined
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Migration failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
