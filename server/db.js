import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Use environment variables for Supabase credentials
const supabaseUrl =
  process.env.SUPABASE_URL || "https://rwcsctgzntxyadmpsllj.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y3NjdGd6bnR4eWFkbXBzbGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTY5MTIsImV4cCI6MjA3MTgzMjkxMn0.eavNz7m8wUSJYBGRLk5tpmR7JAomAfWD9egXdOu-ZVk";

const supabase = createClient(supabaseUrl, supabaseKey);

// Always use Supabase - no local file fallback
const USE_SUPABASE = true;

console.log(`NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
console.log(`USE_SUPABASE: ${USE_SUPABASE} (Always true - Supabase only)`);
console.log(`Supabase URL: ${supabaseUrl}`);

// Supabase table management
async function createSupabaseTables() {
  if (!USE_SUPABASE) return false;

  console.log("Creating Supabase tables programmatically...");

  // Since we can't execute arbitrary SQL with the anon key,
  // let's create a simple SQL file that the user can copy-paste
  const sqlContent = `-- Supabase table setup for band availability app
-- Copy and paste this into your Supabase SQL Editor

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Service',
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'service',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  person_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('A', 'U', '?')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, person_id)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin password
INSERT INTO settings (key, value) VALUES ('adminPassword', 'band2025')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_person ON availability(person_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for demo purposes)
DROP POLICY IF EXISTS "Allow all operations on members" ON members;
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Allow all operations on availability" ON availability;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;

