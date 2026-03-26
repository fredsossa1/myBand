"use client";

import { useAppData } from "@/lib/api-hooks";
import { useAdmin } from "@/hooks/use-admin";
import { useTranslations } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
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

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
      <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>{label}</p>
      {sub && <div className="mt-3">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? "#3fb950" : value >= 60 ? "#d29922" : "#f85149";
  return (
    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--app-border)" }}>
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatusPill({ state }: { state: AvailabilityState }) {
  const config = {
    A: { label: "Available", color: "#3fb950", bg: "rgba(63, 185, 80, 0.1)" },
    U: { label: "Unavailable", color: "#f85149", bg: "rgba(248, 81, 73, 0.1)" },
    "?": { label: "Uncertain", color: "#d29922", bg: "rgba(210, 153, 34, 0.1)" },
  };
  const c = config[state] || { label: "Unknown", color: "var(--app-text-muted)", bg: "transparent" };
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: c.color, backgroundColor: c.bg }}>
      {c.label}
    </span>
  );
}

export default function Dashboard() {
  const appData = useAppData();
  const isAdmin = useAdmin();
  const { member: authMember } = useUser();
  const t = useTranslations();
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<string>("");

  useEffect(() => {
    if (authMember && !selectedMember) {
      setSelectedMember(authMember.id);
    }
  }, [authMember, selectedMember]);

  const recentActivity = useMemo(() => {
    if (!appData?.availability || !appData?.members || !appData?.events) return [];

    return appData.availability
      .filter((record) => record.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, 5)
      .flatMap((record) => {
        const member = appData.members!.find((m) => m.id === record.person_id);
        const event = appData.events!.find((e) => e.id.toString() === record.event_id.toString());
        if (!member || !event) return [];
        return [{
          memberName: member.name,
          memberRole: member.role,
          eventTitle: event.title,
          state: record.state,
          date: record.created_at || event.date,
        }];
      });
  }, [appData?.availability, appData?.members, appData?.events]);

  const stats: StatsData = useMemo(() => {
    if (!appData?.events || !appData?.members || !appData?.availability) {
      return { totalEvents: 0, totalMembers: 0, totalResponses: 0, totalPossibleResponses: 0, responseRate: 0, upcomingEvents: [], recentActivity: [] };
    }

    const upcomingEvents = appData.events
      .filter((event) => !isPast(event.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map((event) => ({ id: event.id.toString(), title: event.title, date: event.date, type: event.type }));

    const totalResponses = appData.availability.length;
    const totalPossibleResponses = appData.events.length * appData.members.length;
    const responseRate = totalPossibleResponses > 0 ? Math.round((totalResponses / totalPossibleResponses) * 100) : 0;

    let memberStats: StatsData["memberStats"] | undefined;
    if (selectedMember) {
      const member = appData.members.find((m) => m.id === selectedMember);
      if (member) {
        const memberAvailability = appData.availability.filter((a) => a.person_id === member.id);
        const memberExpectedResponses = appData.events.length;
        const recentResponses = memberAvailability
          .map((record) => {
            const event = appData.events!.find((e) => e.id.toString() === record.event_id.toString());
            return event ? { eventTitle: event.title, eventDate: event.date, status: record.state, shouldRespond: true } : null;
          })
          .filter(Boolean)
          .slice(0, 10) as any;

        memberStats = {
          member,
          responses: memberAvailability.length,
          expectedResponses: memberExpectedResponses,
          responseRate: memberExpectedResponses > 0 ? Math.round((memberAvailability.length / memberExpectedResponses) * 100) : 0,
          recentResponses,
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
      recentActivity: isAdmin ? recentActivity : [],
      memberStats,
    };
  }, [appData, selectedMember, recentActivity, isAdmin]);

  const members = appData?.members || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Member selector */}
      <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
        <label className="text-xs font-medium uppercase tracking-wider block mb-2" style={{ color: "var(--app-text-muted)" }}>
          Your name
        </label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
          style={{
            backgroundColor: "var(--app-bg)",
            borderColor: "var(--app-border)",
            color: "var(--app-text)",
          }}
        >
          <option value="">{t.selectName as string}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name} — {getRoleDisplayName(m.role)}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={stats.totalEvents} label={t.upcomingEvents as string} />
        <StatCard value={stats.totalMembers} label={t.bandMembers as string} />
        <StatCard
          value={`${stats.responseRate}%`}
          label={t.overallResponseRate as string}
          sub={
            <div className="space-y-1.5">
              <ProgressBar value={stats.responseRate} />
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                {stats.totalResponses} / {stats.totalPossibleResponses} {t.responses as string}
              </p>
            </div>
          }
        />
      </div>

      {/* Member detail */}
      {stats.memberStats && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
              {stats.memberStats.member.name}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
              {getRoleDisplayName(stats.memberStats.member.role)}
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--app-text)" }}>
                  {stats.memberStats.responses}/{stats.memberStats.expectedResponses}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>{t.responses as string}</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--app-text)" }}>
                  {stats.memberStats.responseRate}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>{t.yourResponseRate as string}</p>
              </div>
            </div>

            {stats.memberStats.recentResponses.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--app-text-muted)" }}>
                  {t.recentResponses as string}
                </p>
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {stats.memberStats.recentResponses.map((event, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/3 transition-colors" style={{ borderBottom: "1px solid var(--app-border)" }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" style={{ color: "var(--app-text)" }}>{event.eventTitle}</p>
                        <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{formatDateShort(event.eventDate)}</p>
                      </div>
                      <StatusPill state={event.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div className={`grid gap-4 ${isAdmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Upcoming events */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>{t.upcomingEvents as string}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--app-border)" }}>
            {stats.upcomingEvents.length > 0 ? stats.upcomingEvents.map((event) => (
              <div key={event.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors">
                <div className="text-lg flex-shrink-0">{getEventTypeIcon(event.type as any)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--app-text)" }}>{event.title}</p>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                    {formatDate(event.date)}
                    {isToday(event.date) && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(210, 153, 34, 0.15)", color: "#d29922" }}>Today</span>
                    )}
                  </p>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity — admin only */}
        {isAdmin && (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>{t.recentActivity as string}</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--app-border)" }}>
              {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors">
                  <div className="text-base flex-shrink-0">{getAvailabilityIcon(activity.state)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--app-text)" }}>
                      <span className="font-medium">{activity.memberName}</span>
                      <span style={{ color: "var(--app-text-muted)" }}> · {activity.eventTitle}</span>
                    </p>
                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                      {getRoleDisplayName(activity.memberRole as any)} · {formatDateShort(activity.date)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>{t.noRecentActivity as string}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
