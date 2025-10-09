import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase credentials
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://rwcsctgzntxyadmpsllj.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3NjdGd6bnR4eWFkbXBzbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTY5MTIsImV4cCI6MjA3MTgzMjkxMn0.eavNz7m8wUSJYBGRLk5tpmR7JAomAfWD9egXdOu-ZVk";

const supabase = createClient(supabaseUrl, supabaseKey);

// Database connection logging removed for production security

// Type definitions
export interface Member {
  id: string;
  name: string;
  role: string;
  created_at?: string;
}

export interface Event {
  id?: number;
  date: string;
  title: string;
  description?: string;
  type?: string;
  created_at?: string;
}

export interface AvailabilityRecord {
  id?: number;
  date: string;
  person_id: string;
  state: "A" | "U" | "?";
  created_at?: string;
  updated_at?: string;
}

// Initialize schema
export async function initSchema(defaultMembers: Member[]): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Initializing Supabase schema...");
  }

  try {
    // Check if members exist
    const { data: existingMembers, error: membersError } = await supabase
      .from("members")
      .select("id")
      .limit(1);

    if (membersError) {
      console.error("❌ Error checking members table:", membersError);
      throw new Error(
        "Database connection failed. Please ensure Supabase tables are created."
      );
    }

    // If no members exist, insert default members
    if (!existingMembers || existingMembers.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("📥 Inserting default members...");
      }
      const { error: insertError } = await supabase
        .from("members")
        .insert(defaultMembers);

      if (insertError) {
        console.error("❌ Error inserting default members:", insertError);
        throw new Error("Failed to initialize default members");
      }
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Default members inserted successfully");
      }
    }

    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

// Member functions
export async function getMembers(): Promise<Member[]> {
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Error fetching members:", error);
    throw new Error(`Failed to fetch members: ${error.message}`);
  }

  return members || [];
}

export async function getMemberById(id: string): Promise<Member[]> {
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("❌ Error fetching member by ID:", error);
    throw new Error(`Failed to fetch member: ${error.message}`);
  }

  return members || [];
}

export async function getMembersByRole(): Promise<Record<string, Member[]>> {
  const members = await getMembers();
  const membersByRole: Record<string, Member[]> = {};

  members.forEach((member) => {
    if (!membersByRole[member.role]) {
      membersByRole[member.role] = [];
    }
    membersByRole[member.role].push(member);
  });

  return membersByRole;
}

export async function getPersonById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Person not found
    }
    console.error("❌ Error fetching person:", error);
    throw new Error("Failed to fetch person");
  }

  return data;
}

// Event functions
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date");

  if (error) {
    console.error("❌ Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }

  return data || [];
}

export async function getDates(): Promise<string[]> {
  const events = await getEvents();
  return events.map((event) => event.date);
}

export async function addEvent(
  event: Omit<Event, "id" | "created_at">
): Promise<Event> {
  // Check for exact duplicates (same date, title, and type)
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("date", event.date)
    .eq("title", event.title)
    .eq("type", event.type)
    .single();

  if (existing) {
    throw new Error(
      `An event with the same title "${event.title}" and type "${event.type}" already exists on ${event.date}`
    );
  }

  // Allow multiple different events on the same date
  const { data, error } = await supabase
    .from("events")
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error("❌ Error adding event:", error);
    throw new Error("Failed to add event");
  }

  return data;
}

export async function addDate(date: string): Promise<void> {
  await addEvent({
    date,
    title: "Service",
    description: "",
    type: "service",
  });
}

// Availability functions
export async function setAvailability(
  date: string,
  personId: string,
  state: "A" | "U" | "?"
): Promise<void> {
  // Verify person exists
  const person = await getPersonById(personId);
  if (!person) {
    throw new Error("Person not found");
  }

  // Upsert availability
  const { error } = await supabase.from("availability").upsert(
    [
      {
        date,
        person_id: personId,
        state,
      },
    ],
    {
      onConflict: "date,person_id",
    }
  );

  if (error) {
    console.error("❌ Error setting availability:", error);
    throw new Error("Failed to set availability");
  }
}

export async function getAvailability(): Promise<AvailabilityRecord[]> {
  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .order("date, person_id");

  if (error) {
    console.error("❌ Error fetching availability:", error);
    throw new Error("Failed to fetch availability");
  }

  return data || [];
}

export async function getAvailabilityByRole(): Promise<
  Record<
    string,
    Record<string, Array<{ id: string; name: string; state: string }>>
  >
> {
  // Get all availability records with member info
  const { data, error } = await supabase
    .from("availability")
    .select(
      `
      date,
      person_id,
      state,
      members!inner (
        id,
        name,
        role
      )
    `
    )
    .order("date, person_id");

  if (error) {
    console.error("❌ Error fetching availability by role:", error);
    throw new Error("Failed to fetch availability by role");
  }

  const result: Record<
    string,
    Record<string, Array<{ id: string; name: string; state: string }>>
  > = {};

  (data || []).forEach((record: any) => {
    const { date, person_id, state, members } = record;
    const { name, role } = members;

    if (!result[date]) {
      result[date] = {};
    }
    if (!result[date][role]) {
      result[date][role] = [];
    }

    result[date][role].push({
      id: person_id,
      name,
      state,
    });
  });

  return result;
}

// Admin functions
export async function verifyAdmin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || "worship2024";
  return password === adminPassword;
}

export async function resetData(defaultMembers: Member[]): Promise<void> {
  try {
    // Clear availability
    await supabase.from("availability").delete().neq("id", 0);

    // Clear events
    await supabase.from("events").delete().neq("id", 0);

    // Clear members
    await supabase.from("members").delete().neq("id", "");

    // Re-initialize with default members
    await initSchema(defaultMembers);

    console.log("✅ Data reset complete");
  } catch (error) {
    console.error("❌ Error resetting data:", error);
    throw new Error("Failed to reset data");
  }
}

export default supabase;
