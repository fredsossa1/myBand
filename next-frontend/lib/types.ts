// Core data types matching the backend API structures

export type Role =
  | "bassist"
  | "pianist"
  | "drummer"
  | "lead"
  | "bv"
  | "violinist"
  | "admin";

export type AvailabilityState = "A" | "U" | "?";

export type EventType =
  | "service"
  | "band-only"
  | "jam-session"
  | "special-event";

// Member interface
export interface Member {
  id: string;
  name: string;
  role: Role;
  created_at?: string;
}

// Members organized by role (as used in the members.json structure)
export interface MembersByRole {
  bassist: Member[];
  pianist: Member[];
  drummer: Member[];
  lead: Member[];
  bv: Member[];
  violinist: Member[];
  admin: Member[];
}

// Event interface
export interface Event {
  id: string | number;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description?: string;
  type: EventType;
  created_at?: string;
}

// Availability record interface
export interface AvailabilityRecord {
  id?: number;
  event_id: string | number;
  person_id: string;
  state: AvailabilityState;
  created_at?: string;
}

// Availability organized by date and member
// Note: This is now organized by event_id, not just date
export interface AvailabilityByDate {
  [date: string]: {
    [memberId: string]: AvailabilityState;
  };
}

// New: Availability organized by event
export interface AvailabilityByEvent {
  [eventId: string]: {
    [memberId: string]: AvailabilityState;
  };
}

// Availability organized by role (for display purposes)
export type AvailabilityByRole = {
  [K in Role]: {
    [memberId: string]: {
      name: string;
      availability: {
        [date: string]: AvailabilityState;
      };
    };
  };
};

// User context interface for role-based access
export interface UserContext {
  id: string;
  name: string;
  role: Role;
  isAdmin: boolean;
}

// Settings interface
export interface Settings {
  adminPassword: string;
  [key: string]: any;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Bulk operation types
export interface BulkAvailabilityUpdate {
  eventIds: (string | number)[];
  memberIds: string[];
  state: AvailabilityState;
}

// Planning Center integration types
export interface PlanningCenterEvent {
  id: string;
  attributes: {
    title: string;
    dates: string;
    rehearsal_date?: string;
    service_date?: string;
  };
}

// Form types for creating/editing
export interface CreateEventForm {
  date: string;
  title: string;
  description?: string;
  type: EventType;
}

export interface CreateMemberForm {
  name: string;
  role: Role;
}

// UI State types
export interface UIState {
  selectedDates: string[];
  selectedMembers: string[];
  isAdminMode: boolean;
  viewMode: "compact" | "detailed";
  sortBy: "role" | "name" | "availability";
  filterByRole?: Role;
  searchQuery: string;
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

// Export/Import types
export interface ExportData {
  members: Member[];
  events: Event[];
  availability: AvailabilityRecord[];
  exportedAt: string;
}

// Coverage analysis types
export type CoverageStatus =
  | "fully-covered"
  | "partially-covered"
  | "not-covered";

export interface RoleCoverage {
  required: number;
  available: number;
  members: Array<{
    id: string;
    name: string;
    state: AvailabilityState;
  }>;
}

export interface EventCoverage {
  eventId: string | number;
  date: string;
  title: string;
  type: EventType;
  status: CoverageStatus;
  coverageByRole: {
    [K in Role]?: RoleCoverage;
  };
  coverageScore: number; // 0-100%
}

export interface CoverageRequirements {
  service: {
    bassist: number;
    pianist: number;
    drummer: number;
    lead: number;
    bv: number;
    violinist: number;
  };
  "band-only": {
    bassist: number;
    pianist: number;
    drummer: number;
    lead: number;
    bv: number;
    violinist: number;
  };
  "jam-session": {
    bassist: number;
    pianist: number;
    drummer: number;
    lead: number;
    bv: number;
    violinist: number;
  };
  "special-event": {
    bassist: number;
    pianist: number;
    drummer: number;
    lead: number;
    bv: number;
    violinist: number;
  };
}

// Statistics types
export interface AvailabilityStats {
  totalMembers: number;
  totalEvents: number;
  availabilityByRole: {
    [K in Role]: {
      available: number;
      unavailable: number;
      uncertain: number;
    };
  };
  mostAvailableMembers: Array<{
    id: string;
    name: string;
    role: Role;
    availabilityScore: number;
  }>;
  leastCoveredEvents: Array<{
    date: string;
    title: string;
    coverageScore: number;
  }>;
}
