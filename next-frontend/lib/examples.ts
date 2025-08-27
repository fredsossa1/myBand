// Example usage of the TypeScript types and utilities
// This file demonstrates how to use the band availability types

import {
  Member,
  Event,
  AvailabilityRecord,
  Role,
  AvailabilityState,
  CreateMemberForm,
  CreateEventForm,
} from "./types";

import {
  ROLES,
  AVAILABILITY_STATES,
  getRoleDisplayName,
  getAvailabilityIcon,
  formatDate,
} from "./constants";

import {
  validateCreateMember,
  validateCreateEvent,
  ValidationError,
} from "./validation";

import {
  groupMembersByRole,
  groupAvailabilityByDate,
  calculateAvailabilityStats,
} from "./utils";

// Example data
const exampleMembers: Member[] = [
  { id: "bass1", name: "Josue Tatala", role: "bassist" },
  { id: "piano1", name: "Guillaume Chambaud", role: "pianist" },
  { id: "lead1", name: "Linda Claude K.", role: "lead" },
];

const exampleEvents: Event[] = [
  {
    id: "1",
    date: "2025-08-29",
    title: "Toronto Band",
    description: "",
    type: "service",
  },
];

const exampleAvailability: AvailabilityRecord[] = [
  { id: 1, date: "2025-08-29", person_id: "bass1", state: "A" },
  { id: 2, date: "2025-08-29", person_id: "piano1", state: "U" },
  { id: 3, date: "2025-08-29", person_id: "lead1", state: "?" },
];

// Example usage functions
export function demoTypeUsage() {
  console.log("=== Band Availability TypeScript Demo ===\n");

  // 1. Working with roles
  console.log("Available roles:");
  Object.entries(ROLES).forEach(([key, displayName]) => {
    console.log(`  ${key}: ${displayName}`);
  });
  console.log("");

  // 2. Working with members
  console.log("Members by role:");
  const membersByRole = groupMembersByRole(exampleMembers);
  Object.entries(membersByRole).forEach(([role, members]) => {
    if (members.length > 0) {
      console.log(`  ${getRoleDisplayName(role as Role)}:`);
      members.forEach((member: Member) => {
        console.log(`    - ${member.name} (${member.id})`);
      });
    }
  });
  console.log("");

  // 3. Working with availability
  console.log("Availability states:");
  Object.entries(AVAILABILITY_STATES).forEach(([key, displayName]) => {
    const icon = getAvailabilityIcon(key as AvailabilityState);
    console.log(`  ${key}: ${icon} ${displayName}`);
  });
  console.log("");

  // 4. Working with events
  console.log("Events:");
  exampleEvents.forEach((event) => {
    console.log(`  ${formatDate(event.date)}: ${event.title} (${event.type})`);
  });
  console.log("");

  // 5. Availability summary
  console.log("Availability for 2025-08-29:");
  const availabilityByDate = groupAvailabilityByDate(exampleAvailability);
  const dateAvailability = availabilityByDate["2025-08-29"] || {};

  exampleMembers.forEach((member) => {
    const state = dateAvailability[member.id];
    const icon = state ? getAvailabilityIcon(state) : "❔";
    const status = state ? AVAILABILITY_STATES[state] : "No response";
    console.log(`  ${member.name}: ${icon} ${status}`);
  });
  console.log("");

  // 6. Statistics
  const stats = calculateAvailabilityStats(
    exampleMembers,
    exampleEvents,
    exampleAvailability
  );
  console.log("Statistics:");
  console.log(`  Total members: ${stats.totalMembers}`);
  console.log(`  Total events: ${stats.totalEvents}`);
  console.log("");
}

// Example form validation
export function demoFormValidation() {
  console.log("=== Form Validation Demo ===\n");

  // Valid member creation
  try {
    const validMemberData: CreateMemberForm = {
      name: "John Doe",
      role: "guitarist" as any, // This should fail
    };

    const validatedMember = validateCreateMember(validMemberData);
    console.log("✅ Valid member:", validatedMember);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log("❌ Member validation failed:", error.message);
      if (error.field) {
        console.log("   Field:", error.field);
      }
    }
  }

  // Valid event creation
  try {
    const validEventData: CreateEventForm = {
      date: "2025-12-25",
      title: "Christmas Service",
      description: "Special Christmas celebration",
      type: "special-event",
    };

    const validatedEvent = validateCreateEvent(validEventData);
    console.log("✅ Valid event:", validatedEvent);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log("❌ Event validation failed:", error.message);
    }
  }

  console.log("");
}

// Uncomment to run the demo
// demoTypeUsage();
// demoFormValidation();