CREATE POLICY "Allow all operations on members" ON members FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Allow all operations on availability" ON availability FOR ALL USING (true);
CREATE POLICY "Allow all operations on settings" ON settings FOR ALL USING (true);`;

  console.log("");
  console.log("📋 COPY THIS SQL TO YOUR SUPABASE DASHBOARD:");
  console.log("=".repeat(60));
  console.log(sqlContent);
  console.log("=".repeat(60));
  console.log("");

  return false; // Always return false since we can't create automatically
}

async function ensureSupabaseTables() {
  if (!USE_SUPABASE) return;

  try {
    // Try to query each table to see if it exists
    console.log("Checking Supabase tables...");

    const tableChecks = [
      { name: "members", query: supabase.from("members").select("*").limit(1) },
      { name: "events", query: supabase.from("events").select("*").limit(1) },
      {
        name: "availability",
        query: supabase.from("availability").select("*").limit(1),
      },
      {
        name: "settings",
        query: supabase.from("settings").select("*").limit(1),
      },
    ];

    const missingTables = [];
    const existingTables = [];

    for (const check of tableChecks) {
      try {
        console.log(`Testing table: ${check.name}`);
        const { data, error } = await check.query;
        if (error) {
          console.log(`❌ Error for ${check.name}:`, error.message);
          if (
            error.code === "42P01" ||
            error.message.includes("does not exist") ||
            error.message.includes("table")
          ) {
            missingTables.push(check.name);
          }
        } else {
          console.log(
            `✅ Table ${check.name} exists (found ${data.length} rows)`
          );
          existingTables.push(check.name);
        }
      } catch (e) {
        console.log(`❌ Exception for ${check.name}:`, e.message);
        if (
          e.message.includes("does not exist") ||
          e.message.includes("table")
        ) {
          missingTables.push(check.name);
        }
      }
    }

    if (missingTables.length > 0) {
      console.log(`Missing tables: ${missingTables.join(", ")}`);
      console.log("🔧 Attempting to create missing tables...");

      const created = await createSupabaseTables();

      if (created) {
        console.log("✅ Tables created successfully! Rechecking...");
        // Recheck tables after creation
        const recheckResults = [];
        for (const check of tableChecks) {
          try {
            const { data, error } = await check.query;
            if (!error) {
              recheckResults.push(check.name);
            }
          } catch (e) {
            // Still missing
          }
        }

        if (recheckResults.length === tableChecks.length) {
          console.log("✅ All tables now exist and are accessible!");
          return; // Success, continue using Supabase
        } else {
          console.log(
            `❌ Some tables still missing after creation: ${tableChecks
              .map((t) => t.name)
              .filter((n) => !recheckResults.includes(n))
              .join(", ")}`
          );
        }
      }

      console.log("");
      console.log("If automatic creation failed, please manually:");
      console.log(
        "1. Go to your Supabase dashboard (https://app.supabase.com)"
      );
      console.log("2. Navigate to SQL Editor");
      console.log(
        "3. Copy and paste the contents of 'supabase-setup.sql' file"
      );
      console.log("4. Click 'Run' to create all tables");
      console.log("");
      console.log("Please create the Supabase tables before continuing.");

      // Exit if tables don't exist
      throw new Error(
        "Required Supabase tables are missing. Please create them in Supabase SQL Editor."
      );
    } else {
      console.log(`✅ All Supabase tables exist: ${existingTables.join(", ")}`);
    }
  } catch (e) {
    console.error("❌ Supabase connection error:", e.message);
    console.error(
      "Please check your Supabase configuration and ensure tables exist."
    );
    throw e;
  }
}

function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      localData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (e) {
    console.warn("Could not load data file, using empty state");
  }
}

// No longer needed - we only use Supabase
function saveLocalData() {
  // This function is no longer used since we only use Supabase
  return;
}

export async function initSchema(defaultMembers) {
  await ensureSupabaseTables();

  // Only initialize if members table is empty (first-time setup)
  try {
    const { data: existingMembers } = await supabase
      .from("members")
      .select("id")
      .limit(1);

    if (!existingMembers || existingMembers.length === 0) {
      console.log("📋 First-time setup: Initializing members from config...");

      // Insert all members (only on first run)
      const membersToInsert = [];
      Object.entries(defaultMembers).forEach(([role, people]) => {
        people.forEach((person) => {
          membersToInsert.push({
            id: person.id,
            name: person.name,
            role: role,
          });
        });
      });

      if (membersToInsert.length > 0) {
        await supabase.from("members").insert(membersToInsert);
        console.log(`✅ Initialized ${membersToInsert.length} team members`);
      }
    } else {
      console.log("👥 Members already exist - skipping initialization");
    }

    // Ensure admin password setting exists
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "adminPassword")
      .single();

    if (!settings) {
      await supabase.from("settings").insert({
        key: "adminPassword",
        value: "band2025",
      });
      console.log("🔐 Initialized admin password");
    }
  } catch (e) {
    console.error("Error during initialization:", e.message);
    throw e;
  }
}

export async function resetData(defaultMembers) {
  try {
    console.log("🗑️ Admin reset: Clearing all data...");
    // Clear availability and events only (preserve members for safety)
    await supabase.from("availability").delete().neq("id", "");
    await supabase.from("events").delete().neq("id", "");

    console.log("✅ Reset complete - members preserved");
  } catch (e) {
    console.error("Error resetting data:", e.message);
    throw e;
  }
}

export async function addNewMembers(newMembers) {
  try {
    const membersToInsert = [];
    Object.entries(newMembers).forEach(([role, people]) => {
      people.forEach((person) => {
        membersToInsert.push({
          id: person.id,
          name: person.name,
          role: role,
        });
      });
    });

    if (membersToInsert.length > 0) {
      // Use upsert to avoid duplicates
      await supabase.from("members").upsert(membersToInsert);
      console.log(`✅ Added/updated ${membersToInsert.length} members`);
    }
  } catch (e) {
    console.error("Error adding new members:", e.message);
    throw e;
  }
}

export async function getMembers() {
  try {
    console.log("🔍 getMembers() called - fetching from Supabase...");
    const { data: members, error } = await supabase
      .from("members")
      .select("*")
      .order("role", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Supabase error in getMembers:", error);
      throw error;
    }

    console.log(
      "✅ getMembers() success - found",
      members?.length || 0,
      "members"
    );
    return members || [];
  } catch (e) {
    console.error("❌ Error fetching members from Supabase:", e.message);
    throw e;
  }
}

export async function getMembersByRole() {
  try {
    const members = await getMembers();
    const byRole = {};
    members.forEach((member) => {
      if (!byRole[member.role]) byRole[member.role] = [];
      byRole[member.role].push({
        id: member.id,
        name: member.name,
      });
    });
    return byRole;
  } catch (e) {
    console.error("Error fetching members by role:", e.message);
    throw e;
  }
}

export async function getPersonById(personId) {
  if (USE_SUPABASE) {
    try {
      const { data: member, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", personId)
        .single();

      if (error) throw error;
      return member;
    } catch (e) {
      return null;
    }
  } else {
    for (const [role, people] of Object.entries(localData.members)) {
      const person = people.find((p) => p.id === personId);
      if (person) return { ...person, role };
    }
    return null;
  }
}

export async function getEvents() {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return events || [];
  } catch (e) {
    console.error("Error fetching events from Supabase:", e.message);
    throw e;
  }
}

export async function getDates() {
  const events = await getEvents();
  return events.map((e) => e.date).sort();
}

export async function addEvent(event) {
  const { date, title, description, type = "service" } = event;

  try {
    // Check if event exists
    const { data: existing } = await supabase
      .from("events")
      .select("*")
      .eq("date", date)
      .single();

    if (existing) {
      // Update existing event
      await supabase
        .from("events")
        .update({ title, description, type })
        .eq("date", date);
    } else {
      // Add new event
      await supabase.from("events").insert({
        date,
        title,
        description,
        type,
        created_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error("Error adding event to Supabase:", e.message);
    throw e;
  }
}

export async function addDate(date) {
  // Legacy support - create a basic event
  const events = await getEvents();
  const existing = events.find((e) => e.date === date);
  if (!existing) {
    await addEvent({ date, title: "Service", description: "" });
  }
}

export async function verifyAdmin(password) {
  if (USE_SUPABASE) {
    try {
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "adminPassword")
        .single();

      return password === (setting?.value || "band2025");
    } catch (e) {
      return password === "band2025"; // Fallback
    }
  } else {
    return password === localData.settings.adminPassword;
  }
}

export async function setAvailability(date, personId, state) {
  const person = await getPersonById(personId);
  if (!person) throw new Error("Unknown person");

  try {
    // Check if availability record exists
    const { data: existing } = await supabase
      .from("availability")
      .select("*")
      .eq("date", date)
      .eq("person_id", personId)
      .single();

    if (existing) {
      // Update existing record
      await supabase
        .from("availability")
        .update({ state })
        .eq("date", date)
        .eq("person_id", personId);
    } else {
      // Insert new record
      await supabase.from("availability").insert({
        date,
        person_id: personId,
        state,
      });
    }
  } catch (e) {
    console.error("Error setting availability in Supabase:", e.message);
    throw e;
  }
}

export async function getAvailability() {
  if (USE_SUPABASE) {
    try {
      const events = await getEvents();
      const { data: availability, error } = await supabase.from("availability")
        .select(`
          date,
          person_id,
          state,
          members (
            name,
            role
          )
        `);

      if (error) throw error;

      // Format result: date -> { personId: {state, name, role} }
      const result = {};
      events.forEach((event) => {
        result[event.date] = {};
      });

      availability?.forEach((avail) => {
        if (!result[avail.date]) result[avail.date] = {};
        result[avail.date][avail.person_id] = {
          state: avail.state,
          name: avail.members?.name || "Unknown",
          role: avail.members?.role || "Unknown",
        };
      });

      return result;
    } catch (e) {
      console.error("Error fetching availability from Supabase:", e.message);
      return {};
    }
  } else {
    // Return availability with person details: date -> { personId: {state, name, role} }
    const result = {};
    localData.events.forEach((event) => {
      result[event.date] = {};
      const dayAvail = localData.availability[event.date] || {};

      // Add all people with their availability
      Object.entries(dayAvail).forEach(([personId, state]) => {
        // For local data, we need to find the person synchronously
        let person = null;
        for (const [role, people] of Object.entries(localData.members)) {
          const found = people.find((p) => p.id === personId);
          if (found) {
            person = { ...found, role };
            break;
          }
        }

        if (person) {
          result[event.date][personId] = {
            state,
            name: person.name,
            role: person.role,
          };
        }
      });
    });
    return result;
  }
}

export async function getAvailabilityByRole() {
  if (USE_SUPABASE) {
    try {
      const events = await getEvents();
      const availability = await getAvailability();
      const members = await getMembersByRole();

      // Group by role for easier display: date -> role -> [people with availability]
      const result = {};
      events.forEach((event) => {
        result[event.date] = {};
        Object.keys(members).forEach((role) => {
          result[event.date][role] = [];
        });

        Object.entries(availability[event.date] || {}).forEach(
          ([personId, data]) => {
            const role = data.role;
            if (result[event.date][role]) {
              result[event.date][role].push({
                id: personId,
                name: data.name,
                state: data.state,
              });
            }
          }
        );
      });
      return result;
    } catch (e) {
      console.error("Error fetching availability by role:", e.message);
      return {};
    }
  } else {
    // Return grouped by role for easier display: date -> role -> [people with availability]
    const result = {};
    localData.events.forEach((event) => {
      result[event.date] = {};
      const dayAvail = localData.availability[event.date] || {};

      // Group by role
      Object.keys(localData.members).forEach((role) => {
        result[event.date][role] = [];
      });

      Object.entries(dayAvail).forEach(([personId, state]) => {
        // For local data, find person synchronously
        let person = null;
        for (const [role, people] of Object.entries(localData.members)) {
          const found = people.find((p) => p.id === personId);
          if (found) {
            person = { ...found, role };
            break;
          }
        }

        if (person) {
          result[event.date][person.role].push({
            id: personId,
            name: person.name,
            state,
          });
        }
      });
    });
    return result;
  }
}
