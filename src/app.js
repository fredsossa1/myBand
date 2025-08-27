import { el, clear } from "./dom.js";

let allMembers = [];
let membersByRole = {};
let availability = {};
let events = [];
let isAdmin = false;
let currentUser = null;
let lastAction = null; // For undo functionality
let pendingChanges = new Map(); // Track unsaved changes: date -> state
let hasUnsavedChanges = false;

// Fetch data functions
async function fetchMembers() {
  console.log("🔍 fetchMembers called");
  try {
    const res = await fetch("/api/members");
    console.log("📥 /api/members response status:", res.status);
    allMembers = await res.json();
    console.log("👥 allMembers:", allMembers);

    const roleRes = await fetch("/api/members/by-role");
    console.log("📥 /api/members/by-role response status:", roleRes.status);
    membersByRole = await roleRes.json();
    console.log("🎭 membersByRole:", membersByRole);

    console.log("🎯 Calling populateMemberSelect...");
    populateMemberSelect();
  } catch (error) {
    console.error("❌ Error in fetchMembers:", error);
  }
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
  console.log("🎯 populateMemberSelect called");
  const select = document.getElementById("memberSelect");
  console.log("🔍 memberSelect element:", select);

  if (!select) {
    console.error("❌ Could not find memberSelect element!");
    return;
  }

  console.log("🧹 Clearing existing options...");
  select.innerHTML = '<option value="">Select your name...</option>';

  console.log("📋 Processing membersByRole:", Object.keys(membersByRole));
  Object.entries(membersByRole).forEach(([role, people]) => {
    console.log(
      `👥 Processing role ${role} with ${people.length} people:`,
      people
    );
    const optgroup = document.createElement("optgroup");
    optgroup.label = role.toUpperCase();
    people.forEach((person) => {
      console.log(`  ➕ Adding person: ${person.name} (${person.id})`);
      const option = document.createElement("option");
      option.value = person.id;
      option.textContent = person.name;
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });

  console.log(
    "✅ populateMemberSelect completed. Select now has",
    select.children.length,
    "child elements"
  );
}

// API functions
async function setAvailabilityLocal(date, personId, state) {
  // Store change locally instead of immediately saving
  pendingChanges.set(date, {
    date,
    personId,
    state,
    previousState: availability[date]?.[personId]?.state || "?",
  });

  // Update local availability for immediate UI feedback
  if (!availability[date]) availability[date] = {};
  if (!availability[date][personId]) availability[date][personId] = {};

  availability[date][personId] = {
    state,
    name: currentUser.name,
    role: currentUser.role,
    isPending: true, // Mark as unsaved
  };

  hasUnsavedChanges = true;
  renderEvents();
  updateStats();
  showPendingChangesIndicator();
}

async function setAvailability(date, personId, state) {
  try {
    console.log("🎯 setAvailability called:", { date, personId, state });
    console.log("🔍 currentUser:", currentUser);

    // Add loading state to button
    const button = document.querySelector(
      `button[data-date="${date}"][data-person="${personId}"]`
    );
    if (button) {
      button.classList.add("loading");
      button.disabled = true;
      const originalText = button.textContent;
      button.textContent = "Saving...";
    }

    // Store for undo
    const previousState = availability[date]?.[personId]?.state || "?";
    lastAction = {
      type: "availability",
      date,
      personId,
      previousState,
      newState: state,
    };

    console.log("📤 Sending POST request to /api/availability");
    const response = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, personId, state }),
    });

    console.log("📥 Response status:", response.status);
    if (response.ok) {
      console.log("✅ Availability set successfully");
      await refresh();
      showUndoNotification();

      // Show success feedback
      if (button) {
        button.textContent = "✓ Saved!";
        setTimeout(() => {
          button.classList.remove("loading");
          button.disabled = false;
        }, 800);
      }
    } else {
      console.error("❌ Failed to set availability - response not ok");
      if (button) {
        button.textContent = "❌ Error";
        button.classList.remove("loading");
        button.disabled = false;
      }
    }
  } catch (error) {
    console.error("❌ Failed to set availability:", error);
  }
}
async function submitAllChanges() {
  if (!hasUnsavedChanges || pendingChanges.size === 0) {
    return;
  }

  const submitBtn = document.getElementById("submitChangesBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    submitBtn.classList.add("loading");
  }

  try {
    const promises = Array.from(pendingChanges.values()).map((change) =>
      fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: change.date,
          personId: change.personId,
          state: change.state,
        }),
      })
    );

    const results = await Promise.all(promises);
    const allSuccessful = results.every((response) => response.ok);

    if (allSuccessful) {
      // Clear pending changes
      pendingChanges.clear();
      hasUnsavedChanges = false;

      // Remove pending indicators from availability data
      Object.values(availability).forEach((dateAvail) => {
        Object.values(dateAvail).forEach((personAvail) => {
          if (personAvail.isPending) {
            delete personAvail.isPending;
          }
        });
      });

      await refresh();
      hidePendingChangesIndicator();
      showSuccessNotification(
        `✅ Successfully submitted ${results.length} availability updates!`
      );
    } else {
      throw new Error("Some submissions failed");
    }
  } catch (error) {
    console.error("Failed to submit changes:", error);
    showErrorNotification(
      "❌ Failed to submit some changes. Please try again."
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit All Changes";
      submitBtn.classList.remove("loading");
    }
  }
}

