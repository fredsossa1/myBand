"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/api-hooks";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { groupMembersByRole, groupAvailabilityByDate } from "@/lib/utils";
import {
  getAvailabilityIcon,
  getRoleDisplayName,
  formatDate,
} from "@/lib/constants";
import {
  Role,
  AvailabilityState,
  Member,
  AvailabilityRecord,
} from "@/lib/types";
import { StatsService } from "@/lib/stats-service";

export default function StatsPage() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const {
    members,
    events,
    availability,
    loading: dataLoading,
    error,
    refetch,
  } = useAppData();

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      // Redirect to home page if not admin
      router.push("/");
      return;
    }
    setLoading(false);
  }, [isAdmin, router]);

  const stats = useMemo(() => {
    if (!members || !events || !availability || !Array.isArray(availability)) {
      return {
        totalMembers: 0,
        totalEvents: 0,
        totalResponses: 0,
        responseRate: 0,
        byRole: {},
        byEvent: [],
        recentActivity: [],
      };
    }

    // Use the centralized stats service
    const overallStats = StatsService.calculateOverallStats(members, events, availability);
    const roleStats = StatsService.calculateRoleStats(members, events, availability);
    const eventStats = StatsService.calculateAllEventStats(events, members, availability);

    // Recent activity (last 10 availability records)
    const recentActivity = (availability || [])
      .filter((record) => record.created_at)
      .sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
      .slice(0, 10)
      .map((record: AvailabilityRecord) => {
        const member = members.find((m) => m.id === record.person_id);
        const event = events.find((e) => e.date === record.date);
        return {
          ...record,
          memberName: member?.name || "Unknown",
          memberRole: member?.role || "unknown",
          eventTitle: event?.title || "Unknown Event",
          eventDate: event?.date || record.date,
        };
      });

    // Convert stats to the format expected by the UI
    const byRole: Record<string, any> = {};
    Object.entries(roleStats).forEach(([role, stats]) => {
      byRole[role] = {
        members: stats.members,
        totalPossible: stats.expectedResponses,
        responses: stats.actualResponses,
        available: stats.availableCount,
        unavailable: stats.unavailableCount,
        uncertain: stats.uncertainCount,
        responseRate: stats.responseRate,
      };
    });

    const byEvent = eventStats.map((eventStat) => ({
      ...eventStat.event,
      responses: eventStat.actualResponses,
      available: eventStat.availableCount,
      unavailable: eventStat.unavailableCount,
      uncertain: eventStat.uncertainCount,
      responseRate: eventStat.responseRate,
      coverage: eventStat.coverage,
    }));

    return {
      totalMembers: overallStats.totalMembers,
      totalEvents: overallStats.totalEvents,
      totalResponses: overallStats.totalActualResponses,
      responseRate: overallStats.overallResponseRate,
      byRole,
      byEvent,
      recentActivity,
    };
  }, [members, events, availability]);

  // Show loading while checking admin access
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="glass border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-xl">Checking access...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect)
  if (!isAdmin) {
    return null;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="glass border-white/20">
            <CardContent className="p-12 text-center">
              <div className="text-white">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-xl">Loading statistics...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900 p-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="glass border-red-500/20">
            <CardContent className="p-12 text-center">
              <div className="text-red-400">
                <div className="text-4xl mb-4">❌</div>
                <p className="text-xl">Error loading data: {error}</p>
                <Button onClick={refetch} className="mt-4" variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Band Statistics & Overview
              </CardTitle>
              <p className="text-white/70 mt-2">
                Comprehensive overview of availability and response patterns
              </p>
            </div>
            <Button
              variant="outline"
              onClick={refetch}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {stats.totalMembers}
            </div>
            <div className="text-white/60">Band Members</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {stats.totalEvents}
            </div>
            <div className="text-white/60">Upcoming Events</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {stats.totalResponses}
            </div>
            <div className="text-white/60">Total Responses</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <div
              className={`text-3xl font-bold ${
                stats.responseRate >= 80
                  ? "text-green-400"
                  : stats.responseRate >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {stats.responseRate}%
            </div>
            <div className="text-white/60">Response Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Stats by Role */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🎵 Statistics by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byRole).map(([role, roleStats]) => (
              <Card key={role} className="glass-dark border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-sm sm:text-lg">
                    {getRoleDisplayName(role as Role)}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs ${
                      roleStats.responseRate >= 80
                        ? "border-green-500/50 text-green-300"
                        : roleStats.responseRate >= 60
                        ? "border-yellow-500/50 text-yellow-300"
                        : "border-red-500/50 text-red-300"
                    }`}
                  >
                    {roleStats.responseRate}% Response Rate
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <div className="text-white font-medium">
                        {roleStats.members.length}
                      </div>
                      <div className="text-white/60">Members</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {roleStats.responses}/{roleStats.totalPossible}
                      </div>
                      <div className="text-white/60">Responses</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-green-300">
                        {getAvailabilityIcon("A")} Available
                      </span>
                      <span className="text-white">{roleStats.available}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-red-300">
                        {getAvailabilityIcon("U")} Unavailable
                      </span>
                      <span className="text-white">
                        {roleStats.unavailable}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-300">
                        {getAvailabilityIcon("?")} Uncertain
                      </span>
                      <span className="text-white">{roleStats.uncertain}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Coverage */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            📅 Event Coverage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byEvent.map((event) => (
              <Card key={event.id} className="glass-dark border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-medium">{event.title}</h3>
                      <p className="text-white/60 text-sm">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          event.coverage
                            ? "border-green-500/50 text-green-300"
                            : "border-red-500/50 text-red-300"
                        }`}
                      >
                        {event.coverage
                          ? "✅ Good Coverage"
                          : "⚠️ Low Coverage"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        {event.responseRate}% responded
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="text-center">
                      <div className="text-white font-medium">
                        {event.responses}
                      </div>
                      <div className="text-white/60">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 font-medium">
                        {event.available}
                      </div>
                      <div className="text-white/60">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-300 font-medium">
                        {event.unavailable}
                      </div>
                      <div className="text-white/60">Unavailable</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-300 font-medium">
                        {event.uncertain}
                      </div>
                      <div className="text-white/60">Uncertain</div>
                    </div>
                  </div>

                  {/* Response bar */}
                  <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${event.responseRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🕒 Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getAvailabilityIcon(activity.state as AvailabilityState)}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {activity.memberName} • {activity.eventTitle}
                      </div>
                      <div className="text-white/60 text-sm">
                        {getRoleDisplayName(activity.memberRole as Role)} •{" "}
                        {formatDate(activity.eventDate)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      activity.state === "A"
                        ? "border-green-500/50 text-green-300"
                        : activity.state === "U"
                        ? "border-red-500/50 text-red-300"
                        : "border-gray-500/50 text-gray-300"
                    }`}
                  >
                    {activity.state === "A"
                      ? "Available"
                      : activity.state === "U"
                      ? "Unavailable"
                      : "Uncertain"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <div className="text-2xl mb-2">📭</div>
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
