import { Member, Event, AvailabilityRecord, Role } from "./types";

export interface MemberStats {
  member: Member;
  expectedResponses: number;
  actualResponses: number;
  responseRate: number;
  availableCount: number;
  unavailableCount: number;
  uncertainCount: number;
}

export interface EventStats {
  event: Event;
  expectedResponses: number;
  actualResponses: number;
  responseRate: number;
  availableCount: number;
  unavailableCount: number;
  uncertainCount: number;
  coverage: boolean;
}

export interface RoleStats {
  role: Role;
  members: Member[];
  expectedResponses: number;
  actualResponses: number;
  responseRate: number;
  availableCount: number;
  unavailableCount: number;
  uncertainCount: number;
}

export interface OverallStats {
  totalMembers: number;
  totalEvents: number;
  totalExpectedResponses: number;
  totalActualResponses: number;
  overallResponseRate: number;
}

export class StatsService {
  /**
   * Determines if a member needs to respond to a specific event based on their role
   */
  static memberNeedsToRespond(member: Member, event: Event): boolean {
    const requirements = {
      service: {
        bassist: 1,
        pianist: 1,
        drummer: 1,
        lead: 1,
        bv: 2,
        violinist: 1,
        admin: 0, // Admin doesn't need to respond to availability
      },
      "band-only": {
        bassist: 1,
        pianist: 1,
        drummer: 1,
        lead: 0, // Leads don't need to respond to band-only events
        bv: 0,
        violinist: 0,
        admin: 0,
      },
      "jam-session": {
        bassist: 1,
        pianist: 1,
        drummer: 1,
        lead: 1,
        bv: 1,
        violinist: 1,
        admin: 0,
      },
      "special-event": {
        bassist: 1,
        pianist: 1,
        drummer: 1,
        lead: 1,
        bv: 2,
        violinist: 1,
        admin: 0,
      },
    };

    const eventRequirements =
      requirements[event.type as keyof typeof requirements] ||
      requirements.service;
    return (eventRequirements[member.role as keyof typeof eventRequirements] || 0) > 0;
  }

  /**
   * Groups availability records by date and member ID for easy lookup
   */
  static groupAvailabilityByDate(availability: AvailabilityRecord[], events?: Event[]): Record<string, Record<string, string>> {
    const grouped: Record<string, Record<string, string>> = {};
    
    if (!events) return grouped;
    
    availability.forEach((record) => {
      const event = events.find(e => e.id.toString() === record.event_id.toString());
      if (event) {
        if (!grouped[event.date]) {
          grouped[event.date] = {};
        }
        grouped[event.date][record.person_id] = record.state;
      }
    });
    
    return grouped;
  }

  /**
   * Calculate overall statistics
   */
  static calculateOverallStats(
    members: Member[],
    events: Event[],
    availability: AvailabilityRecord[]
  ): OverallStats {
    if (!members?.length || !events?.length) {
      return {
        totalMembers: 0,
        totalEvents: 0,
        totalExpectedResponses: 0,
        totalActualResponses: 0,
        overallResponseRate: 0,
      };
    }

    const availabilityByDate = this.groupAvailabilityByDate(availability || []);
    let totalExpectedResponses = 0;
    let totalActualResponses = 0;

    events.forEach((event) => {
      const dayAvail = availabilityByDate[event.date] || {};
      
      members.forEach((member) => {
        if (this.memberNeedsToRespond(member, event)) {
          totalExpectedResponses++;
          if (dayAvail[member.id]) {
            totalActualResponses++;
          }
        }
      });
    });

    return {
      totalMembers: members.length,
      totalEvents: events.length,
      totalExpectedResponses,
      totalActualResponses,
      overallResponseRate: totalExpectedResponses > 0 
        ? Math.round((totalActualResponses / totalExpectedResponses) * 100)
        : 0,
    };
  }

  /**
   * Calculate statistics for a specific member
   */
  static calculateMemberStats(
    member: Member,
    events: Event[],
    availability: AvailabilityRecord[]
  ): MemberStats {
    if (!events?.length) {
      return {
        member,
        expectedResponses: 0,
        actualResponses: 0,
        responseRate: 0,
        availableCount: 0,
        unavailableCount: 0,
        uncertainCount: 0,
      };
    }

    const memberAvailability = availability.filter(a => a.person_id === member.id);
    const availabilityByDate = this.groupAvailabilityByDate(memberAvailability);
    
    let expectedResponses = 0;
    let actualResponses = 0;
    let availableCount = 0;
    let unavailableCount = 0;
    let uncertainCount = 0;

    events.forEach((event) => {
      if (this.memberNeedsToRespond(member, event)) {
        expectedResponses++;
        const response = availabilityByDate[event.date]?.[member.id];
        
        if (response) {
          actualResponses++;
          if (response === "A") availableCount++;
          else if (response === "U") unavailableCount++;
          else if (response === "?") uncertainCount++;
        }
      }
    });

    return {
      member,
      expectedResponses,
      actualResponses,
      responseRate: expectedResponses > 0 
        ? Math.round((actualResponses / expectedResponses) * 100)
        : 0,
      availableCount,
      unavailableCount,
      uncertainCount,
    };
  }

