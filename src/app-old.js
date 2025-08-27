import { el, clear } from "./dom.js";

let allMembers = []; // All people with their roles
let membersByRole = {}; // role -> array of people
let availability = {}; // date -> { personId: {state, name, role} }
let events = []; // events with titles/descriptions
let isAdmin = false;
let currentUser = null; // Selected user
let viewMode = "events"; // 'events', 'user', 'admin'

async function fetchMembers() {
  const res = await fetch("/api/members");
  allMembers = await res.json();

  const roleRes = await fetch("/api/members/by-role");
  membersByRole = await roleRes.json();

  populateMemberSelect();
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

async function fetchEvents() {
  const res = await fetch("/api/events");
  events = await res.json();
}

async function fetchDates() {
  const res = await fetch("/api/dates");
  // Legacy support - keep for compatibility
}

async function fetchAvailability() {
  const res = await fetch("/api/availability");
  availability = await res.json();
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

async function addBulkEvents(start, end, title, description) {
  if (!start || !end) return;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (e < s) return;
  let cur = new Date(s);
  while (cur <= e) {
    await addEvent({
      date: cur.toISOString().slice(0, 10),
      title: title || "Sunday Service",
      description: description || "",
    });
    cur.setDate(cur.getDate() + 7);
  }
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

async function setAvailability(date, personId, state) {
  // Check if user is selected
  if (!currentUser) {
    alert("Please select your name first to set your availability!");
    showMemberSelection();
    return;
  }

  // Make sure they're setting availability for themselves
  if (personId !== currentUser.id) {
    alert("You can only set your own availability!");
    return;
  }

  await fetch("/api/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, personId, state }),
  });

  // Update local state
  availability[date] = availability[date] || {};
  const person = allMembers.find((m) => m.id === personId);
  if (person) {
    availability[date][personId] = {
      state,
      name: person.name,
      role: person.role,
    };
  }

  render();
}

function cycle(val) {
  return val === "?" ? "A" : val === "A" ? "U" : "?";
}

function getStateText(state) {
  switch (state) {
    case "A":
      return "✅ Available";
    case "U":
      return "❌ Unavailable";
    default:
      return "❓ Unknown";
  }
}

function render() {
  if (viewMode === "events") {
    renderEventsView();
  } else if (viewMode === "user") {
    renderUserView();
  } else if (viewMode === "admin") {
    renderAdminView();
  }
}

function showMemberSelection() {
  const memberSelection = document.getElementById("memberSelection");
  memberSelection.style.display = "block";
  memberSelection.scrollIntoView({ behavior: "smooth" });
}

function renderEventsView() {
  document.getElementById("memberSelection").style.display = "block";
  document.querySelector(".availability-view").style.display = "block";

  const container = document.getElementById("availabilityTable").parentElement;
  clear(container);

  // Welcome message
  const welcomeInfo = el("div", { class: "user-info" });
  welcomeInfo.appendChild(el("h3", {}, `🎵 Welcome to Band Availability!`));
  if (currentUser) {
    welcomeInfo.appendChild(
      el("p", {}, `👋 Hi ${currentUser.name}! Click on any event below to set your availability.`)
    );
  } else {
    welcomeInfo.appendChild(
      el("p", {}, `👋 Select your name above, then click on any event to set your availability.`)
    );
  }
  container.appendChild(welcomeInfo);

  // Show all events
  events.forEach((event) => {
    const eventCard = el("div", { class: "role-section" });
    
    // Event header
    const headerDiv = el(
      "div",
      { class: "role-header-large" },
      `📅 ${event.title} - ${event.date}`
    );
    if (event.description) {
      headerDiv.appendChild(
        el(
          "div",
          { style: "font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;" },
          event.description
        )
      );
    }
    eventCard.appendChild(headerDiv);

    // Show availability by role
    Object.entries(membersByRole).forEach(([role, people]) => {
      const roleDiv = el("div", { style: "margin-bottom: 1.5rem;" });
      roleDiv.appendChild(
        el(
          "h4",
          { style: "margin-bottom: 0.75rem; color: #4a5568;" },
          `${role.toUpperCase()} (${people.length})`
        )
      );

      const peopleGrid = el("div", { class: "people-grid" });
      people.forEach((person) => {
        const userAvail = availability[event.date]?.[person.id];
        const state = userAvail?.state || "?";
        const responded = state !== "?";

        const personCard = el("div", {
          class: `person-card ${responded ? "responded" : ""}`,
        });
        personCard.appendChild(
          el("div", { class: "person-name" }, person.name)
        );

        // Show availability status or button for current user
        if (currentUser && person.id === currentUser.id) {
          const buttonContainer = el("div", {
            style: "margin-top: 0.5rem;",
          });
          const btn = el(
            "button",
            {
              class: "state",
              dataset: { val: state },
              style: "font-size: 0.9rem; padding: 0.5rem 1rem;",
            },
            getStateText(state)
          );

          btn.addEventListener("click", () => {
            const next = cycle(btn.dataset.val || "?");
            btn.dataset.val = next;
            btn.textContent = getStateText(next);
            setAvailability(event.date, currentUser.id, next);
          });

          buttonContainer.appendChild(btn);
          personCard.appendChild(buttonContainer);
        } else {
          personCard.appendChild(
            el(
              "div",
              { 
                class: "person-status",
                style: `color: ${responded ? '#10b981' : '#6b7280'}; font-weight: ${responded ? 'bold' : 'normal'};`
              },
              responded ? getStateText(state) : "No response"
            )
          );
        }

        peopleGrid.appendChild(personCard);
      });

      roleDiv.appendChild(peopleGrid);
      eventCard.appendChild(roleDiv);
    });

    container.appendChild(eventCard);
  });
}

function renderUserView() {
  document.getElementById("memberSelection").style.display = "none";
  document.querySelector(".availability-view").style.display = "block";

  const container = document.getElementById("availabilityTable").parentElement;
  clear(container);

  // User info
  const userInfo = el("div", { class: "user-info" });
  userInfo.appendChild(el("h3", {}, `👋 Hi ${currentUser.name}!`));
  userInfo.appendChild(
    el("p", {}, `Please update your availability as ${currentUser.role}`)
  );
  container.appendChild(userInfo);

  // Events for this user
  events.forEach((event) => {
    const eventCard = el("div", { class: "role-section" });
    eventCard.appendChild(
      el(
        "div",
        { class: "role-header-large" },
        `📅 ${event.title} - ${event.date}`,
        event.description
          ? el(
              "div",
              { style: "font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;" },
              event.description
            )
          : null
      )
    );

    const currentState =
      availability[event.date]?.[currentUser.id]?.state || "?";
    const buttonContainer = el("div", {
      style: "text-align: center; padding: 1rem;",
    });
    const btn = el(
      "button",
      {
        class: "state",
        dataset: { val: currentState },
        style: "font-size: 1.1rem; padding: 1rem 2rem;",
      },
      getStateText(currentState)
    );

    btn.addEventListener("click", () => {
      const next = cycle(btn.dataset.val || "?");
      btn.dataset.val = next;
      btn.textContent = getStateText(next);
      setAvailability(event.date, currentUser.id, next);
    });

    buttonContainer.appendChild(btn);
    eventCard.appendChild(buttonContainer);
    container.appendChild(eventCard);
  });
}

function renderAdminView() {
  document.getElementById("memberSelection").style.display = "none";
  document.querySelector(".availability-view").style.display = "block";

  const container = document.getElementById("availabilityTable").parentElement;
  clear(container);

  events.forEach((event) => {
    const eventSection = el("div", { class: "role-section" });
    eventSection.appendChild(
      el(
        "div",
        { class: "role-header-large" },
        `📅 ${event.title} - ${event.date}`,
        event.description
          ? el(
              "div",
              { style: "font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;" },
              event.description
            )
          : null
      )
    );

    Object.entries(membersByRole).forEach(([role, people]) => {
      const roleDiv = el("div", { style: "margin-bottom: 1.5rem;" });
      roleDiv.appendChild(
        el(
          "h4",
          { style: "margin-bottom: 0.75rem; color: #4a5568;" },
          `${role.toUpperCase()} (${people.length})`
        )
      );

      const peopleGrid = el("div", { class: "people-grid" });
      people.forEach((person) => {
        const userAvail = availability[event.date]?.[person.id];
        const state = userAvail?.state || "?";
        const responded = state !== "?";

        const personCard = el("div", {
          class: `person-card ${responded ? "responded" : ""}`,
        });
        personCard.appendChild(
          el("div", { class: "person-name" }, person.name)
        );
        personCard.appendChild(
          el(
            "div",
            { class: "person-status" },
            responded ? getStateText(state) : "No response"
          )
        );

        peopleGrid.appendChild(personCard);
      });

      roleDiv.appendChild(peopleGrid);
      eventSection.appendChild(roleDiv);
    });

    container.appendChild(eventSection);
  });
}

function updateStatus() {
  const status = document.getElementById("status");

  if (!events.length) {
    if (isAdmin) {
      status.textContent = "� Admin: Add some events to get started!";
    } else {
      status.textContent = "📅 No events scheduled yet. Contact admin to add events.";
    }
    return;
  }

  if (viewMode === "admin") {
    let totalResponses = 0;
    let possibleResponses = 0;

    events.forEach((event) => {
      const dayAvail = availability[event.date] || {};
      Object.values(dayAvail).forEach((resp) => {
        if (resp.state && resp.state !== "?") totalResponses++;
      });
      possibleResponses += allMembers.length;
    });

    const responseRate = Math.round(
      (totalResponses / possibleResponses) * 100
    );
    status.textContent = `📊 Overall Progress: ${totalResponses}/${possibleResponses} responses across all events (${responseRate}% response rate)`;
  } else if (currentUser) {
    let userResponded = 0;
    events.forEach((event) => {
      const dayAvail = availability[event.date] || {};
      if (
        dayAvail[currentUser.id]?.state &&
        dayAvail[currentUser.id].state !== "?"
      ) {
        userResponded++;
      }
    });

    status.textContent = `� Your Progress: ${userResponded}/${events.length} events answered (${Math.round(
      (userResponded / events.length) * 100
    )}% complete)`;
  } else {
    status.textContent = `� ${events.length} upcoming events. Select your name above to set your availability!`;
  }
}

async function exportCSV() {
  const res = await fetch("/api/export/csv");
  const text = await res.text();
  document.getElementById("output").value = text;
}
async function exportSummary() {
  const res = await fetch("/api/export/summary");
  const text = await res.text();
  document.getElementById("output").value = text;
  navigator.clipboard.writeText(text).catch(() => {});
}

function bind() {
  // Member selection
  document.getElementById("selectMember").addEventListener("click", () => {
    const selectedId = document.getElementById("memberSelect").value;
    if (selectedId) {
      currentUser = allMembers.find((m) => m.id === selectedId);
      // Stay in events view but update to show user's buttons
      render();
      updateStatus();
      
      // Scroll to events
      document.querySelector(".availability-view").scrollIntoView({ behavior: "smooth" });
    }
  });

  // Admin login
  document.getElementById("adminLogin").addEventListener("click", async () => {
    const password = document.getElementById("adminPassword").value;
    if (await verifyAdmin(password)) {
      isAdmin = true;
      viewMode = "admin";
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("resetData").style.display = "inline-block";
      document.getElementById("adminLogin").textContent = "✅ Admin Logged In";
      document.getElementById("adminLogin").disabled = true;
      render();
      updateStatus();
    } else {
      alert("Invalid admin password");
    }
  });

  // Add single event
  document.getElementById("addEvent").addEventListener("click", () => {
    const title = document.getElementById("eventTitle").value || "Service";
    const description = document.getElementById("eventDescription").value || "";
    const date = document.getElementById("eventDate").value;
    if (date) {
      addEvent({ date, title, description });
    }
  });

  // Add bulk events
  document.getElementById("addBulkEvents").addEventListener("click", () => {
    const title =
      document.getElementById("eventTitle").value || "Sunday Service";
    const description = document.getElementById("eventDescription").value || "";
    addBulkEvents(
      document.getElementById("bulkStart").value,
      document.getElementById("bulkEnd").value,
      title,
      description
    );
  });

  document.getElementById("exportCSV").addEventListener("click", exportCSV);
  document
    .getElementById("copySummary")
    .addEventListener("click", exportSummary);

  // Reset functionality
  document.getElementById("resetData").addEventListener("click", async () => {
    if (
      confirm(
        "Are you sure you want to reset all availability data? This cannot be undone."
      )
    ) {
      try {
        const password = document.getElementById("adminPassword").value;
        const response = await fetch("/api/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (response.ok) {
          await refresh();
          document.getElementById("status").textContent =
            "✅ Data has been reset!";
        } else {
          alert("Failed to reset data. Check admin password.");
        }
      } catch (e) {
        alert("Failed to reset data. Please try again.");
      }
    }
  });
}

async function refresh() {
  await Promise.all([fetchEvents(), fetchAvailability()]);
  render();
}

async function init() {
  await fetchMembers();
  await refresh();
  updateStatus();
  bind();
}

init();
