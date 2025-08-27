'use client';

import { Member, MembersByRole, Role, AvailabilityByDate, AvailabilityState } from '@/lib/types';
import { getRoleDisplayName, getRoleIcon, getAllRoles } from '@/lib/constants';
import { MemberCard } from './member-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RoleMemberListProps {
  membersByRole: MembersByRole;
  selectedDate?: string;
  availabilityByDate?: AvailabilityByDate;
  onAvailabilityChange?: (memberId: string, state: AvailabilityState) => void;
  className?: string;
  compact?: boolean;
  filterRole?: Role;
}

export function RoleMemberList({ 
  membersByRole, 
  selectedDate,
  availabilityByDate,
  onAvailabilityChange,
  className,
  compact = false,
  filterRole
}: RoleMemberListProps) {
  const rolesToShow = filterRole ? [filterRole] : getAllRoles();
  
  const handleAvailabilityChange = (memberId: string, state: AvailabilityState) => {
    if (onAvailabilityChange && selectedDate) {
      onAvailabilityChange(memberId, state);
    }
  };

  const getAvailabilityForMember = (memberId: string): AvailabilityState | null => {
    if (!selectedDate || !availabilityByDate) return null;
    return availabilityByDate[selectedDate]?.[memberId] || null;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {rolesToShow.map((role) => {
        const members = membersByRole[role] || [];
        
        if (members.length === 0) return null;

        return (
          <Card key={role} className="glass border-white/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="text-2xl">{getRoleIcon(role)}</div>
                <div className="flex-1">
                  <div className="text-white font-semibold">
                    {getRoleDisplayName(role)}
                  </div>
                  <div className="text-white/60 text-sm">
                    {members.length} member{members.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {selectedDate && (
                  <div className="text-sm text-white/80">
                    {selectedDate}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className={cn(
                "grid gap-3",
                compact 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              )}>
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    availability={getAvailabilityForMember(member.id)}
                    onAvailabilityChange={
                      onAvailabilityChange 
                        ? (state) => handleAvailabilityChange(member.id, state)
                        : undefined
                    }
                    compact={compact}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Simplified version for quick overview
interface RoleOverviewProps {
  membersByRole: MembersByRole;
  selectedDate?: string;
  availabilityByDate?: AvailabilityByDate;
  className?: string;
}

export function RoleOverview({ 
  membersByRole, 
  selectedDate,
  availabilityByDate,
  className 
}: RoleOverviewProps) {
  const getAvailabilityStats = (role: Role) => {
    const members = membersByRole[role] || [];
    if (!selectedDate || !availabilityByDate) {
      return { total: members.length, available: 0, unavailable: 0, uncertain: 0, noResponse: members.length };
    }

    const dateAvailability = availabilityByDate[selectedDate] || {};
    const stats = { total: members.length, available: 0, unavailable: 0, uncertain: 0, noResponse: 0 };
    
    members.forEach(member => {
      const state = dateAvailability[member.id];
      if (state === 'A') stats.available++;
      else if (state === 'U') stats.unavailable++;
      else if (state === '?') stats.uncertain++;
      else stats.noResponse++;
    });
    
    return stats;
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
      {getAllRoles().map((role) => {
        const stats = getAvailabilityStats(role);
        const responseRate = stats.total > 0 ? Math.round(((stats.total - stats.noResponse) / stats.total) * 100) : 0;
        
        return (
          <Card key={role} className="glass border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">{getRoleIcon(role)}</div>
                <div className="text-white font-medium text-sm mb-1">
                  {getRoleDisplayName(role)}
                </div>
                <div className="text-white/60 text-xs mb-3">
                  {stats.total} member{stats.total !== 1 ? 's' : ''}
                </div>
                
                {selectedDate && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">✅ {stats.available}</span>
                      <span className="text-red-400">❌ {stats.unavailable}</span>
                      <span className="text-yellow-400">❓ {stats.uncertain}</span>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div 
                        className={cn(
                          "h-1 rounded-full",
                          responseRate >= 80 ? "bg-green-500" :
                          responseRate >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${responseRate}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-white/60">
                      {responseRate}% responded
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
