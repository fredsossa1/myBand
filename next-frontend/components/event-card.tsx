'use client';

import { Event, EventType } from '@/lib/types';
import { formatDate, formatDateShort, getEventTypeIcon, getEventTypeDisplayName, isToday, isPast, EVENT_TYPE_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  coverageStats?: {
    totalResponses: number;
    totalMembers: number;
    availableCount: number;
    unavailableCount: number;
    uncertainCount: number;
  };
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function EventCard({ 
  event, 
  coverageStats, 
  onClick, 
  className,
  compact = false 
}: EventCardProps) {
  const eventTypeColor = EVENT_TYPE_COLORS[event.type];
  const isPastEvent = isPast(event.date);
  const isTodayEvent = isToday(event.date);
  
  const coveragePercentage = coverageStats 
    ? Math.round((coverageStats.totalResponses / coverageStats.totalMembers) * 100)
    : 0;

  if (compact) {
    return (
      <div 
        className={cn(
          "glass rounded-lg p-3 transition-all cursor-pointer",
          "hover:scale-105 hover:shadow-lg",
          isPastEvent && "opacity-60",
          isTodayEvent && "ring-2 ring-yellow-400/50",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="text-lg">{getEventTypeIcon(event.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium text-sm truncate">
              {event.title}
            </div>
            <div className="text-white/60 text-xs">
              {formatDateShort(event.date)}
            </div>
          </div>
          {coverageStats && (
            <div className="text-right">
              <div className="text-xs text-white/80">
                {coverageStats.availableCount}/{coverageStats.totalMembers}
              </div>
              <div className={cn(
                "text-xs",
                coveragePercentage >= 80 ? "text-green-400" :
                coveragePercentage >= 60 ? "text-yellow-400" : "text-red-400"
              )}>
                {coveragePercentage}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "glass border-white/20 transition-all cursor-pointer",
      "hover:scale-105 hover:shadow-lg",
      isPastEvent && "opacity-60",
      isTodayEvent && "ring-2 ring-yellow-400/50",
      className
    )}
    onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
          <div className="flex-1">
            <div className="text-white font-semibold">{event.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs text-white bg-gradient-to-r border-0",
                  eventTypeColor
                )}
              >
                {getEventTypeDisplayName(event.type)}
              </Badge>
              {isTodayEvent && (
                <Badge variant="secondary" className="text-xs bg-yellow-500/20 border-yellow-500/40 text-yellow-300">
                  Today
                </Badge>
              )}
              {isPastEvent && (
                <Badge variant="secondary" className="text-xs bg-gray-500/20 border-gray-500/40 text-gray-400">
                  Past
                </Badge>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div>
          <div className="text-white/80 text-sm font-medium">
            📅 {formatDate(event.date)}
          </div>
          {event.description && (
            <div className="text-white/60 text-sm mt-1">
              {event.description}
            </div>
          )}
        </div>
        
        {coverageStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Response Rate:</span>
              <span className={cn(
                "font-medium",
                coveragePercentage >= 80 ? "text-green-400" :
                coveragePercentage >= 60 ? "text-yellow-400" : "text-red-400"
              )}>
                {coverageStats.totalResponses}/{coverageStats.totalMembers} ({coveragePercentage}%)
              </span>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all",
                  coveragePercentage >= 80 ? "bg-green-500" :
                  coveragePercentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-green-400">
                ✅ {coverageStats.availableCount} Available
              </span>
              <span className="text-red-400">
                ❌ {coverageStats.unavailableCount} Unavailable
              </span>
              <span className="text-yellow-400">
                ❓ {coverageStats.uncertainCount} Uncertain
              </span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-white/60">
          Event ID: {event.id}
        </div>
      </CardContent>
    </Card>
  );
}
