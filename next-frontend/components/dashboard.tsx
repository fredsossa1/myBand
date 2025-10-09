"use client";

import { useAppData } from "@/lib/api-hooks";
import { useAdmin } from "@/hooks/use-admin";
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
  getEventTypeIcon,
  getRoleDisplayName,
  getAvailabilityIcon,
} from "@/lib/constants";
import type { Member, AvailabilityState } from "@/lib/types";

interface StatsData {
  totalEvents: number;
  totalMembers: number;
  totalResponses: number;
  totalPossibleResponses: number;
  responseRate: number;
  memberStats?: {
    member: Member;
    responses: number;
    expectedResponses: number;
    responseRate: number;
    recentResponses: Array<{
      eventTitle: string;
      eventDate: string;
      status: AvailabilityState;
      shouldRespond: boolean;
    }>;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
  recentActivity: Array<{
    memberName: string;
    memberRole: string;
    eventTitle: string;
    state: AvailabilityState;
    date: string;
  }>;
}

export default function Dashboard() {
  const appData = useAppData();
  const isAdmin = useAdmin();
  const t = useTranslations();
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<string>("");

  // Recent activity (last 5) - simplified version using availability data
  const recentActivity = useMemo(() => {
    if (!appData?.availability || !appData?.members || !appData?.events)
      return [];

    const activities: StatsData["recentActivity"] = [];

    // Get recent availability records (sorted by creation date if available)
    const recentAvailability = appData.availability
      .filter((record) => record.created_at)
      .sort(
        (a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
      .slice(0, 5);

    recentAvailability.forEach((record) => {
      const member = appData.members!.find((m) => m.id === record.person_id);
      const event = appData.events!.find((e) => e.id.toString() === record.event_id.toString());

      if (member && event) {
        activities.push({
          memberName: member.name,
          memberRole: member.role,
          eventTitle: event.title,
          state: record.state,
          date: record.created_at || event?.date || "Unknown",
        });
      }
    });

    return activities;
  }, [appData?.availability, appData?.members, appData?.events]);

  const stats: StatsData = useMemo(() => {
    if (!appData?.events || !appData?.members || !appData?.availability) {
      return {
        totalEvents: 0,
        totalMembers: 0,
        totalResponses: 0,
        totalPossibleResponses: 0,
        responseRate: 0,
        upcomingEvents: [],
        recentActivity: [],
      };
    }

    const upcomingEvents = appData.events
      .filter((event) => !isPast(event.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map((event) => ({
        id: event.id.toString(),
        title: event.title,
        date: event.date,
        type: event.type,
      }));

    const totalResponses = appData.availability.length;
    const totalPossibleResponses =
      appData.events.length * appData.members.length;

    const responseRate =
      totalPossibleResponses > 0
        ? Math.round((totalResponses / totalPossibleResponses) * 100)
        : 0;

    // Filter recent activity based on privacy settings
    let filteredRecentActivity = recentActivity;
    if (!isAdmin) {
      if (selectedMember) {
        // Show only selected member's activity
        filteredRecentActivity = recentActivity.filter((activity) => {
          const member = appData.members!.find(
            (m) => m.name === activity.memberName
          );
          return member?.id === selectedMember;
        });
      } else {
        // Show no activity if no member selected (privacy protection)
        filteredRecentActivity = [];
      }
    }

    let memberStats: StatsData["memberStats"] | undefined;
    if (selectedMember) {
      const member = appData.members!.find((m) => m.id === selectedMember);
      if (member) {
        const memberAvailability = appData.availability.filter(
          (a) => a.person_id === member.id
        );
        const memberResponses = memberAvailability.length;
        const memberExpectedResponses = appData.events.length;

        const recentResponses = memberAvailability
          .map((record) => {
            const event = appData.events!.find((e) => e.id.toString() === record.event_id.toString());
            return event
              ? {
                  eventTitle: event.title,
                  eventDate: event.date,
                  status: record.state,
                  shouldRespond: true,
                }
              : null;
          })
          .filter(Boolean)
          .slice(0, 10);

        const memberResponseRate =
          memberExpectedResponses > 0
            ? Math.round((memberResponses / memberExpectedResponses) * 100)
            : 0;

        memberStats = {
          member,
          responses: memberResponses,
          expectedResponses: memberExpectedResponses,
          responseRate: memberResponseRate,
          recentResponses: recentResponses as any,
        };
      }
    }

    return {
      totalEvents: appData.events.length,
      totalMembers: appData.members.length,
      totalResponses,
      totalPossibleResponses,
      responseRate,
      upcomingEvents,
      recentActivity: filteredRecentActivity,
      memberStats,
    };
  }, [appData, selectedMember, recentActivity, isAdmin]);

  const members = appData?.members || [];

  return (
    <div className="space-y-6">
      {/* Member Selection */}
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
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({getRoleDisplayName(member.role)})
                  </SelectItem>
                )) || []}
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
              {getRoleDisplayName(stats.memberStats.member.role)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">
                  {stats.memberStats.responses}/
                  {stats.memberStats.expectedResponses}
                </div>
                <div className="text-sm text-white/70">{t.responses}</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5">
                <div className="text-2xl font-bold text-white">
                  {stats.memberStats.responseRate}%
                </div>
                <div className="text-sm text-white/70">
                  {t.yourResponseRate}
                </div>
              </div>
            </div>

            {/* Recent responses for selected member */}
            {stats.memberStats.recentResponses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">
                  {t.recentResponses}:
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.memberStats.recentResponses.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-white truncate">
                          {event.eventTitle}
                        </div>
                        <div className="text-white/60 text-xs">
                          {formatDateShort(event.eventDate)}
                        </div>
                      </div>
                      <Badge
                        className={`ml-3 ${
                          event.status === "A"
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
                          ? getAvailabilityIcon(
                              event.status as AvailabilityState
                            )
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
                      {getEventTypeIcon(event.type as any)}
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
              {isAdmin
                ? t.recentActivity
                : selectedMember
                ? t.yourRecentActivity
                : t.recentActivity}
              {!isAdmin && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {t.private}
                </span>
              )}
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
                        {activity.memberRole &&
                          getRoleDisplayName(activity.memberRole as any)}{" "}
                        •{formatDateShort(activity.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                {!isAdmin && !selectedMember ? (
                  <div className="space-y-2">
                    <div className="text-2xl mb-2">🔒</div>
                    <p>{t.selectNameToViewActivity}</p>
                    <p className="text-sm">{t.activityFromOthersPrivate}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📭</div>
                    <p>{t.noRecentActivity}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
