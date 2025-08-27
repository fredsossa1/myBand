'use client';

import { Member, Role, AvailabilityState } from '@/lib/types';
import { getRoleDisplayName, getRoleIcon, getAvailabilityIcon, ROLE_COLORS, AVAILABILITY_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: Member;
  availability?: AvailabilityState | null;
  onAvailabilityChange?: (state: AvailabilityState) => void;
  className?: string;
  compact?: boolean;
}

export function MemberCard({ 
  member, 
  availability, 
  onAvailabilityChange, 
  className,
  compact = false 
}: MemberCardProps) {
  const roleColor = ROLE_COLORS[member.role];
  const availabilityColor = availability ? AVAILABILITY_COLORS[availability] : '';

  if (compact) {
    return (
      <div className={cn(
        "glass rounded-lg p-3 transition-all hover:scale-105",
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="text-lg">{getRoleIcon(member.role)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">
              {member.name}
            </div>
            <div className="text-white/60 text-xs">
              {getRoleDisplayName(member.role)}
            </div>
          </div>
          {availability && (
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              availabilityColor
            )}>
              {getAvailabilityIcon(availability)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "glass border-white/20 transition-all hover:scale-105 hover:shadow-lg",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="text-2xl">{getRoleIcon(member.role)}</div>
          <div className="flex-1">
            <div className="text-white font-semibold">{member.name}</div>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs text-white bg-gradient-to-r border-0",
                roleColor
              )}
            >
              {getRoleDisplayName(member.role)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm">Availability:</span>
          
          {availability ? (
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-2 py-1 rounded-md text-xs font-medium border",
                availabilityColor
              )}>
                {getAvailabilityIcon(availability)} {availability === 'A' ? 'Available' : availability === 'U' ? 'Unavailable' : 'Uncertain'}
              </div>
              
              {onAvailabilityChange && (
                <div className="flex gap-1">
                  {(['A', 'U', '?'] as AvailabilityState[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => onAvailabilityChange(state)}
                      className={cn(
                        "w-6 h-6 rounded-full text-xs transition-all hover:scale-110",
                        availability === state 
                          ? AVAILABILITY_COLORS[state]
                          : "bg-white/10 border border-white/20 text-white/60 hover:bg-white/20"
                      )}
                      title={state === 'A' ? 'Available' : state === 'U' ? 'Unavailable' : 'Uncertain'}
                    >
                      {getAvailabilityIcon(state)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">No response</span>
              
              {onAvailabilityChange && (
                <div className="flex gap-1">
                  {(['A', 'U', '?'] as AvailabilityState[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => onAvailabilityChange(state)}
                      className={cn(
                        "w-6 h-6 rounded-full text-xs transition-all hover:scale-110",
                        "bg-white/10 border border-white/20 text-white/60 hover:bg-white/20"
                      )}
                      title={state === 'A' ? 'Available' : state === 'U' ? 'Unavailable' : 'Uncertain'}
                    >
                      {getAvailabilityIcon(state)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-white/60">
          ID: {member.id}
        </div>
      </CardContent>
    </Card>
  );
}