function showPendingChangesIndicator() {
  const existing = document.getElementById("pendingChangesBar");
  if (existing) {
    // Update count
    const count = pendingChanges.size;
    existing.querySelector(".pending-count").textContent = count;
    return;
  }

  const indicator = el("div", {
    id: "pendingChangesBar",
    class: "fade-in",
    style: `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #f6ad55, #ed8936);
      color: white;
      padding: 16px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      z-index: 999;
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    `,
  });

  const count = pendingChanges.size;
  indicator.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.2em;">⏳</span>
        <span style="font-weight: 500;">
          <span class="pending-count">${count}</span> unsaved change${
    count !== 1 ? "s" : ""
  }
        </span>
      </div>
      <div style="display: flex; gap: 12px;">
        <button id="discardChangesBtn" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Discard</button>
        <button id="submitChangesBtn" style="
          background: rgba(255, 255, 255, 0.9);
          border: none;
          color: #ed8936;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        ">Submit All Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(indicator);

  // Bind events
  document
    .getElementById("submitChangesBtn")
    .addEventListener("click", submitAllChanges);
  document
    .getElementById("discardChangesBtn")
    .addEventListener("click", discardAllChanges);
}

function hidePendingChangesIndicator() {
  const indicator = document.getElementById("pendingChangesBar");
  if (indicator) {
    indicator.classList.add("slide-out");
    setTimeout(() => indicator.remove(), 300);
  }
}

function discardAllChanges() {
  if (confirm("Are you sure you want to discard all unsaved changes?")) {
    pendingChanges.clear();
    hasUnsavedChanges = false;
    hidePendingChangesIndicator();
    refresh(); // Reload original data
    showSuccessNotification("📝 Changes discarded");
  }
}

function showSuccessNotification(message) {
  const existing = document.getElementById("successNotification");
  if (existing) existing.remove();

  const notification = el("div", {
    id: "successNotification",
    class: "fade-in",
    style: `
      position: fixed;
      top: 100px;
      right: 24px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(72, 187, 120, 0.3);
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 350px;
      transform: translateX(100%);
      animation: slideInRight 0.4s ease forwards;
    `,
  });

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div>
        <div style="font-weight: 600;">${message}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("slide-out");
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function showErrorNotification(message) {
  const existing = document.getElementById("errorNotification");
  if (existing) existing.remove();

  const notification = el("div", {
    id: "errorNotification",
    class: "fade-in",
    style: `
      position: fixed;
      top: 100px;
      right: 24px;
      background: linear-gradient(135deg, #f56565, #e53e3e);
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(245, 101, 101, 0.3);
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 350px;
      transform: translateX(100%);
      animation: slideInRight 0.4s ease forwards;
    `,
  });

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div>
        <div style="font-weight: 600;">${message}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("slide-out");
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

async function undoLastAction() {
  if (!lastAction || lastAction.type !== "availability") return false;

  try {
    const response = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: lastAction.date,
        personId: lastAction.personId,
        state: lastAction.previousState,
      }),
    });
    if (response.ok) {
      lastAction = null;
      await refresh();
      hideUndoNotification();
      return true;
    }
  } catch (error) {
    console.error("Failed to undo:", error);
  }
  return false;
}

