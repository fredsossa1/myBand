"use client";

import { useState, useMemo, useEffect } from "react";
import { useAvailability } from "@/hooks/use-availability";
import { useAdmin } from "@/hooks/use-admin";
import { EventList } from "./schedule/event-list";
import { EventDetail } from "./schedule/event-detail";
import { AvailabilityState } from "@/lib/types";

// ---------- Add Event Modal ----------
interface AddEventModalProps {
  onClose: () => void;
  onAdd: (data: { date: string; title: string; description?: string; type: string }) => Promise<void>;
}

function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
  const [form, setForm] = useState({ date: "", title: "Service", description: "", type: "service" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" })).toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.title) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(form);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to add event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl" style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: "var(--app-text)" }}>Add Event</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: "var(--app-text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--app-text-muted)" }}>Date</label>
            <input type="date" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--app-text-muted)" }}>Title</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--app-text-muted)" }}>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}>
              <option value="service">Service</option>
              <option value="band-only">Band Only</option>
              <option value="jam-session">Jam Session</option>
              <option value="special-event">Special Event</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--app-text-muted)" }}>Description (optional)</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Sunday morning service"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500/50"
              style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }} />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(248,81,73,0.1)", color: "#f85149", border: "1px solid rgba(248,81,73,0.2)" }}>{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-3 py-2 rounded-lg border text-sm transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !form.date || !form.title}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}>
              {submitting ? "Adding…" : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Schedule Page ----------
export function SchedulePage() {
  const {
    members,
    events,
    availability,
    loading,
    error,
    currentUser,
    pendingChanges,
    setAvailabilityLocal,
    setAvailabilityRemote,
    refetch,
  } = useAvailability();

  const { isAdmin } = useAdmin();

  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Auto-select first upcoming event on load
  useEffect(() => {
    if (selectedEventId || !events?.length) return;
    const todayStr = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }))
      .toISOString().split("T")[0]!;
    const first = [...(events ?? [])].sort((a, b) => a.date.localeCompare(b.date)).find(e => e.date >= todayStr);
    if (first) setSelectedEventId(first.id);
  }, [events, selectedEventId]);

  const selectedEvent = useMemo(
    () => events?.find(e => e.id.toString() === selectedEventId?.toString()) ?? null,
    [events, selectedEventId]
  );

  const handleSetAvailability = async (eventId: string | number, personId: string, state: AvailabilityState) => {
    const numericId = typeof eventId === "number" ? eventId : Number(eventId);
    setAvailabilityLocal(numericId, personId, state);
    try {
      await setAvailabilityRemote(numericId, personId, state);
    } catch {
      // Revert optimistic update on failure
      const previous = availability?.find(
        a => a.event_id.toString() === numericId.toString() && a.person_id === personId
      );
      if (previous) {
        setAvailabilityLocal(numericId, personId, previous.state);
      }
    }
  };

  const handleAddEvent = async (data: { date: string; title: string; description?: string; type: string }) => {
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: data }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to add event");
    }
    await refetch();
  };

  const handleSelectEvent = (id: string | number) => {
    setSelectedEventId(id);
    setMobileShowDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm" style={{ color: "#f85149" }}>Failed to load: {error}</p>
        <button onClick={refetch} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-white/5"
          style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}>Try again</button>
      </div>
    );
  }

  const eventCount = events?.length ?? 0;
  const memberCount = members?.length ?? 0;

  return (
    <>
      {/* Actions row — title is rendered by PageHeader in app-shell */}
      <div className="flex items-center justify-between -mt-2 mb-4">
        <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
          {eventCount} event{eventCount !== 1 ? "s" : ""} · {memberCount} members
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.5 7C12.5 9.76 10.26 12 7.5 12C4.74 12 2.5 9.76 2.5 7C2.5 4.24 4.74 2 7.5 2C9.1 2 10.52 2.73 11.5 3.86" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M11.5 2V4H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--app-accent)", color: "#0d1117" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Split panel */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: "var(--app-surface)",
          borderColor: "var(--app-border)",
          height: "calc(100vh - 12rem)",
          minHeight: "500px",
        }}
      >
        {/* Mobile: either list or detail */}
        <div className="lg:hidden h-full">
          {mobileShowDetail && selectedEvent ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--app-border)" }}>
                <button onClick={() => setMobileShowDetail(false)} className="flex items-center gap-1.5 text-sm" style={{ color: "var(--app-text-muted)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7L9 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Events
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <EventDetail
                  event={selectedEvent}
                  availability={availability ?? []}
                  members={members ?? []}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  pendingChanges={pendingChanges}
                  onSetAvailability={handleSetAvailability}
                />
              </div>
            </div>
          ) : (
            <EventList
              events={events ?? []}
              availability={availability ?? []}
              members={members ?? []}
              currentUser={currentUser}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
              pendingChanges={pendingChanges}
            />
          )}
        </div>

        {/* Desktop: side-by-side */}
        <div className="hidden lg:grid h-full" style={{ gridTemplateColumns: "minmax(260px, 2fr) minmax(0, 3fr)" }}>
          {/* Left: event list */}
          <div className="border-r h-full overflow-hidden" style={{ borderColor: "var(--app-border)" }}>
            <EventList
              events={events ?? []}
              availability={availability ?? []}
              members={members ?? []}
              currentUser={currentUser}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
              pendingChanges={pendingChanges}
            />
          </div>

          {/* Right: event detail */}
          <div className="h-full overflow-hidden">
            <EventDetail
              event={selectedEvent}
              availability={availability ?? []}
              members={members ?? []}
              currentUser={currentUser}
              isAdmin={isAdmin}
              pendingChanges={pendingChanges}
              onSetAvailability={handleSetAvailability}
            />
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEventModal onClose={() => setShowAddModal(false)} onAdd={handleAddEvent} />
      )}
    </>
  );
}
