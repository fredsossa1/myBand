"use client";

import { useMemo } from "react";
import { Event, AvailabilityRecord, Member, AvailabilityState } from "@/lib/types";
import { calculateEventCoverage, groupAvailabilityByDate } from "@/lib/utils";
import { formatDateShort } from "@/lib/constants";

interface EventListProps {
  events: Event[];
  availability: AvailabilityRecord[];
  members: Member[];
  currentUser: Member | null;
  selectedEventId: string | number | null;
  onSelectEvent: (id: string | number) => void;
  pendingChanges: Map<string, { state: AvailabilityState }>;
}

const STATUS_CONFIG = {
  A: { label: "Available", color: "#3fb950", bg: "rgba(63,185,80,0.1)" },
  U: { label: "Unavailable", color: "#f85149", bg: "rgba(248,81,73,0.08)" },
  "?": { label: "Uncertain", color: "#d29922", bg: "rgba(210,153,34,0.1)" },
} as const;

function CoverageBar({ score }: { score: number }) {
  const color = score >= 100 ? "#3fb950" : score >= 50 ? "#d29922" : "#f85149";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 rounded-full h-1" style={{ backgroundColor: "var(--app-border)" }}>
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${Math.min(100, score)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums flex-shrink-0" style={{ color, minWidth: "2.5rem", textAlign: "right" }}>
        {score}%
      </span>
    </div>
  );
}

function UserStatus({ state }: { state: AvailabilityState | null }) {
  if (!state) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: "var(--app-text-muted)", backgroundColor: "rgba(48,54,61,0.6)" }}>
        —
      </span>
    );
  }
  const cfg = STATUS_CONFIG[state];
  return (
    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {state === "A" ? "✓" : state === "U" ? "✗" : "?"}
    </span>
  );
}

function EventRow({
  event,
  isSelected,
  isToday,
  coverage,
  userState,
  onClick,
}: {
  event: Event;
  isSelected: boolean;
  isToday: boolean;
  coverage: number;
  userState: AvailabilityState | null;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="px-4 py-3 cursor-pointer transition-colors border-b flex flex-col gap-1.5 outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: isSelected ? "var(--app-accent-dim)" : undefined,
        borderLeft: isSelected ? "2px solid var(--app-accent)" : "2px solid transparent",
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--app-surface-hover)"; }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate" style={{ color: isSelected ? "var(--app-accent)" : "var(--app-text)" }}>
          {event.title}
        </span>
        <UserStatus state={userState} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
          {isToday ? (
            <span className="font-medium" style={{ color: "#d29922" }}>Today</span>
          ) : (
            formatDateShort(event.date)
          )}
          <span className="ml-1.5 opacity-60">· {event.type === "band-only" ? "Band" : event.type === "jam-session" ? "Jam" : event.type === "special-event" ? "Special" : "Service"}</span>
        </span>
      </div>
      <CoverageBar score={coverage} />
    </div>
  );
}

export function EventList({
  events,
  availability,
  members,
  currentUser,
  selectedEventId,
  onSelectEvent,
  pendingChanges,
}: EventListProps) {
  const availabilityByDate = useMemo(
    () => groupAvailabilityByDate(availability, events),
    [availability, events]
  );

  const now = useMemo(() => {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }));
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { todayEvents, upcomingEvents, pastEvents } = useMemo(() => {
    const todayStr = now.toISOString().split("T")[0];
    const today: Event[] = [];
    const upcoming: Event[] = [];
    const past: Event[] = [];

    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((e) => {
      if (e.date === todayStr) today.push(e);
      else if (e.date > todayStr) upcoming.push(e);
      else past.push(e);
    });
    return { todayEvents: today, upcomingEvents: upcoming, pastEvents: past.reverse() };
  }, [events, now]);

  const coverageMap = useMemo(() => {
    const map = new Map<string | number, number>();
    events.forEach((e) => {
      const c = calculateEventCoverage(e, members, availabilityByDate);
      map.set(e.id, c.coverageScore);
    });
    return map;
  }, [events, members, availabilityByDate]);

  // Precomputed map for O(1) lookups instead of per-row O(n) scans
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityState>();
    availability.forEach((a) => map.set(`${a.event_id}-${a.person_id}`, a.state));
    return map;
  }, [availability]);

  const getUserState = (event: Event): AvailabilityState | null => {
    if (!currentUser) return null;
    const key = `${event.id}-${currentUser.id}`;
    if (pendingChanges.has(key)) return pendingChanges.get(key)!.state;
    return availabilityMap.get(key) ?? null;
  };

  const renderGroup = (label: string, groupEvents: Event[], isToday = false) => {
    if (groupEvents.length === 0) return null;
    return (
      <div>
        <div className="px-4 py-2 sticky top-0 z-10" style={{ backgroundColor: "var(--app-surface)" }}>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
            {label} · {groupEvents.length}
          </p>
        </div>
        {groupEvents.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            isSelected={selectedEventId?.toString() === event.id.toString()}
            isToday={isToday}
            coverage={coverageMap.get(event.id) ?? 0}
            userState={getUserState(event)}
            onClick={() => onSelectEvent(event.id)}
          />
        ))}
      </div>
    );
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>No events yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {renderGroup("Today", todayEvents, true)}
      {renderGroup("Upcoming", upcomingEvents)}
      {pastEvents.length > 0 && renderGroup("Past", pastEvents.slice(0, 10))}
    </div>
  );
}