function showUndoNotification() {
  const existing = document.getElementById("undoNotification");
  if (existing) existing.remove();

  const notification = el("div", {
    id: "undoNotification",
    class: "fade-in",
    style: `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #48bb78, #38a169);
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(72, 187, 120, 0.3);
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transform: translateX(100%);
      animation: slideInRight 0.4s ease forwards;
    `,
  });

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2em;">✅</span>
        <span style="font-weight: 500;">Availability updated!</span>
      </div>
      <button id="undoButton" style="
        background: rgba(255,255,255,0.2); 
        border: 1px solid rgba(255,255,255,0.3); 
        color: white; 
        padding: 8px 12px; 
        border-radius: 8px; 
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
        ↶ Undo
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(hideUndoNotification, 5000);

  // Bind undo button
  document
    .getElementById("undoButton")
    .addEventListener("click", undoLastAction);
}

function hideUndoNotification() {
  const notification = document.getElementById("undoNotification");
  if (notification) {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }
}

function showBulkActionModal(state) {
  const existing = document.getElementById("bulkActionModal");
  if (existing) existing.remove();

  const modal = el("div", {
    id: "bulkActionModal",
    style: `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `,
  });

  const content = el("div", {
    style: `
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `,
  });

  const stateText =
    state === "A" ? "Available" : state === "U" ? "Unavailable" : "Uncertain";
  content.appendChild(el("h3", {}, `🎯 Set ${stateText} for Multiple Events`));
  content.appendChild(el("p", {}, "Select which events to update:"));

  const eventsList = el("div", { style: "margin: 1rem 0;" });
  const selectAllBtn = el(
    "button",
    {
      style:
        "margin-bottom: 1rem; background: #4299e1; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer;",
    },
    "Select All"
  );

  eventsList.appendChild(selectAllBtn);

  const checkboxes = [];
  events.forEach((event) => {
    const checkbox = el("input", {
      type: "checkbox",
      id: `bulk_${event.date}`,
    });
    const label = el("label", {
      for: `bulk_${event.date}`,
      style:
        "display: flex; align-items: center; margin-bottom: 0.5rem; cursor: pointer;",
    });

    label.appendChild(checkbox);
    label.appendChild(
      el(
        "span",
        { style: "margin-left: 0.5rem;" },
        `${event.title} - ${formatDate(event.date)}`
      )
    );
    eventsList.appendChild(label);
    checkboxes.push({ checkbox, date: event.date });
  });

  selectAllBtn.addEventListener("click", () => {
    const allChecked = checkboxes.every((c) => c.checkbox.checked);
    checkboxes.forEach((c) => (c.checkbox.checked = !allChecked));
  });

  content.appendChild(eventsList);

  const buttonContainer = el("div", {
    style:
      "display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;",
  });

  const cancelBtn = el(
    "button",
    {
      style:
        "padding: 0.75rem 1.5rem; border: 1px solid #ccc; background: white; border-radius: 6px; cursor: pointer;",
    },
    "Cancel"
  );

  const applyBtn = el(
    "button",
    {
      style: `padding: 0.75rem 1.5rem; border: none; background: ${
        state === "A" ? "#48bb78" : state === "U" ? "#f56565" : "#718096"
      }; color: white; border-radius: 6px; cursor: pointer;`,
    },
    `Set ${stateText}`
  );

  cancelBtn.addEventListener("click", () => modal.remove());
  applyBtn.addEventListener("click", () => {
    const selectedDates = checkboxes
      .filter((c) => c.checkbox.checked)
      .map((c) => c.date);
    if (selectedDates.length > 0) {
      setBulkAvailability(selectedDates, currentUser.id, state);
      modal.remove();
    }
  });

  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(applyBtn);
  content.appendChild(buttonContainer);

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on click outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

async function setBulkAvailability(dates, personId, state) {
  try {
    const promises = dates.map((date) =>
      fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, personId, state }),
      })
    );

    await Promise.all(promises);
    await refresh();
    alert(
      `✅ Set ${
        state === "A"
          ? "Available"
          : state === "U"
          ? "Unavailable"
          : "Uncertain"
      } for ${dates.length} events!`
    );
  } catch (error) {
    console.error("Failed to set bulk availability:", error);
    alert("❌ Failed to set bulk availability. Please try again.");
  }
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
      return "✅ Available";
    case "U":
      return "❌ Unavailable";
    default:
      return "❓ Uncertain";
  }
}

