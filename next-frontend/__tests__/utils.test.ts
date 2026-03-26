import { describe, it, expect } from "vitest";
import {
  calculateEventCoverage,
  groupAvailabilityByDate,
  groupMembersByRole,
} from "@/lib/utils";
import type { Member, Event, AvailabilityRecord } from "@/lib/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const lead: Member = { id: "lead1", name: "Linda", role: "lead" };
const bv1: Member = { id: "bv1", name: "Ketsia", role: "bv" };
const bv2: Member = { id: "bv2", name: "Merveille", role: "bv" };
const bassist: Member = { id: "bass1", name: "Josue", role: "bassist" };
const pianist: Member = { id: "piano1", name: "Guillaume", role: "pianist" };
const drummer: Member = { id: "drum1", name: "Gaïus", role: "drummer" };
const violinist: Member = { id: "violin1", name: "Auryane", role: "violinist" };

const allMembers = [lead, bv1, bv2, bassist, pianist, drummer, violinist];

const serviceEvent: Event = {
  id: 1,
  date: "2026-04-06",
  title: "Sunday Service",
  type: "service",
};
const bandOnlyEvent: Event = {
  id: 2,
  date: "2026-04-10",
  title: "Band Rehearsal",
  type: "band-only",
};
const jamEvent: Event = {
  id: 3,
  date: "2026-04-15",
  title: "Jam Session",
  type: "jam-session",
};

function avail(
  eventId: number,
  personId: string,
  state: "A" | "U" | "?"
): AvailabilityRecord {
  return { event_id: eventId, person_id: personId, state };
}

// ─── groupAvailabilityByDate ─────────────────────────────────────────────────

describe("groupAvailabilityByDate", () => {
  it("returns empty object when inputs are undefined", () => {
    expect(groupAvailabilityByDate(undefined, undefined)).toEqual({});
    expect(groupAvailabilityByDate([], [])).toEqual({});
  });

  it("groups records under the event's date", () => {
    const records = [
      avail(1, "lead1", "A"),
      avail(1, "bv1", "U"),
    ];
    const result = groupAvailabilityByDate(records, [serviceEvent]);
    expect(result["2026-04-06"]["lead1"]).toBe("A");
    expect(result["2026-04-06"]["bv1"]).toBe("U");
  });

  it("handles multiple events on different dates", () => {
    const records = [
      avail(1, "lead1", "A"),
      avail(2, "bass1", "?"),
    ];
    const result = groupAvailabilityByDate(records, [serviceEvent, bandOnlyEvent]);
    expect(result["2026-04-06"]["lead1"]).toBe("A");
    expect(result["2026-04-10"]["bass1"]).toBe("?");
  });

  it("ignores records whose event_id doesn't match any event", () => {
    const records = [avail(999, "lead1", "A")];
    const result = groupAvailabilityByDate(records, [serviceEvent]);
    expect(result).toEqual({});
  });

  it("later record for same person+event overwrites earlier one", () => {
    const records = [avail(1, "lead1", "A"), avail(1, "lead1", "U")];
    const result = groupAvailabilityByDate(records, [serviceEvent]);
    expect(result["2026-04-06"]["lead1"]).toBe("U");
  });
});

// ─── groupMembersByRole ──────────────────────────────────────────────────────

describe("groupMembersByRole", () => {
  it("returns empty groups for undefined/empty input", () => {
    const result = groupMembersByRole(undefined);
    expect(result.lead).toEqual([]);
    expect(result.bassist).toEqual([]);
  });

  it("correctly groups members by role", () => {
    const result = groupMembersByRole(allMembers);
    expect(result.lead).toHaveLength(1);
    expect(result.bv).toHaveLength(2);
    expect(result.bassist).toHaveLength(1);
    expect(result.violinist).toHaveLength(1);
  });

  it("sorts members within each role alphabetically", () => {
    const result = groupMembersByRole([bv2, bv1]);
    expect(result.bv[0].name).toBe("Ketsia");
    expect(result.bv[1].name).toBe("Merveille");
  });
});

// ─── calculateEventCoverage ──────────────────────────────────────────────────

