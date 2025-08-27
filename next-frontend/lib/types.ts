// Core data types matching the backend API structures

export type Role = "bassist" | "pianist" | "drummer" | "lead" | "bv";

export type AvailabilityState = "A" | "U" | "?";

export type EventType = "service" | "rehearsal" | "special";

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
  date: string; // ISO date string (YYYY-MM-DD)
  person_id: string;
  state: AvailabilityState;
  created_at?: string;
}

// Availability organized by date and member
export interface AvailabilityByDate {
  [date: string]: {
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
  dates: string[];
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
