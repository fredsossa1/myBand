import {
  Role,
  EventType,
  AvailabilityState,
  Member,
  Event,
  AvailabilityRecord,
  CreateEventForm,
  CreateMemberForm,
} from "./types";

// Basic validation functions without external dependencies

// Type guards
export function isValidRole(role: string): role is Role {
  return ["bassist", "pianist", "drummer", "lead", "bv"].includes(role as Role);
}

export function isValidAvailabilityState(
  state: string
): state is AvailabilityState {
  return ["A", "U", "?"].includes(state);
}

export function isValidEventType(type: string): type is EventType {
  return ["service", "band-only", "jam-session", "special-event"].includes(
    type as EventType
  );
}

export function isValidDate(dateString: string): boolean {
  // Check YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Check if it's a valid date
  const date = new Date(dateString);
  return (
    !isNaN(date.getTime()) && date.toISOString().split("T")[0] === dateString
  );
}

// Validation errors
export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// Member validation
export function validateMember(data: any): Member {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Member data must be an object");
  }

  if (!data.id || typeof data.id !== "string" || data.id.trim().length === 0) {
    throw new ValidationError("Member ID is required", "id");
  }

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    throw new ValidationError("Member name is required", "name");
  }

  if (data.name.length > 100) {
    throw new ValidationError(
      "Member name is too long (max 100 characters)",
      "name"
    );
  }

  if (!isValidRole(data.role)) {
    throw new ValidationError("Invalid role", "role");
  }

  return {
    id: data.id.trim(),
    name: data.name.trim(),
    role: data.role,
    created_at: data.created_at,
  };
}

export function validateCreateMember(data: any): CreateMemberForm {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Member data must be an object");
  }

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    throw new ValidationError("Member name is required", "name");
  }

  if (data.name.length > 100) {
    throw new ValidationError(
      "Member name is too long (max 100 characters)",
      "name"
    );
  }

  if (!isValidRole(data.role)) {
    throw new ValidationError("Invalid role", "role");
  }

  return {
    name: data.name.trim(),
    role: data.role,
  };
}

// Event validation
export function validateEvent(data: any): Event {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Event data must be an object");
  }

  if (!data.id) {
    throw new ValidationError("Event ID is required", "id");
  }

  if (!isValidDate(data.date)) {
    throw new ValidationError(
      "Invalid date format (must be YYYY-MM-DD)",
      "date"
    );
  }

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim().length === 0
  ) {
    throw new ValidationError("Event title is required", "title");
  }

  if (data.title.length > 200) {
    throw new ValidationError(
      "Event title is too long (max 200 characters)",
      "title"
    );
  }

  if (data.description && data.description.length > 500) {
    throw new ValidationError(
      "Event description is too long (max 500 characters)",
      "description"
    );
  }

  if (!isValidEventType(data.type)) {
    throw new ValidationError("Invalid event type", "type");
  }

  return {
    id: data.id,
    date: data.date,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    type: data.type,
    created_at: data.created_at,
  };
}

export function validateCreateEvent(data: any): CreateEventForm {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Event data must be an object");
  }

  if (!isValidDate(data.date)) {
    throw new ValidationError(
      "Invalid date format (must be YYYY-MM-DD)",
      "date"
    );
  }

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.trim().length === 0
  ) {
    throw new ValidationError("Event title is required", "title");
  }

  if (data.title.length > 200) {
    throw new ValidationError(
      "Event title is too long (max 200 characters)",
      "title"
    );
  }

  if (data.description && data.description.length > 500) {
    throw new ValidationError(
      "Event description is too long (max 500 characters)",
      "description"
    );
  }

  const type = data.type || "service";
  if (!isValidEventType(type)) {
    throw new ValidationError("Invalid event type", "type");
  }

  return {
    date: data.date,
    title: data.title.trim(),
    description: data.description?.trim() || "",
    type: type,
  };
}

// Availability validation
export function validateAvailabilityRecord(data: any): AvailabilityRecord {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Availability data must be an object");
  }

  if (!data.event_id) {
    throw new ValidationError("Event ID is required", "event_id");
  }

  if (
    !data.person_id ||
    typeof data.person_id !== "string" ||
    data.person_id.trim().length === 0
  ) {
    throw new ValidationError("Person ID is required", "person_id");
  }

  if (!isValidAvailabilityState(data.state)) {
    throw new ValidationError(
      "Invalid availability state (must be A, U, or ?)",
      "state"
    );
  }

  return {
    id: data.id,
    event_id: data.event_id,
    person_id: data.person_id.trim(),
    state: data.state,
    created_at: data.created_at,
  };
}

export function validateSetAvailability(data: any): {
  date: string;
  person_id: string;
  state: AvailabilityState;
} {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Availability data must be an object");
  }

  if (!isValidDate(data.date)) {
    throw new ValidationError(
      "Invalid date format (must be YYYY-MM-DD)",
      "date"
    );
  }

  if (
    !data.person_id ||
    typeof data.person_id !== "string" ||
    data.person_id.trim().length === 0
  ) {
    throw new ValidationError("Person ID is required", "person_id");
  }

  if (!isValidAvailabilityState(data.state)) {
    throw new ValidationError(
      "Invalid availability state (must be A, U, or ?)",
      "state"
    );
  }

  return {
    date: data.date,
    person_id: data.person_id.trim(),
    state: data.state,
  };
}

export function validateBulkAvailabilityUpdate(data: any): {
  dates: string[];
  memberIds: string[];
  state: AvailabilityState;
} {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Bulk update data must be an object");
  }

  if (!Array.isArray(data.dates) || data.dates.length === 0) {
    throw new ValidationError("At least one date is required", "dates");
  }

  for (const date of data.dates) {
    if (!isValidDate(date)) {
      throw new ValidationError(
        `Invalid date format: ${date} (must be YYYY-MM-DD)`,
        "dates"
      );
    }
  }

  if (!Array.isArray(data.memberIds) || data.memberIds.length === 0) {
    throw new ValidationError("At least one member is required", "memberIds");
  }

  for (const memberId of data.memberIds) {
    if (
      !memberId ||
      typeof memberId !== "string" ||
      memberId.trim().length === 0
    ) {
      throw new ValidationError(
        "All member IDs must be valid strings",
        "memberIds"
      );
    }
  }

  if (!isValidAvailabilityState(data.state)) {
    throw new ValidationError(
      "Invalid availability state (must be A, U, or ?)",
      "state"
    );
  }

  return {
    dates: data.dates,
    memberIds: data.memberIds.map((id: string) => id.trim()),
    state: data.state,
  };
}

// Utility functions for error handling
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function getValidationErrorMessage(error: unknown): string {
  if (isValidationError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown validation error occurred";
}
