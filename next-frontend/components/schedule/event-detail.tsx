"use client";

import { useMemo } from "react";
import { Event, AvailabilityRecord, Member, AvailabilityState, Role } from "@/lib/types";
import { calculateEventCoverage, groupAvailabilityByDate, groupMembersByRole } from "@/lib/utils";
import { formatDate, getRoleDisplayName } from "@/lib/constants";

interface EventDetailProps {
  event: Event | null;
  availability: AvailabilityRecord[];
  members: Member[];
  currentUser: Member | null;
  isAdmin: boolean;
  pendingChanges: Map<string, { state: AvailabilityState }>;
  onSetAvailability: (eventId: string | number, personId: string, state: AvailabilityState) => Promise<void>;
}

const ROLE_ORDER: Role[] = ["lead", "bv", "bassist", "pianist", "drummer", "violinist"];

const COVERAGE_LABEL: Record<string, string> = {
  lead: "Lead Vocals",
  bv: "BVs",
  bassist: "Bass",
  pianist: "Keys",
  drummer: "Drums",
  violinist: "Violin ✨",
};

function StatusButton({
  state,
  currentState,
  onClick,
  loading,
}: {
  state: AvailabilityState;
  currentState: AvailabilityState | null;
  onClick: () => void;
  loading?: boolean;
}) {
  const isActive = currentState === state;
  const config = {
    A: { label: "Available", activeColor: "#3fb950", activeBg: "rgba(63,185,80,0.15)", activeBorder: "rgba(63,185,80,0.4)" },
    U: { label: "Unavailable", activeColor: "#f85149", activeBg: "rgba(248,81,73,0.12)", activeBorder: "rgba(248,81,73,0.4)" },
    "?": { label: "Uncertain", activeColor: "#d29922", activeBg: "rgba(210,153,34,0.12)", activeBorder: "rgba(210,153,34,0.4)" },
  }[state];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all text-sm font-medium disabled:opacity-50"
      style={
        isActive
          ? { color: config.activeColor, backgroundColor: config.activeBg, borderColor: config.activeBorder }
          : { color: "var(--app-text-muted)", backgroundColor: "transparent", borderColor: "var(--app-border)" }
      }
    >
      <span className="text-lg">{state === "A" ? "✓" : state === "U" ? "✗" : "?"}</span>
      <span className="text-xs">{config.label}</span>
    </button>
  );
}

