import { 
  Member, 
  MembersByRole, 
  Event, 
  AvailabilityRecord, 
  AvailabilityByDate, 
  AvailabilityByRole, 
  Role, 
  AvailabilityState,
  AvailabilityStats 
} from './types';
import { getAllRoles, sortMembersByRole, sortDateStrings } from './constants';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging Tailwind classes (required by shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Member utilities
export function groupMembersByRole(members: Member[] | undefined): MembersByRole {
  const grouped = {
    bassist: [],
    pianist: [],
    drummer: [],
    lead: [],
    bv: [],
    admin: [],
  } as MembersByRole;

  // Handle case where members data hasn't loaded yet
  if (!members || !Array.isArray(members)) {
    return grouped;
  }

  members.forEach((member) => {
    if (grouped[member.role]) {
      grouped[member.role].push(member);
    }
  });

  // Sort members within each role by name
  Object.keys(grouped).forEach((role) => {
    grouped[role as Role].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

export function flattenMembersByRole(membersByRole: MembersByRole): Member[] {
  const members: Member[] = [];

  getAllRoles().forEach((role) => {
    if (membersByRole[role]) {
      members.push(...membersByRole[role]);
    }
  });

  return members.sort((a, b) => {
    // Sort by role first, then by name
    const roleOrder: Role[] = ["lead", "bv", "pianist", "bassist", "drummer"];
    const roleComparison =
      roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    if (roleComparison !== 0) return roleComparison;
    return a.name.localeCompare(b.name);
  });
}

export function findMemberById(
  members: Member[],
  id: string
): Member | undefined {
  return members.find((member) => member.id === id);
}

export function getMembersByRole(members: Member[], role: Role): Member[] {
  return members.filter((member) => member.role === role);
}

// Event utilities
export function sortEventsByDate(events: Event[]): Event[] {
  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getEventsForDateRange(
  events: Event[],
  startDate: string,
  endDate: string
): Event[] {
  return events.filter(
    (event) => event.date >= startDate && event.date <= endDate
  );
}

export function getUpcomingEvents(events: Event[], days = 30): Event[] {
  const today = new Date();
  const cutoffDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= cutoffDate;
  });
}

export function getPastEvents(events: Event[], days = 30): Event[] {
  const today = new Date();
  const cutoffDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate < today && eventDate >= cutoffDate;
  });
}

export function findEventByDate(
  events: Event[],
  date: string
): Event | undefined {
  return events.find((event) => event.date === date);
}

// Availability utilities
export function groupAvailabilityByDate(
  availability: AvailabilityRecord[] | undefined
): AvailabilityByDate {
  const grouped: AvailabilityByDate = {};

  // Handle case where availability data hasn't loaded yet
  if (!availability || !Array.isArray(availability)) {
    return grouped;
  }

  availability.forEach((record) => {
    if (!grouped[record.date]) {
      grouped[record.date] = {};
    }
    grouped[record.date][record.person_id] = record.state;
  });

  return grouped;
}

export function groupAvailabilityByRole(
  availability: AvailabilityRecord[],
  members: Member[]
): AvailabilityByRole {
  const membersByRole = groupMembersByRole(members);
  const grouped = {} as AvailabilityByRole;

  // Initialize structure
  getAllRoles().forEach((role) => {
    grouped[role] = {};
    membersByRole[role].forEach((member) => {
      grouped[role][member.id] = {
        name: member.name,
        availability: {},
      };
    });
  });

  // Populate availability data
  availability.forEach((record) => {
    const member = findMemberById(members, record.person_id);
    if (
      member &&
      grouped[member.role] &&
      grouped[member.role][record.person_id]
    ) {
      grouped[member.role][record.person_id].availability[record.date] =
        record.state;
    }
  });

  return grouped;
}

export function getAvailabilityForDate(
  availability: AvailabilityRecord[],
  date: string
): AvailabilityRecord[] {
  return availability.filter((record) => record.date === date);
}

export function getAvailabilityForMember(
  availability: AvailabilityRecord[],
  memberId: string
): AvailabilityRecord[] {
  return availability.filter((record) => record.person_id === memberId);
}

export function getMemberAvailabilityState(
  availability: AvailabilityRecord[],
  memberId: string,
  date: string
): AvailabilityState | null {
  const record = availability.find(
    (r) => r.person_id === memberId && r.date === date
  );
  return record ? record.state : null;
}

// Statistics utilities
export function calculateAvailabilityStats(
  members: Member[],
  events: Event[],
  availability: AvailabilityRecord[]
): AvailabilityStats {
  const membersByRole = groupMembersByRole(members);
  const availabilityByRole = {} as AvailabilityStats["availabilityByRole"];

  // Calculate availability by role
  getAllRoles().forEach((role) => {
    availabilityByRole[role] = {
      available: 0,
      unavailable: 0,
      uncertain: 0,
    };

    membersByRole[role].forEach((member) => {
      const memberAvailability = getAvailabilityForMember(
        availability,
        member.id
      );
      memberAvailability.forEach((record) => {
        if (record.state === "A") availabilityByRole[role].available++;
        else if (record.state === "U") availabilityByRole[role].unavailable++;
        else if (record.state === "?") availabilityByRole[role].uncertain++;
      });
    });
  });

  // Calculate most available members
  const memberScores = members.map((member) => {
    const memberAvailability = getAvailabilityForMember(
      availability,
      member.id
    );
    const availableCount = memberAvailability.filter(
      (r) => r.state === "A"
    ).length;
    const totalCount = memberAvailability.length;
    const score = totalCount > 0 ? (availableCount / totalCount) * 100 : 0;

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      availabilityScore: Math.round(score),
    };
  });

  const mostAvailableMembers = memberScores
    .sort((a, b) => b.availabilityScore - a.availabilityScore)
    .slice(0, 10);

  // Calculate least covered events
  const eventCoverage = events.map((event) => {
    const eventAvailability = getAvailabilityForDate(availability, event.date);
    const availableCount = eventAvailability.filter(
      (r) => r.state === "A"
    ).length;
    const totalResponses = eventAvailability.length;
    const score =
      totalResponses > 0 ? (availableCount / totalResponses) * 100 : 0;

    return {
      date: event.date,
      title: event.title,
      coverageScore: Math.round(score),
    };
  });

  const leastCoveredEvents = eventCoverage
    .sort((a, b) => a.coverageScore - b.coverageScore)
    .slice(0, 10);

  return {
    totalMembers: members.length,
    totalEvents: events.length,
    availabilityByRole,
    mostAvailableMembers,
    leastCoveredEvents,
  };
}

