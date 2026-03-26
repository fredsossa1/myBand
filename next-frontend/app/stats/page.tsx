"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/api-hooks";
import { useAdmin } from "@/hooks/use-admin";
import { calculateEventCoverage, groupAvailabilityByDate } from "@/lib/utils";
import { getRoleDisplayName, formatDateShort } from "@/lib/constants";
import { StatsService } from "@/lib/stats-service";
import { Role, AvailabilityRecord } from "@/lib/types";

const ROLE_ORDER: Role[] = ["lead", "bv", "bassist", "pianist", "drummer", "violinist"];

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full h-2" style={{ backgroundColor: "var(--app-border)" }}>
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm tabular-nums w-10 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
      <p className="text-3xl font-bold tracking-tight" style={{ color: color ?? "var(--app-text)" }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>{label}</p>
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [ready, setReady] = useState(false);
  const { members, events, availability, loading, error, refetch } = useAppData();

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) { router.push("/"); return; }
    setReady(true);
  }, [isAdmin, adminLoading, router]);

  const stats = useMemo(() => {
    if (!members || !events || !availability) return null;

    const overallStats = StatsService.calculateOverallStats(members, events, availability);
    const roleStats = StatsService.calculateRoleStats(members, events, availability);

    // Coverage per event (upcoming only)
    const todayStr = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }))
      .toISOString().split("T")[0];
    const upcomingEvents = events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
    const availByDate = groupAvailabilityByDate(availability, events);

    const eventCoverages = upcomingEvents.map(e => ({
      event: e,
      coverage: calculateEventCoverage(e, members, availByDate),
    }));

    const atRisk = eventCoverages.filter(ec => ec.coverage.coverageScore < 70);
    const fullyMet = eventCoverages.filter(ec => ec.coverage.coverageScore >= 100).length;

    // Member response rates (all events)
    const memberRates = members.map(m => {
      const responses = availability.filter(a => a.person_id === m.id);
      const rate = events.length > 0 ? Math.round((responses.length / events.length) * 100) : 0;
      return { member: m, rate, responded: responses.length, total: events.length };
    }).sort((a, b) => a.rate - b.rate);

    return {
      totalMembers: overallStats.totalMembers,
      totalEvents: overallStats.totalEvents,
      totalResponses: overallStats.totalActualResponses,
      responseRate: overallStats.overallResponseRate,
      roleStats,
      atRisk,
      fullyMet,
      memberRates,
      upcomingCount: upcomingEvents.length,
    };
  }, [members, events, availability]);

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm" style={{ color: "#f85149" }}>{error}</p>
        <button onClick={refetch} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-white/5"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>Retry</button>
      </div>
    );
  }

  if (!stats) return null;

  const atRiskColor = stats.atRisk.length === 0 ? "#3fb950" : stats.atRisk.length <= 2 ? "#d29922" : "#f85149";

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Refresh action — title rendered by PageHeader */}
      <div className="flex justify-end -mt-2">
        <button onClick={refetch} className="p-2 rounded-lg border transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }} title="Refresh">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12.5 7C12.5 9.76 10.26 12 7.5 12C4.74 12 2.5 9.76 2.5 7C2.5 4.24 4.74 2 7.5 2C9.1 2 10.52 2.73 11.5 3.86" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M11.5 2V4H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={stats.totalMembers} label="Members" />
        <StatCard value={stats.upcomingCount} label="Upcoming events" />
        <StatCard value={`${stats.responseRate}%`} label="Response rate" />
        <StatCard value={stats.atRisk.length} label="Events at risk" color={atRiskColor} />
      </div>

      {/* Coverage by role */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>Coverage by Role</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>Average response rate across all events</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          {ROLE_ORDER.map(role => {
            const rs = stats.roleStats[role];
            if (!rs || rs.members.length === 0) return null;
            const memberCount = rs.members.length;
            const rate = rs.responseRate ?? 0;
            const color = rate >= 80 ? "#3fb950" : rate >= 50 ? "#d29922" : "#f85149";
            return (
              <div key={role} className="flex items-center gap-4">
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{getRoleDisplayName(role)}</p>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex-1">
                  <Bar value={rate} color={color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events at risk */}
      {stats.atRisk.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "rgba(248,81,73,0.2)" }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(248,81,73,0.15)" }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f85149" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>Events at Risk</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(248,81,73,0.1)", color: "#f85149" }}>
              {stats.atRisk.length} event{stats.atRisk.length !== 1 ? "s" : ""} below 70%
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--app-border)" }}>
            {stats.atRisk.map(({ event, coverage }) => {
              const missingRoles = Object.entries(coverage.coverageByRole)
                .filter(([role, rc]) => role !== "violinist" && rc && rc.available < rc.required)
                .map(([role]) => getRoleDisplayName(role as Role));
              const color = coverage.coverageScore >= 50 ? "#d29922" : "#f85149";
              return (
                <div key={event.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--app-text)" }}>{event.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                      {formatDateShort(event.date)}
                      {missingRoles.length > 0 && (
                        <span className="ml-2" style={{ color: "#f85149" }}>Missing: {missingRoles.join(", ")}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 rounded-full h-1.5" style={{ backgroundColor: "var(--app-border)" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${coverage.coverageScore}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-sm tabular-nums w-10 text-right" style={{ color }}>{coverage.coverageScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member response rates */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>Member Response Rates</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>Sorted by rate — lowest first</p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--app-border)" }}>
          {stats.memberRates.map(({ member, rate, responded, total }) => {
            const color = rate >= 80 ? "#3fb950" : rate >= 50 ? "#d29922" : "#f85149";
            const needsFollowUp = rate < 50;
            return (
              <div key={member.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-36 flex-shrink-0 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--app-text)" }}>{member.name}</p>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{getRoleDisplayName(member.role)}</p>
                </div>
                <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "var(--app-border)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: color }} />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm tabular-nums w-10 text-right" style={{ color }}>{rate}%</span>
                  <span className="text-xs w-16 text-right" style={{ color: "var(--app-text-muted)" }}>{responded}/{total}</span>
                  {needsFollowUp && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(248,81,73,0.1)", color: "#f85149" }}>follow up</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
