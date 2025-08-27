import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import {
  initSchema,
  getMembers,
  getMembersByRole,
  getDates,
  getEvents,
  addDate,
  addEvent,
  setAvailability,
  getAvailability,
  getAvailabilityByRole,
  resetData,
  verifyAdmin,
  getPersonById,
} from "./db.js";

const PORT = process.env.PORT || 5173;
const app = express();
app.use(cors());
app.use(express.json());

// Load members config JSON (single source of truth for roles)
const membersConfigPath = path.join(process.cwd(), "data", "members.json");
const defaultMembers = JSON.parse(fs.readFileSync(membersConfigPath, "utf8"));
await initSchema(defaultMembers);

app.use(
  express.static(process.cwd(), {
    // Disable caching for development
    setHeaders: (res, path) => {
      // Disable caching for all files in development
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("ETag", "false");
    },
  })
);

app.get("/api/members", async (req, res) => {
  try {
    console.log("📥 GET /api/members request received");
    const members = await getMembers();
    console.log("📤 Sending members response:", members.length, "members");
    res.json(members);
  } catch (error) {
    console.error("❌ Error in /api/members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.get("/api/members/by-role", async (req, res) => {
  try {
    console.log("📥 GET /api/members/by-role request received");
    const membersByRole = await getMembersByRole();
    console.log("📤 Sending members by role response:", Object.keys(membersByRole), "- total entries:", Object.keys(membersByRole).length);
    console.log("🔍 Full membersByRole data:", JSON.stringify(membersByRole, null, 2));
    res.json(membersByRole);
  } catch (error) {
    console.error("❌ Error in /api/members/by-role:", error);
    res.status(500).json({ error: "Failed to fetch members by role" });
  }
});

app.get("/api/dates", async (req, res) => {
  res.json(await getDates());
});

app.get("/api/events", async (req, res) => {
  res.json(await getEvents());
});

app.post("/api/admin/verify", async (req, res) => {
  const { password } = req.body;
  const isAdmin = await verifyAdmin(password);
  res.json({ isAdmin });
});

app.post("/api/admin/events", async (req, res) => {
  const { password, event } = req.body;
  if (!(await verifyAdmin(password))) {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await addEvent(event);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/dates", async (req, res) => {
  const { date } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: "Invalid date" });
  await addDate(date);
  res.json({ ok: true });
});

app.post("/api/dates/range", async (req, res) => {
  const { start, end, stepDays = 7 } = req.body;
  if (!start || !end)
    return res.status(400).json({ error: "Missing start/end" });
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (e < s) return res.status(400).json({ error: "end < start" });
  let cur = new Date(s);
  while (cur <= e) {
    await addDate(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + stepDays);
  }
  res.json({ ok: true });
});

// Set availability for a specific person for a date
app.post("/api/availability", async (req, res) => {
  const { date, personId, state } = req.body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: "Invalid date" });
  if (!["A", "U", "?"].includes(state))
    return res.status(400).json({ error: "Invalid state" });
  try {
    await setAvailability(date, personId, state);
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.get("/api/availability", async (req, res) => {
  res.json(await getAvailability());
});

app.get("/api/availability/by-role", async (req, res) => {
  res.json(await getAvailabilityByRole());
});

// Export CSV
app.get("/api/export/csv", async (req, res) => {
  const events = await getEvents();
  const availByRole = await getAvailabilityByRole();
  const membersByRole = await getMembersByRole();

  const lines = [];
  // Header: Event, Date, Role, Person, Availability
  lines.push(["Event", "Date", "Role", "Person", "Availability"].join(","));

  events.forEach((event) => {
    Object.entries(membersByRole).forEach(([role, people]) => {
      const roleAvail = availByRole[event.date]?.[role] || [];
      people.forEach((person) => {
        const personAvail = roleAvail.find((a) => a.id === person.id);
        const state = personAvail ? personAvail.state : "";
        lines.push(
          [
            `"${event.title}"`,
            event.date,
            role,
            `"${person.name}"`,
            state,
          ].join(",")
        );
      });
    });
  });

  res.setHeader("Content-Type", "text/csv");
  res.send(lines.join("\n"));
});

app.get("/api/export/summary", async (req, res) => {
  const events = await getEvents();
  const availByRole = await getAvailabilityByRole();

  const text = events
    .map((event) => {
      let summary = `\n📅 ${event.title} - ${event.date}\n`;
      if (event.description) summary += `   ${event.description}\n`;

      Object.entries(availByRole[event.date] || {}).forEach(
        ([role, people]) => {
          const available = people.filter((p) => p.state === "A");
          const unavailable = people.filter((p) => p.state === "U");

          summary += `\n${role.toUpperCase()}:\n`;
          if (available.length) {
            summary += `  ✅ Available: ${available
              .map((p) => p.name)
              .join(", ")}\n`;
          }
          if (unavailable.length) {
            summary += `  ❌ Unavailable: ${unavailable
              .map((p) => p.name)
              .join(", ")}\n`;
          }
        }
      );

      return summary;
    })
    .join("\n" + "=".repeat(50) + "\n");

  res.type("text/plain").send(text);
});

// Reset all data
app.post("/api/reset", async (req, res) => {
  const { password } = req.body;
  if (!(await verifyAdmin(password))) {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    await resetData(defaultMembers);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to reset data" });
  }
});

app.listen(PORT, () =>
  console.log("Server listening on http://localhost:" + PORT)
);
