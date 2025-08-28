"use client";

import { Event, EventType } from "@/lib/types";
import {
  formatDate,
  formatDateShort,
  getEventTypeIcon,
  getEventTypeDisplayName,
  isToday,
  isPast,
  EVENT_TYPE_COLORS,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  compact = false,
}: EventCardProps) {
  const eventTypeColor = EVENT_TYPE_COLORS[event.type];
  const isPastEvent = isPast(event.date);
  const isTodayEvent = isToday(event.date);

  const coveragePercentage = coverageStats
    ? Math.round(
        (coverageStats.totalResponses / coverageStats.totalMembers) * 100
      )
    : 0;

  if (compact) {
    return (
      <div
        className={cn(
          "glass rounded-lg p-4 transition-all cursor-pointer",
          "hover:scale-105 hover:shadow-lg",
          isPastEvent && "opacity-60",
          isTodayEvent && "ring-2 ring-yellow-400/50",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4">
          <div className="text-xl flex-shrink-0">
            {getEventTypeIcon(event.type)}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-white font-medium text-sm truncate">
              {event.title}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-white/60 text-xs">
                {formatDateShort(event.date)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "glass border-white/20 transition-all cursor-pointer",
        "hover:scale-105 hover:shadow-lg",
        isPastEvent && "opacity-60",
        isTodayEvent && "ring-2 ring-yellow-400/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-3">
          <div className="text-xl sm:text-2xl flex-shrink-0">
            {getEventTypeIcon(event.type)}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-white font-semibold text-sm sm:text-base truncate">
              {event.title}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2">
              <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                <div className="text-white/80 text-xs font-medium">
                  📅 {formatDate(event.date)}
                </div>
              </div>
              <div className="flex gap-2">
                {isTodayEvent && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                  >
                    Today
                  </Badge>
                )}
                {isPastEvent && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-500/20 border-gray-500/40 text-gray-400"
                  >
                    Past
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div>
          <div className="hidden sm:block text-white/80 text-xs sm:text-sm font-medium whitespace-nowrap">
            📅 {formatDate(event.date)}
          </div>
          {event.description && (
            <div className="text-white/60 text-xs sm:text-sm mt-1">
              {event.description}
            </div>
          )}
        </div>

        {coverageStats && (
          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-white/80">Coverage:</span>
                <span className="text-white font-medium">
                  {coverageStats.availableCount}/{coverageStats.totalMembers}{" "}
                  members
                </span>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  coveragePercentage >= 80
                    ? "bg-green-500"
                    : coveragePercentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between sm:justify-center">
                <span className="text-green-400">✅ Available</span>
                <span className="text-white sm:hidden">
                  {coverageStats.availableCount}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-center">
                <span className="text-red-400">❌ Unavailable</span>
                <span className="text-white sm:hidden">
                  {coverageStats.unavailableCount}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-center">
                <span className="text-yellow-400">❓ Uncertain</span>
                <span className="text-white sm:hidden">
                  {coverageStats.uncertainCount}
                </span>
              </div>
              {/* Desktop numbers */}
              <div className="hidden sm:block text-center">
                <span className="text-white font-medium">
                  {coverageStats.availableCount}
                </span>
              </div>
              <div className="hidden sm:block text-center">
                <span className="text-white font-medium">
                  {coverageStats.unavailableCount}
                </span>
              </div>
              <div className="hidden sm:block text-center">
                <span className="text-white font-medium">
                  {coverageStats.uncertainCount}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-white/60">Event ID: {event.id}</div>
      </CardContent>
    </Card>
  );
}
