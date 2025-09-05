"use client";

import { useAppData } from "@/lib/api-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  formatDate,
  formatDateShort,
  isToday,
  isPast,
  getRoleDisplayName,
  getEventTypeIcon,
  getAvailabilityIcon,
} from "@/lib/constants";
import { Event, Member, AvailabilityRecord, AvailabilityState, Role } from "@/lib/types";
import { groupAvailabilityByDate } from "@/lib/utils";
import { StatsService } from "@/lib/stats-service";

export function Dashboard() {
  const t = useTranslations();
  const router = useRouter();
  const { members, events, availability, loading } = useAppData();
  const [selectedMember, setSelectedMember] = useState<string>("");

  // Calculate various stats and data
  const stats = useMemo(() => {
    if (!members || !events || !availability) {
      return {
        totalEvents: 0,
        totalMembers: 0,
        responseRate: 0,
        upcomingEvents: [],
        recentActivity: [],
        memberStats: null,
        nextEvent: null,
      };
    }

    // Get upcoming events (next 3)
    const upcomingEvents = events
      .filter((event) => !isPast(event.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // Get next event
    const nextEvent = upcomingEvents[0] || null;

    // Calculate overall stats using the centralized service
    const overallStats = StatsService.calculateOverallStats(members, events, availability);

    // Recent activity (last 5)
    const recentActivity = availability
      .filter((record) => record.created_at)
      .sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
      .slice(0, 5)
      .map((record) => {
        const member = members.find((m) => m.id === record.person_id);
        const event = events.find((e) => e.date === record.date);
        return {
          ...record,
          memberName: member?.name || "Unknown",
          memberRole: member ? ('role' in member ? member.role : (member.roles?.[0] || 'bv')) : 'unknown',
          eventTitle: event?.title || "Unknown Event",
        };
      });

    // Member-specific stats if selected
    let memberStats = null;
    if (selectedMember) {
      const member = members.find((m) => m.id === selectedMember);
      if (member) {
        const memberStatsData = StatsService.calculateMemberStats(member, events, availability);
        const memberEventStatus = StatsService.getMemberEventStatus(member, upcomingEvents, availability);

        memberStats = {
          member,
          responses: memberStatsData.actualResponses,
          expectedResponses: memberStatsData.expectedResponses,
          responseRate: memberStatsData.responseRate,
          eventStatus: memberEventStatus.map(({ event, status, shouldRespond }) => ({
            ...event,
            status,
            shouldRespond,
          })),
        };
      }
    }

    return {
      totalEvents: events.length,
      totalMembers: members.length,
      responseRate: overallStats.overallResponseRate,
      totalResponses: overallStats.totalActualResponses,
      totalPossibleResponses: overallStats.totalExpectedResponses,
      upcomingEvents,
      recentActivity,
      memberStats,
      nextEvent,
    };
  }, [members, events, availability, selectedMember]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="text-white text-center flex items-center justify-center gap-3">
              <div className="text-2xl">⏳</div>
              <span>{t.loading}...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card className="glass border-white/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium block">
              👤 {t.selectName}
            </label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={t.selectName} />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => {
                  const memberRole = ('role' in member ? member.role : (member.roles?.[0] || 'bv')) as Role;
                  return (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({getRoleDisplayName(memberRole)})
                    </SelectItem>
                  );
                }) || []}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📅</div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalEvents}
                </div>
                <div className="text-sm text-white/70">{t.upcomingEvents}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">👥</div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalMembers}
                </div>
                <div className="text-sm text-white/70">{t.bandMembers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">
                  {stats.responseRate}%
                </div>
                <div className="text-sm text-white/70">
                  {t.overallResponseRate}
                </div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  stats.responseRate >= 80
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : stats.responseRate >= 60
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-red-500 to-pink-500"
                }`}
                style={{ width: `${stats.responseRate}%` }}
              />
            </div>
            <div className="text-xs text-white/60">
              {stats.totalResponses} / {stats.totalPossibleResponses}{" "}
              {t.responses}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member-specific dashboard */}
      {stats.memberStats && (
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-xl">👤</span>
              {stats.memberStats.member.name} -{" "}
              {getRoleDisplayName(
                ('role' in stats.memberStats.member 
                  ? stats.memberStats.member.role 
                  : (stats.memberStats.member.roles?.[0] || 'bv')) as Role
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">
                  {stats.memberStats.responses}/{stats.memberStats.expectedResponses}
                </div>
                <div className="text-sm text-white/70">Responses Given</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">
                  {stats.memberStats.responseRate}%
                </div>
                <div className="text-sm text-white/70">Response Rate</div>
              </div>
            </div>

            {stats.memberStats.eventStatus.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">
                  Upcoming Events Status:
                </h4>
                <div className="space-y-2">
                  {stats.memberStats.eventStatus.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        event.shouldRespond ? "bg-white/5" : "bg-gray-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getEventTypeIcon(event.type)}
                        </span>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {event.title}
                            {!event.shouldRespond && (
                              <span className="text-gray-400 text-xs ml-2">
                                (no response needed)
                              </span>
                            )}
                          </div>
                          <div className="text-white/60 text-xs">
                            {formatDate(event.date)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          !event.shouldRespond
                            ? "border-gray-500/50 text-gray-400"
                            : event.status === "A"
                            ? "border-green-500/50 text-green-300"
                            : event.status === "U"
                            ? "border-red-500/50 text-red-300"
                            : event.status === "?"
                            ? "border-yellow-500/50 text-yellow-300"
                            : "border-gray-500/50 text-gray-400"
                        }`}
                      >
                        {!event.shouldRespond
                          ? "➖ Not Required"
                          : event.status
                          ? getAvailabilityIcon(event.status as AvailabilityState)
                          : "⭕"}
                        {!event.shouldRespond
                          ? ""
                          : event.status === "A"
                          ? "Available"
                          : event.status === "U"
                          ? "Unavailable"
                          : event.status === "?"
                          ? "Uncertain"
                          : "No Response"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Two column layout for upcoming events and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="glass border-white/20" data-upcoming-events>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-xl">🗓️</span>
              {t.upcomingEvents}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-2xl">
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">
                        {event.title}
                      </div>
                      <div className="text-white/60 text-xs">
                        {formatDate(event.date)}
                        {isToday(event.date) && (
                          <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 text-xs">
                            Today
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <div className="text-2xl mb-2">📭</div>
                <p>No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <span className="text-xl">🕒</span>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <div className="text-xl">
                      {getAvailabilityIcon(activity.state)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm">
                        <span className="font-medium">
                          {activity.memberName}
                        </span>
                        <span className="text-white/60">
                          {" "}
                          • {activity.eventTitle}
                        </span>
                      </div>
                      <div className="text-white/60 text-xs">
                        {activity.memberRole ? 
                          getRoleDisplayName(activity.memberRole as Role) + " • " : ""
                        }{formatDateShort(activity.date)}
                      </div>
                    </div>
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
    </div>
  );
}