function getStateEmoji(state) {
  switch (state) {
    case "A":
      return "✅";
    case "U":
      return "❌";
    default:
      return "❓";
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
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
  const userDiv = document.getElementById("currentUser");
  if (!userDiv) {
    console.error("Could not find currentUser div");
    return;
  }

  const memberSelect = document.getElementById("memberSelect");
  if (!memberSelect) {
    console.error("Could not find memberSelect");
    return;
  }

  if (currentUser) {
    userDiv.textContent = `Welcome, ${currentUser.name}!`;
    userDiv.style.display = "block";
    memberSelect.style.display = "none";

    const clearBtn = document.getElementById("clearUserBtn");
    if (clearBtn) {
      clearBtn.style.display = "inline-block";
    }
  } else {
    userDiv.style.display = "none";
    memberSelect.style.display = "block";
    const clearBtn = document.getElementById("clearUserBtn");
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
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

  events.forEach((event, index) => {
    const eventCard = el("div", {
      class: "event-card fade-in",
      style: `animation-delay: ${index * 0.1}s`,
    });

    // Check if user has responded
    const userHasResponded =
      currentUser &&
      availability[event.date]?.[currentUser.id]?.state !== "?" &&
      availability[event.date]?.[currentUser.id]?.state;
    const needsResponse = currentUser && !userHasResponded;

    // Event Header
    const header = el("div", {
      class: "event-header",
      style: needsResponse
        ? "border-left: 4px solid #f56565; background: #fef5e7;"
        : "",
    });
    header.appendChild(
      el(
        "div",
        { class: "event-title" },
        `${event.title}${needsResponse ? " ⚠️" : ""}`
      )
    );
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
      const isPending =
        availability[event.date]?.[currentUser.id]?.isPending || false;
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
          } ${isPending ? "pending" : ""}`,
          dataset: {
            state: currentState,
            date: event.date,
            person: currentUser.id,
          },
        },
        isPending
          ? `${getStateText(currentState)} (Unsaved)`
          : getStateText(currentState)
      );

      button.addEventListener("click", () => {
        const nextState = cycle(currentState);
        setAvailabilityLocal(event.date, currentUser.id, nextState);
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

            const badgeContainer = el("div", { style: "text-align: right;" });
            badgeContainer.appendChild(
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

            if (resp.created_at) {
              badgeContainer.appendChild(
                el(
                  "div",
                  {
                    class: "response-time",
                  },
                  formatTimestamp(resp.created_at)
                )
              );
            }

            item.appendChild(badgeContainer);

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
function handleMemberSelect(event) {
  const selectedId = event.target.value;
  if (selectedId) {
    currentUser = allMembers.find((m) => m.id === selectedId);

    // Show welcome notification
    showWelcomeNotification(currentUser.name);

    updateUserInfo();
    renderEvents();
    updateStats();
  } else {
    currentUser = null;
    updateUserInfo();
    renderEvents();
    updateStats();
  }
}

function showWelcomeNotification(userName) {
  const existing = document.getElementById("welcomeNotification");
  if (existing) existing.remove();

  const notification = el("div", {
    id: "welcomeNotification",
    class: "fade-in",
    style: `
      position: fixed;
      top: 100px;
      right: 24px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 300px;
      transform: translateX(100%);
      animation: slideInRight 0.4s ease forwards;
    `,
  });

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 1.5em;">👋</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Welcome, ${userName}!</div>
        <div style="font-size: 0.9em; opacity: 0.9;">Click the buttons below to set your availability</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-hide after 4 seconds
  setTimeout(() => {
    notification.classList.add("slide-out");
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function clearUser() {
  currentUser = null;
  const memberSelect = document.getElementById("memberSelect");
  if (memberSelect) {
    memberSelect.value = "";
  }
  updateUserInfo();
  renderEvents();
  updateStats();
}

function bindEvents() {
  const memberSelect = document.getElementById("memberSelect");
  const clearBtn = document.getElementById("clearUserBtn");
  const adminBtn = document.getElementById("adminBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const undoBtn = document.getElementById("undoBtn");

  if (memberSelect) {
    memberSelect.addEventListener("change", handleMemberSelect);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearUser);
  }

  if (adminBtn) {
    adminBtn.addEventListener("click", showAdminPanel);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", refresh);
  }

  if (undoBtn) {
    undoBtn.addEventListener("click", undo);
  }

  // Global keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "z":
          e.preventDefault();
          undo();
          break;
        case "r":
          e.preventDefault();
          refresh();
          break;
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
  // Register service worker for PWA functionality
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.log("Service Worker registered successfully");
    } catch (error) {
      console.log("Service Worker registration failed:", error);
    }
  }

  try {
    await fetchMembers();
    await refresh();
    updateUserInfo();
    bindEvents();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

init();
