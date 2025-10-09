import { Role, AvailabilityState, EventType } from "./types";

// Role constants and utilities - these are fallbacks, actual translations come from i18n
export const ROLES: Record<Role, string> = {
  bassist: "Bassist",
  pianist: "Pianist",
  drummer: "Drummer",
  lead: "Lead Vocals",
  bv: "Background Vocals",
  violinist: "Violinist",
  admin: "Administrator",
} as const;

export const ROLE_ICONS: Record<Role, string> = {
  bassist: "🎸",
  pianist: "🎹",
  drummer: "🥁",
  lead: "🎤",
  bv: "🎵",
  violinist: "🎻",
  admin: "👑",
} as const;

export const ROLE_COLORS: Record<Role, string> = {
  bassist: "from-blue-500 to-blue-600",
  pianist: "from-purple-500 to-purple-600",
  drummer: "from-red-500 to-red-600",
  lead: "from-yellow-500 to-yellow-600",
  bv: "from-green-500 to-green-600",
  violinist: "from-indigo-500 to-indigo-600",
  admin: "from-purple-700 to-purple-800",
} as const;

// Availability state constants and utilities
export const AVAILABILITY_STATES: Record<AvailabilityState, string> = {
  A: "Available",
  U: "Unavailable",
  "?": "Uncertain",
} as const;

export const AVAILABILITY_ICONS: Record<AvailabilityState, string> = {
  A: "✅",
  U: "❌",
  "?": "❓",
} as const;

export const AVAILABILITY_COLORS: Record<AvailabilityState, string> = {
  A: "bg-green-500/20 border-green-500/40 text-green-300",
  U: "bg-red-500/20 border-red-500/40 text-red-300",
  "?": "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
} as const;

// Event type constants
export const EVENT_TYPES: Record<EventType, string> = {
  service: "Service",
  "band-only": "Band Only",
  "jam-session": "Jam Session",
  "special-event": "Special Event",
} as const;

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  service: "⛪",
  "band-only": "🎸",
  "jam-session": "�",
  "special-event": "⭐",
} as const;

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  service: "from-blue-500 to-blue-600",
  "band-only": "from-orange-500 to-orange-600",
  "jam-session": "from-purple-500 to-purple-600",
  "special-event": "from-yellow-500 to-yellow-600",
} as const;

// Utility functions
export function getRoleDisplayName(role: Role): string {
  return ROLES[role];
}

// Translation-aware role display function
export function getRoleDisplayNameTranslated(role: Role, t: any): string {
  switch (role) {
    case "bassist":
      return t.bassist;
    case "pianist":
      return t.pianist;
    case "drummer":
      return t.drummer;
    case "lead":
      return t.lead;
    case "bv":
      return t.backgroundVocals;
    case "violinist":
      return t.violinist;
    case "admin":
      return t.admin;
    default:
      return ROLES[role];
  }
}

export function getRoleIcon(role: Role): string {
  return ROLE_ICONS[role];
}

export function getAvailabilityIcon(state: AvailabilityState): string {
  return AVAILABILITY_ICONS[state];
}

export function getAvailabilityIconOrDefault(
  state: AvailabilityState | null
): string {
  return state ? AVAILABILITY_ICONS[state] : "⭕"; // Circle for untouched
}

export function getAvailabilityDisplayName(state: AvailabilityState): string {
  return AVAILABILITY_STATES[state];
}

export function getAvailabilityDisplayNameOrDefault(
  state: AvailabilityState | null
): string {
  return state ? AVAILABILITY_STATES[state] : "Not Responded";
}

export function getEventTypeIcon(type: EventType): string {
  return EVENT_TYPE_ICONS[type];
}

export function getEventTypeDisplayName(type: EventType): string {
  return EVENT_TYPES[type];
}

// Date formatting utilities
export function formatDate(dateString: string): string {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isToday(dateString: string): boolean {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Get current date in Montreal EST timezone
  const now = new Date();
  const montrealTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Montreal" })
  );

  return date.toDateString() === montrealTime.toDateString();
}

export function isPast(dateString: string): boolean {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Get current date in Montreal EST timezone
  const now = new Date();
  const montrealTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Montreal" })
  );
  montrealTime.setHours(0, 0, 0, 0);

  return date < montrealTime;
}

export function isFuture(dateString: string): boolean {
  // Parse as local date to avoid timezone issues
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Get current date in Montreal EST timezone
  const now = new Date();
  const montrealTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Montreal" })
  );
  montrealTime.setHours(23, 59, 59, 999);

  return date > montrealTime;
}

// Generate date string in YYYY-MM-DD format
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Generate unique ID for new events/members
export function generateId(): string {
  return Date.now().toString();
}

// Validation utilities
export function isValidRole(role: string): role is Role {
  return Object.keys(ROLES).includes(role as Role);
}

export function isValidAvailabilityState(
  state: string
): state is AvailabilityState {
  return ["A", "U", "?"].includes(state);
}

export function isValidEventType(type: string): type is EventType {
  return Object.keys(EVENT_TYPES).includes(type as EventType);
}

// Array utilities for roles
export function getAllRoles(): Role[] {
  return Object.keys(ROLES) as Role[];
}

// Sort utilities
export function sortMembersByRole(
  members: Array<{ role: Role; name: string }>
): Array<{ role: Role; name: string }> {
  const roleOrder: Role[] = ["lead", "bv", "pianist", "bassist", "drummer"];

  return members.sort((a, b) => {
    const roleComparison =
      roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    if (roleComparison !== 0) return roleComparison;
    return a.name.localeCompare(b.name);
  });
}

export function sortDateStrings(dates: string[]): string[] {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}

// Keyboard shortcut utilities
export function formatKeyboardShortcut(shortcut: {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());

  return parts.join(" + ");
}