// Coverage utilities
export function getEventCoverage(
  availability: AvailabilityRecord[],
  members: Member[],
  date: string
): {
  [role in Role]: {
    available: Member[];
    unavailable: Member[];
    uncertain: Member[];
  };
} {
  const membersByRole = groupMembersByRole(members);
  const eventAvailability = getAvailabilityForDate(availability, date);

  const coverage = {} as {
    [role in Role]: {
      available: Member[];
      unavailable: Member[];
      uncertain: Member[];
    };
  };

  getAllRoles().forEach((role) => {
    coverage[role] = {
      available: [],
      unavailable: [],
      uncertain: [],
    };

    membersByRole[role].forEach((member) => {
      const memberState = getMemberAvailabilityState(
        availability,
        member.id,
        date
      );

      if (memberState === "A") {
        coverage[role].available.push(member);
      } else if (memberState === "U") {
        coverage[role].unavailable.push(member);
      } else if (memberState === "?") {
        coverage[role].uncertain.push(member);
      }
      // If no state, member hasn't responded yet
    });
  });

  return coverage;
}

export function getRoleCompleteness(
  availability: AvailabilityRecord[],
  members: Member[],
  date: string
): { [role in Role]: number } {
  const membersByRole = groupMembersByRole(members);
  const completeness = {} as { [role in Role]: number };

  getAllRoles().forEach((role) => {
    const roleMembers = membersByRole[role];
    const respondedMembers = roleMembers.filter(
      (member) =>
        getMemberAvailabilityState(availability, member.id, date) !== null
    );

    completeness[role] =
      roleMembers.length > 0
        ? Math.round((respondedMembers.length / roleMembers.length) * 100)
        : 100;
  });

  return completeness;
}

// Bulk operation utilities
export function createBulkAvailabilityRecords(
  dates: string[],
  memberIds: string[],
  state: AvailabilityState
): Omit<AvailabilityRecord, "id" | "created_at">[] {
  const records: Omit<AvailabilityRecord, "id" | "created_at">[] = [];

  dates.forEach((date) => {
    memberIds.forEach((memberId) => {
      records.push({
        date,
        person_id: memberId,
        state,
      });
    });
  });

  return records;
}

// Search and filter utilities
export function filterMembersByName(
  members: Member[],
  query: string
): Member[] {
  const lowerQuery = query.toLowerCase();
  return members.filter((member) =>
    member.name.toLowerCase().includes(lowerQuery)
  );
}

export function filterEventsByTitle(events: Event[], query: string): Event[] {
  const lowerQuery = query.toLowerCase();
  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(lowerQuery) ||
      (event.description &&
        event.description.toLowerCase().includes(lowerQuery))
  );
}

export function getUniqueDatesFromAvailability(
  availability: AvailabilityRecord[]
): string[] {
  const dates = new Set(availability.map((record) => record.date));
  return sortDateStrings(Array.from(dates));
}
