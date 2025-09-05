import { Member, Role } from './types';
import { generateEmailFromName, hashPassword, generateRandomPassword } from './auth-utils';
import fs from 'fs';
import path from 'path';

/**
 * Legacy member structure from members.json
 */
interface LegacyMembersByRole {
  bassist: Array<{ id: string; name: string }>;
  pianist: Array<{ id: string; name: string }>;
  drummer: Array<{ id: string; name: string }>;
  lead: Array<{ id: string; name: string }>;
  bv: Array<{ id: string; name: string }>;
  violinist: Array<{ id: string; name: string }>;
}

/**
 * Migrate legacy members.json to new Member structure with authentication
 */
export async function migrateLegacyMembers(): Promise<{ 
  members: Member[]; 
  passwords: Array<{ email: string; password: string; name: string }> 
}> {
  const membersPath = path.join(process.cwd(), 'data', 'members.json');
  const legacyMembers: LegacyMembersByRole = JSON.parse(
    fs.readFileSync(membersPath, 'utf8')
  );

  const newMembers: Member[] = [];
  const generatedPasswords: Array<{ email: string; password: string; name: string }> = [];

  // Process each role
  for (const [role, roleMembers] of Object.entries(legacyMembers)) {
    for (const legacyMember of roleMembers) {
      const email = generateEmailFromName(legacyMember.name);
      const tempPassword = generateRandomPassword(8);
      const passwordHash = await hashPassword(tempPassword);

      const newMember: Member = {
        id: legacyMember.id,
        name: legacyMember.name,
        email,
        password_hash: passwordHash,
        roles: [role as Role],
        is_admin: false,
        must_change_password: true,
        created_at: new Date().toISOString(),
      };

      newMembers.push(newMember);
      generatedPasswords.push({
        email,
        password: tempPassword,
        name: legacyMember.name,
      });
    }
  }

  return { members: newMembers, passwords: generatedPasswords };
}

/**
 * Save migrated members to new structure
 */
export async function saveMigratedMembers(members: Member[]): Promise<void> {
  const membersPath = path.join(process.cwd(), 'data', 'members-auth.json');
  
  // Create members object indexed by ID for easy lookup
  const membersById: { [id: string]: Member } = {};
  members.forEach(member => {
    membersById[member.id] = member;
  });

  fs.writeFileSync(membersPath, JSON.stringify(membersById, null, 2));
}

/**
 * Save password list for admin distribution
 */
export function savePasswordList(passwords: Array<{ email: string; password: string; name: string }>): void {
  const passwordsPath = path.join(process.cwd(), 'data', 'initial-passwords.json');
  fs.writeFileSync(passwordsPath, JSON.stringify(passwords, null, 2));
}

/**
 * Find member by email
 */
export function findMemberByEmail(email: string): Member | null {
  try {
    const membersPath = path.join(process.cwd(), 'data', 'members-auth.json');
    const membersData: { [id: string]: Member } = JSON.parse(
      fs.readFileSync(membersPath, 'utf8')
    );
    
    return Object.values(membersData).find(member => member.email === email) || null;
  } catch (error) {
    console.error('Error finding member by email:', error);
    return null;
  }
}

/**
 * Update member's password and clear must_change_password flag
 */
export async function updateMemberPassword(memberId: string, newPasswordHash: string): Promise<boolean> {
  try {
    const membersPath = path.join(process.cwd(), 'data', 'members-auth.json');
    const membersData: { [id: string]: Member } = JSON.parse(
      fs.readFileSync(membersPath, 'utf8')
    );
    
    if (membersData[memberId]) {
      membersData[memberId].password_hash = newPasswordHash;
      membersData[memberId].must_change_password = false;
      membersData[memberId].last_login = new Date().toISOString();
      
      fs.writeFileSync(membersPath, JSON.stringify(membersData, null, 2));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating member password:', error);
    return false;
  }
}

/**
 * Update member's last login time
 */
export function updateLastLogin(memberId: string): void {
  try {
    const membersPath = path.join(process.cwd(), 'data', 'members-auth.json');
    const membersData: { [id: string]: Member } = JSON.parse(
      fs.readFileSync(membersPath, 'utf8')
    );
    
    if (membersData[memberId]) {
      membersData[memberId].last_login = new Date().toISOString();
      fs.writeFileSync(membersPath, JSON.stringify(membersData, null, 2));
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}