  /**
   * Calculate statistics for all members grouped by role
   */
  static calculateRoleStats(
    members: Member[],
    events: Event[],
    availability: AvailabilityRecord[]
  ): Record<string, RoleStats> {
    const roleStats: Record<string, RoleStats> = {};
    
    // Group members by role
    const membersByRole: Record<string, Member[]> = {};
    members.forEach((member) => {
      if (!membersByRole[member.role]) {
        membersByRole[member.role] = [];
      }
      membersByRole[member.role].push(member);
    });

    // Calculate stats for each role
    Object.entries(membersByRole).forEach(([role, roleMembers]) => {
      let expectedResponses = 0;
      let actualResponses = 0;
      let availableCount = 0;
      let unavailableCount = 0;
      let uncertainCount = 0;

      roleMembers.forEach((member) => {
        const memberStats = this.calculateMemberStats(member, events, availability);
        expectedResponses += memberStats.expectedResponses;
        actualResponses += memberStats.actualResponses;
        availableCount += memberStats.availableCount;
        unavailableCount += memberStats.unavailableCount;
        uncertainCount += memberStats.uncertainCount;
      });

      roleStats[role] = {
        role: role as Role,
        members: roleMembers,
        expectedResponses,
        actualResponses,
        responseRate: expectedResponses > 0 
          ? Math.round((actualResponses / expectedResponses) * 100)
          : 0,
        availableCount,
        unavailableCount,
        uncertainCount,
      };
    });

    return roleStats;
  }

  /**
   * Calculate statistics for a specific event
   */
  static calculateEventStats(
    event: Event,
    members: Member[],
    availability: AvailabilityRecord[]
  ): EventStats {
    if (!members?.length) {
      return {
        event,
        expectedResponses: 0,
        actualResponses: 0,
        responseRate: 0,
        availableCount: 0,
        unavailableCount: 0,
        uncertainCount: 0,
        coverage: false,
      };
    }

    const availabilityByDate = this.groupAvailabilityByDate(availability || []);
    const dayAvail = availabilityByDate[event.date] || {};
    
    let expectedResponses = 0;
    let actualResponses = 0;
    let availableCount = 0;
    let unavailableCount = 0;
    let uncertainCount = 0;

    members.forEach((member) => {
      if (this.memberNeedsToRespond(member, event)) {
        expectedResponses++;
        const response = dayAvail[member.id];
        
        if (response) {
          actualResponses++;
          if (response === "A") availableCount++;
          else if (response === "U") unavailableCount++;
          else if (response === "?") uncertainCount++;
        }
      }
    });

    return {
      event,
      expectedResponses,
      actualResponses,
      responseRate: expectedResponses > 0 
        ? Math.round((actualResponses / expectedResponses) * 100)
        : 0,
      availableCount,
      unavailableCount,
      uncertainCount,
      coverage: availableCount >= Math.ceil(expectedResponses * 0.7), // 70% coverage threshold
    };
  }

  /**
   * Calculate statistics for all events
   */
  static calculateAllEventStats(
    events: Event[],
    members: Member[],
    availability: AvailabilityRecord[]
  ): EventStats[] {
    return events.map(event => this.calculateEventStats(event, members, availability));
  }

  /**
   * Get member's availability for upcoming events with role-based requirements
   */
  static getMemberEventStatus(
    member: Member,
    upcomingEvents: Event[],
    availability: AvailabilityRecord[]
  ): Array<{
    event: Event;
    status: string | null;
    shouldRespond: boolean;
  }> {
    const memberAvailability = availability.filter(a => a.person_id === member.id);
    const availabilityByDate = this.groupAvailabilityByDate(memberAvailability);

    return upcomingEvents.map((event) => ({
      event,
      status: availabilityByDate[event.date]?.[member.id] || null,
      shouldRespond: this.memberNeedsToRespond(member, event),
    }));
  }
}