function CoverageRoleRow({
  role,
  available,
  required,
  members,
  isAdmin,
}: {
  role: string;
  available: number;
  required: number;
  members: Array<{ id: string; name: string; state: AvailabilityState | null }>;
  isAdmin: boolean;
}) {
  const isOptional = role === "violinist";
  const isMet = isOptional ? available > 0 : available >= required;
  const color = isMet ? "#3fb950" : available > 0 ? "#d29922" : "#f85149";
  const pct = required > 0 ? Math.min(100, Math.round((available / required) * 100)) : available > 0 ? 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-20 text-xs flex-shrink-0" style={{ color: "var(--app-text-muted)" }}>
        {COVERAGE_LABEL[role] ?? role}
      </div>
      <div className="flex-1 rounded-full h-1.5" style={{ backgroundColor: "var(--app-border)" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-10 text-xs text-right flex-shrink-0 tabular-nums" style={{ color }}>
        {isOptional ? (available > 0 ? `${available}` : "—") : `${available}/${required}`}
      </div>
      {isAdmin && (
        <div className="hidden lg:flex gap-1 flex-wrap w-48">
          {members.filter(m => m.state === "A").map(m => (
            <span key={m.id} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(63,185,80,0.1)", color: "#3fb950" }}>{m.name.split(" ")[0]}</span>
          ))}
          {members.filter(m => !m.state).slice(0, 3).map(m => (
            <span key={m.id} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--app-surface-hover)", color: "var(--app-text-muted)" }}>{m.name.split(" ")[0]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ResponseTable({
  members,
  availability,
  event,
  pendingChanges,
}: {
  members: Member[];
  availability: AvailabilityRecord[];
  event: Event;
  pendingChanges: Map<string, { state: AvailabilityState }>;
}) {
  const membersByRole = groupMembersByRole(members);

  const getState = (member: Member): AvailabilityState | null => {
    const key = `${event.id}-${member.id}`;
    if (pendingChanges.has(key)) return pendingChanges.get(key)!.state;
    return availability.find(a => a.event_id.toString() === event.id.toString() && a.person_id === member.id)?.state ?? null;
  };

  const stateConfig = {
    A: { label: "Available", color: "#3fb950", bg: "rgba(63,185,80,0.1)" },
    U: { label: "Unavailable", color: "#f85149", bg: "rgba(248,81,73,0.08)" },
    "?": { label: "Uncertain", color: "#d29922", bg: "rgba(210,153,34,0.1)" },
  };

  return (
    <div className="space-y-4">
      {ROLE_ORDER.map((role) => {
        const roleMembers = membersByRole[role];
        if (!roleMembers || roleMembers.length === 0) return null;
        const responded = roleMembers.filter(m => getState(m) !== null).length;
        return (
          <div key={role}>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
              {getRoleDisplayName(role)} · {responded}/{roleMembers.length}
            </p>
            <div className="space-y-1">
              {roleMembers.map((member) => {
                const state = getState(member);
                const cfg = state ? stateConfig[state] : null;
                return (
                  <div key={member.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ backgroundColor: "var(--app-surface-hover)" }}>
                    <span className="text-sm" style={{ color: "var(--app-text)" }}>{member.name}</span>
                    {cfg ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>No response</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EventDetail({
  event,
  availability,
  members,
  currentUser,
  isAdmin,
  pendingChanges,
  onSetAvailability,
}: EventDetailProps) {
  const availabilityByDate = useMemo(
    () => groupAvailabilityByDate(availability, event ? [event] : []),
    [availability, event]
  );

  const coverage = useMemo(
    () => event ? calculateEventCoverage(event, members, availabilityByDate) : null,
    [event, members, availabilityByDate]
  );

  const userState = useMemo((): AvailabilityState | null => {
    if (!currentUser || !event) return null;
    const key = `${event.id}-${currentUser.id}`;
    if (pendingChanges.has(key)) return pendingChanges.get(key)!.state;
    return availability.find(
      a => a.event_id.toString() === event.id.toString() && a.person_id === currentUser.id
    )?.state ?? null;
  }, [currentUser, event, availability, pendingChanges]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 p-8" style={{ color: "var(--app-text-muted)" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity={0.3}>
          <rect x="3" y="6" width="26" height="23" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 13H29" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 3V9M22 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-sm">Select an event</p>
      </div>
    );
  }

  const coverageColor = coverage
    ? coverage.coverageScore >= 100 ? "#3fb950" : coverage.coverageScore >= 50 ? "#d29922" : "#f85149"
    : "var(--app-text-muted)";

  const typeLabel = {
    service: "Service",
    "band-only": "Band Only",
    "jam-session": "Jam Session",
    "special-event": "Special Event",
  }[event.type] ?? event.type;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--app-border)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--app-text)" }}>{event.title}</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
              {formatDate(event.date)}
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--app-surface-hover)", color: "var(--app-text-muted)" }}>{typeLabel}</span>
            </p>
          </div>
          {coverage && (
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold tabular-nums" style={{ color: coverageColor }}>{coverage.coverageScore}%</p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>coverage</p>
            </div>
          )}
        </div>
        {event.description && (
          <p className="mt-2 text-sm" style={{ color: "var(--app-text-muted)" }}>{event.description}</p>
        )}
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* YOUR STATUS — primary action */}
        {currentUser && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
              Your Availability
            </p>
            <div className="flex gap-2">
              {(["A", "U", "?"] as AvailabilityState[]).map((state) => (
                <StatusButton
                  key={state}
                  state={state}
                  currentState={userState}
                  onClick={() => onSetAvailability(event.id, currentUser.id, state)}
                />
              ))}
            </div>
            {!currentUser && (
              <p className="mt-2 text-xs" style={{ color: "var(--app-text-muted)" }}>Sign in to mark your availability</p>
            )}
          </div>
        )}

        {/* BAND COVERAGE */}
        {coverage && (
          <div>
            <div className="h-px mb-5" style={{ backgroundColor: "var(--app-border)" }} />
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
              Band Coverage
            </p>
            <div className="space-y-1">
              {ROLE_ORDER.map((role) => {
                const rc = coverage.coverageByRole[role];
                if (!rc) return null;
                return (
                  <CoverageRoleRow
                    key={role}
                    role={role}
                    available={rc.available}
                    required={rc.required}
                    members={rc.members}
                    isAdmin={isAdmin}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* RESPONSES — admin only */}
        {isAdmin && (
          <div>
            <div className="h-px mb-5" style={{ backgroundColor: "var(--app-border)" }} />
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--app-text-muted)", opacity: 0.6 }}>
              Responses
            </p>
            <ResponseTable
              members={members}
              availability={availability}
              event={event}
              pendingChanges={pendingChanges}
            />
          </div>
        )}
      </div>
    </div>
  );
}