describe("calculateEventCoverage — service event", () => {
  it("returns 0% when no one has responded", () => {
    const result = calculateEventCoverage(serviceEvent, allMembers, {});
    expect(result.coverageScore).toBe(0);
    expect(result.status).toBe("not-covered");
  });

  it("returns 100% when all required roles are covered", () => {
    const availByDate = {
      "2026-04-06": {
        lead1: "A",
        bv1: "A",
        bv2: "A",
        bass1: "A",
        piano1: "A",
        drum1: "A",
      } as Record<string, "A" | "U" | "?">,
    };
    const result = calculateEventCoverage(serviceEvent, allMembers, availByDate);
    expect(result.coverageScore).toBe(100);
    expect(result.status).toBe("fully-covered");
  });

  it("violinist availability does not change the coverage score", () => {
    // Same as above but with violinist — score should stay 100
    const withViolinist = {
      "2026-04-06": {
        lead1: "A",
        bv1: "A",
        bv2: "A",
        bass1: "A",
        piano1: "A",
        drum1: "A",
        violin1: "A",
      } as Record<string, "A" | "U" | "?">,
    };
    const without = {
      "2026-04-06": {
        lead1: "A",
        bv1: "A",
        bv2: "A",
        bass1: "A",
        piano1: "A",
        drum1: "A",
      } as Record<string, "A" | "U" | "?">,
    };
    expect(calculateEventCoverage(serviceEvent, allMembers, withViolinist).coverageScore).toBe(
      calculateEventCoverage(serviceEvent, allMembers, without).coverageScore
    );
  });

  it("returns partially-covered when only some roles are met", () => {
    // Bassist, pianist, drummer available — 3 of 5 required roles = 60% → partially-covered
    const availByDate = {
      "2026-04-06": { bass1: "A", piano1: "A", drum1: "A" } as Record<string, "A" | "U" | "?">,
    };
    const result = calculateEventCoverage(serviceEvent, allMembers, availByDate);
    expect(result.status).toBe("partially-covered");
    expect(result.coverageScore).toBeGreaterThan(0);
    expect(result.coverageScore).toBeLessThan(100);
  });

  it("unavailable state does not count toward coverage", () => {
    const availByDate = {
      "2026-04-06": {
        lead1: "U",
        bv1: "U",
        bv2: "U",
        bass1: "U",
        piano1: "U",
        drum1: "U",
      } as Record<string, "A" | "U" | "?">,
    };
    const result = calculateEventCoverage(serviceEvent, allMembers, availByDate);
    expect(result.coverageScore).toBe(0);
  });
});

describe("calculateEventCoverage — band-only event", () => {
  it("does not require lead or BV", () => {
    // Only rhythm section available
    const availByDate = {
      "2026-04-10": { bass1: "A", piano1: "A", drum1: "A" } as Record<string, "A" | "U" | "?">,
    };
    const result = calculateEventCoverage(bandOnlyEvent, allMembers, availByDate);
    expect(result.coverageScore).toBe(100);
    expect(result.status).toBe("fully-covered");
  });
});

describe("calculateEventCoverage — jam session", () => {
  it("awards bonus points for extra participants beyond minimum", () => {
    // Exactly the minimum (1 of each required role)
    const minimum = {
      "2026-04-15": { lead1: "A", bv1: "A", bass1: "A", piano1: "A", drum1: "A" } as Record<string, "A" | "U" | "?">,
    };
    // Minimum + extra BV
    const withExtra = {
      "2026-04-15": { lead1: "A", bv1: "A", bv2: "A", bass1: "A", piano1: "A", drum1: "A" } as Record<string, "A" | "U" | "?">,
    };
    const minScore = calculateEventCoverage(jamEvent, allMembers, minimum).coverageScore;
    const extraScore = calculateEventCoverage(jamEvent, allMembers, withExtra).coverageScore;
    expect(minScore).toBe(100);
    expect(extraScore).toBeGreaterThan(100);
    expect(extraScore).toBeLessThanOrEqual(150);
  });

  it("caps the score at 150", () => {
    // Everyone available — should not exceed 150
    const everyone = {
      "2026-04-15": {
        lead1: "A", bv1: "A", bv2: "A",
        bass1: "A", piano1: "A", drum1: "A", violin1: "A",
      } as Record<string, "A" | "U" | "?">,
    };
    const result = calculateEventCoverage(jamEvent, allMembers, everyone);
    expect(result.coverageScore).toBeLessThanOrEqual(150);
  });
});
