import { el, clear } from "./dom.js";

let allMembers = [];
let membersByRole = {};
let availability = {};
let events = [];
let isAdmin = false;
let currentUser = null;

// Fetch data functions
async function fetchMembers() {
  const res = await fetch("/api/members");
  allMembers = await res.json();

  const roleRes = await fetch("/api/members/by-role");
  membersByRole = await roleRes.json();

  populateMemberSelect();
}

async function fetchEvents() {
  const res = await fetch("/api/events");
  events = await res.json();
}

async function fetchAvailability() {
  const res = await fetch("/api/availability");
  availability = await res.json();
}

function populateMemberSelect() {
  const select = document.getElementById("memberSelect");
  select.innerHTML = '<option value="">Select your name...</option>';

  Object.entries(membersByRole).forEach(([role, people]) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = role.toUpperCase();
    people.forEach((person) => {
      const option = document.createElement("option");
      option.value = person.id;
      option.textContent = person.name;
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });
}

// API functions
async function setAvailability(date, personId, state) {
  if (!currentUser || personId !== currentUser.id) {
    alert("Please select your name first!");
    return;
  }

  await fetch("/api/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, personId, state }),
  });

  // Update local state
  availability[date] = availability[date] || {};
  availability[date][personId] = {
    state,
    name: currentUser.name,
    role: currentUser.role,
  };

  renderEvents();
  updateStats();
}

async function addEvent(event) {
  if (!isAdmin) return alert("Admin access required");

  await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: document.getElementById("adminPassword").value,
      event,
    }),
  });

  await refresh();
}

