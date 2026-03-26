import { describe, it, expect } from "vitest";
import { StatsService } from "@/lib/stats-service";
import type { Member, Event, AvailabilityRecord } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const lead: Member = { id: "lead1", name: "Linda", role: "lead" };
const bv: Member = { id: "bv1", name: "Ketsia", role: "bv" };
const bassist: Member = { id: "bass1", name: "Josue", role: "bassist" };
const drummer: Member = { id: "drum1", name: "Gaïus", role: "drummer" };

const serviceEvent: Event = { id: 1, date: "2026-04-06", title: "Sunday Service", type: "service" };
const bandOnlyEvent: Event = { id: 2, date: "2026-04-10", title: "Band Rehearsal", type: "band-only" };
const jamEvent: Event = { id: 3, date: "2026-04-15", title: "Jam", type: "jam-session" };

function avail(eventId: number, personId: string, state: "A" | "U" | "?"): AvailabilityRecord {
  return { event_id: eventId, person_id: personId, state };
}

// ─── memberNeedsToRespond ────────────────────────────────────────────────────

describe("StatsService.memberNeedsToRespond", () => {
  it("lead needs to respond to service events", () => {
    expect(StatsService.memberNeedsToRespond(lead, serviceEvent)).toBe(true);
  });

  it("lead does NOT need to respond to band-only events", () => {
    expect(StatsService.memberNeedsToRespond(lead, bandOnlyEvent)).toBe(false);
  });

  it("bv does NOT need to respond to band-only events", () => {
    expect(StatsService.memberNeedsToRespond(bv, bandOnlyEvent)).toBe(false);
  });

  it("bassist needs to respond to all event types", () => {
    expect(StatsService.memberNeedsToRespond(bassist, serviceEvent)).toBe(true);
    expect(StatsService.memberNeedsToRespond(bassist, bandOnlyEvent)).toBe(true);
    expect(StatsService.memberNeedsToRespond(bassist, jamEvent)).toBe(true);
  });

  it("all roles need to respond to jam sessions", () => {
    expect(StatsService.memberNeedsToRespond(lead, jamEvent)).toBe(true);
    expect(StatsService.memberNeedsToRespond(bv, jamEvent)).toBe(true);
    expect(StatsService.memberNeedsToRespond(bassist, jamEvent)).toBe(true);
  });
});

// ─── calculateOverallStats ───────────────────────────────────────────────────

describe("StatsService.calculateOverallStats", () => {
  it("returns zero stats for empty inputs", () => {
    const result = StatsService.calculateOverallStats([], [], []);
    expect(result.totalMembers).toBe(0);
    expect(result.overallResponseRate).toBe(0);
  });

  it("calculates 100% response rate when everyone has responded", () => {
    const members = [bassist, drummer];
    const events = [serviceEvent];
    const availability = [
      avail(1, "bass1", "A"),
      avail(1, "drum1", "A"),
    ];
    const result = StatsService.calculateOverallStats(members, events, availability);
    expect(result.overallResponseRate).toBe(100);
    expect(result.totalActualResponses).toBe(2);
  });

  it("calculates 0% when no one has responded", () => {
    const result = StatsService.calculateOverallStats(
      [bassist, drummer],
      [serviceEvent],
      []
    );
    expect(result.overallResponseRate).toBe(0);
    expect(result.totalActualResponses).toBe(0);
  });

  it("excludes members who don't need to respond from expected count", () => {
    // Lead doesn't need to respond to band-only — only bassist and drummer do
    const members = [lead, bassist, drummer];
    const availability = [
      avail(2, "bass1", "A"),
      avail(2, "drum1", "A"),
    ];
    const result = StatsService.calculateOverallStats(members, [bandOnlyEvent], availability);
    expect(result.totalExpectedResponses).toBe(2); // not 3
    expect(result.overallResponseRate).toBe(100);
  });

  it("computes partial response rate correctly", () => {
    // 2 members required, only 1 responded
    const result = StatsService.calculateOverallStats(
      [bassist, drummer],
      [serviceEvent],
      [avail(1, "bass1", "A")]
    );
    expect(result.overallResponseRate).toBe(50);
  });
});

// ─── calculateMemberStats ────────────────────────────────────────────────────

describe("StatsService.calculateMemberStats", () => {
  it("counts only events the member needs to respond to", () => {
    // Bassist needs to respond to service and band-only; lead doesn't for band-only
    const events = [serviceEvent, bandOnlyEvent];
    const availability = [
      avail(1, "lead1", "A"), // service — counts
      avail(2, "lead1", "A"), // band-only — should NOT count for lead
    ];
    const result = StatsService.calculateMemberStats(lead, events, availability);
    expect(result.expectedResponses).toBe(1); // only service
    expect(result.actualResponses).toBe(1);
  });

  it("tracks available / unavailable / uncertain separately", () => {
    const events = [serviceEvent, bandOnlyEvent, jamEvent];
    const availability = [
      avail(1, "bass1", "A"),
      avail(2, "bass1", "U"),
      avail(3, "bass1", "?"),
    ];
    const result = StatsService.calculateMemberStats(bassist, events, availability);
    expect(result.availableCount).toBe(1);
    expect(result.unavailableCount).toBe(1);
    expect(result.uncertainCount).toBe(1);
    expect(result.responseRate).toBe(100);
  });
});