async function verifyAdmin(password) {
  const res = await fetch("/api/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  return data.isAdmin;
}

// Helper functions
function getStateText(state) {
  switch (state) {
    case "A":
      return "Available";
    case "U":
      return "Unavailable";
    default:
      return "Uncertain";
  }
}

function cycle(val) {
  return val === "?" ? "A" : val === "A" ? "U" : "?";
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Render functions
function updateUserInfo() {
  const userInfo = document.getElementById("userInfo");

  if (currentUser) {
    userInfo.className = "user-info";
    userInfo.innerHTML = `<p>👋 Welcome <strong>${currentUser.name}</strong> (${currentUser.role})! Click the buttons below to set your availability.</p>`;
  } else {
    userInfo.className = "user-info logged-out";
    userInfo.innerHTML = `<p>📅 Select your name above to see events and set your availability</p>`;
  }
}

function updateStats() {
  const stats = document.getElementById("stats");

  if (!events.length) {
    stats.innerHTML = `<p>📅 No events scheduled yet${
      isAdmin ? ". Add some events below!" : ". Contact admin to add events."
    }</p>`;
    return;
  }

  let totalResponses = 0;
  let possibleResponses = events.length * allMembers.length;
  let userResponses = 0;

  events.forEach((event) => {
    const dayAvail = availability[event.date] || {};

    // Count total responses
    Object.values(dayAvail).forEach((resp) => {
      if (resp.state && resp.state !== "?") totalResponses++;
    });

    // Count user responses
    if (
      currentUser &&
      dayAvail[currentUser.id]?.state &&
      dayAvail[currentUser.id].state !== "?"
    ) {
      userResponses++;
    }
  });

  const overallRate = Math.round((totalResponses / possibleResponses) * 100);

  let statsText = `📊 ${events.length} upcoming events • ${totalResponses}/${possibleResponses} total responses (${overallRate}%)`;

  if (currentUser) {
    const userRate = Math.round((userResponses / events.length) * 100);
    statsText += ` • Your progress: ${userResponses}/${events.length} (${userRate}%)`;
  }

  stats.innerHTML = `<p>${statsText}</p>`;
}

function renderEvents() {
  const container = document.getElementById("eventsContainer");
  clear(container);

  if (!events.length) {
    container.innerHTML =
      '<div class="no-responses">No events scheduled yet.</div>';
    return;
  }

  events.forEach((event) => {
    const eventCard = el("div", { class: "event-card" });

    // Event Header
    const header = el("div", { class: "event-header" });
    header.appendChild(el("div", { class: "event-title" }, event.title));
    header.appendChild(
      el("div", { class: "event-date" }, formatDate(event.date))
    );
    if (event.description) {
      header.appendChild(
        el("div", { class: "event-description" }, event.description)
      );
    }
    eventCard.appendChild(header);

    // Event Content
    const content = el("div", { class: "event-content" });

    // Current user's availability section (if logged in)
    if (currentUser) {
      const userSection = el("div", { class: "user-availability-section" });
      userSection.appendChild(
        el("div", { class: "section-title" }, "🎯 Your Availability")
      );

      const currentState =
        availability[event.date]?.[currentUser.id]?.state || "?";
      const buttonContainer = el("div", { style: "text-align: center;" });

      const button = el(
        "button",
        {
          class: `availability-button ${
            currentState === "A"
              ? "available"
              : currentState === "U"
              ? "unavailable"
              : "uncertain"
          }`,
          dataset: { state: currentState },
        },
        getStateText(currentState)
      );

      button.addEventListener("click", () => {
        const nextState = cycle(currentState);
        setAvailability(event.date, currentUser.id, nextState);
      });

      buttonContainer.appendChild(button);
      userSection.appendChild(buttonContainer);
      content.appendChild(userSection);
    }

    // Responses by role - only show people who have responded
    const hasResponses = Object.keys(availability[event.date] || {}).length > 0;

    if (hasResponses) {
      Object.entries(membersByRole).forEach(([role, people]) => {
        const roleResponses = people.filter((person) => {
          const resp = availability[event.date]?.[person.id];
          return resp && resp.state !== "?";
        });

        if (roleResponses.length > 0) {
          const section = el("div", { class: "availability-section" });
          section.appendChild(
            el(
              "div",
              { class: "section-title" },
              `🎵 ${role.toUpperCase()} (${roleResponses.length}/${
                people.length
              } responded)`
            )
          );

          const list = el("div", { class: "availability-list" });
          roleResponses.forEach((person) => {
            const resp = availability[event.date][person.id];
            const item = el("div", {
              class: `availability-item ${
                currentUser && person.id === currentUser.id
                  ? "current-user"
                  : ""
              }`,
            });

            item.appendChild(el("span", { class: "person-name" }, person.name));
            item.appendChild(
              el(
                "span",
                {
                  class: `availability-badge ${
                    resp.state === "A"
                      ? "available"
                      : resp.state === "U"
                      ? "unavailable"
                      : "uncertain"
                  }`,
                },
                getStateText(resp.state)
              )
            );

            list.appendChild(item);
          });

          section.appendChild(list);
          content.appendChild(section);
        }
      });
    } else {
      content.appendChild(
        el(
          "div",
          { class: "no-responses" },
          "No responses yet. Be the first to respond!"
        )
      );
    }

    eventCard.appendChild(content);
    container.appendChild(eventCard);
  });
}

// Event handlers
function bindEvents() {
  // Member selection
  document.getElementById("selectMember").addEventListener("click", () => {
    const selectedId = document.getElementById("memberSelect").value;
    if (selectedId) {
      currentUser = allMembers.find((m) => m.id === selectedId);
      updateUserInfo();
      renderEvents();
      updateStats();
    }
  });

  // Admin login
  document.getElementById("adminLogin").addEventListener("click", async () => {
    const password = document.getElementById("adminPassword").value;
    if (await verifyAdmin(password)) {
      isAdmin = true;
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("adminLogin").textContent = "✅ Logged In";
      document.getElementById("adminLogin").disabled = true;
      updateStats();
    } else {
      alert("Invalid admin password");
    }
  });

  // Add event
  document.getElementById("addEvent").addEventListener("click", () => {
    const title = document.getElementById("eventTitle").value || "Service";
    const description = document.getElementById("eventDescription").value || "";
    const date = document.getElementById("eventDate").value;
    if (date) {
      addEvent({ date, title, description });
      // Clear form
      document.getElementById("eventTitle").value = "";
      document.getElementById("eventDescription").value = "";
      document.getElementById("eventDate").value = "";
    }
  });

  // Export functions
  document.getElementById("exportCSV").addEventListener("click", async () => {
    const res = await fetch("/api/export/csv");
    const text = await res.text();
    document.getElementById("exportOutput").value = text;
  });

  document
    .getElementById("exportSummary")
    .addEventListener("click", async () => {
      const res = await fetch("/api/export/summary");
      const text = await res.text();
      document.getElementById("exportOutput").value = text;
      navigator.clipboard.writeText(text).catch(() => {});
    });

  // Reset data
  document.getElementById("resetData").addEventListener("click", async () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      const password = document.getElementById("adminPassword").value;
      const response = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        await refresh();
        alert("Data has been reset!");
      } else {
        alert("Failed to reset data. Check admin password.");
      }
    }
  });
}

// Main functions
async function refresh() {
  await Promise.all([fetchEvents(), fetchAvailability()]);
  renderEvents();
  updateStats();
}

async function init() {
  await fetchMembers();
  await refresh();
  updateUserInfo();
  bindEvents();
}

init();
