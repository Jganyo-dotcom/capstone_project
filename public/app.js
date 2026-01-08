// ---------------- STATE ----------------
let token = localStorage.getItem("token") || null;
let vapidPublicKey = localStorage.getItem("vapidPublicKey") || null;
let subscription = null;

try {
  subscription = JSON.parse(localStorage.getItem("subscription")) || null;
} catch {
  subscription = null;
}

// ---------------- UTILITIES ----------------
function showLoader(el, msg = "Processing") {
  if (el) el.innerHTML = `${msg} <span class="loader"></span>`;
}

function showMessage(el, msg, type = "success") {
  if (el) {
    el.className = type;
    el.textContent = msg;
  }
}

// ---------------- AUTH ----------------
async function registerUser(e) {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const status = document.getElementById("registerStatus");

  if (!name || !username || !phone || !password || !email) {
    return showMessage(status, "provide info for all fields", "error");
  }

  showLoader(status);
  try {
    const res = await fetch("/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, phone, password, email }),
    });
    const data = await res.json();

    res.ok
      ? showMessage(status, data.message, "success")
      : showMessage(status, data.error || data.message, "error");
    document.getElementById("regName").value = "";
    document.getElementById("regUsername").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPhone").value = "";
    document.getElementById("regPassword").value = "";
  } catch {
    showMessage(status, "Network error", "error");
  }
}

async function loginUser() {
  const main = document.getElementById("loginMain").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const status = document.getElementById("loginStatus");

  if (!main || !password) {
    return showMessage(status, "Email/Username and password required", "error");
  }

  showLoader(status, "Logging in");
  try {
    const res = await fetch("/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ main, password }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);

      if (data.vapidPublicKey) {
        vapidPublicKey = data.vapidPublicKey;
        localStorage.setItem("vapidPublicKey", vapidPublicKey);
      }

      showMessage(status, data.message, "success");
      document.getElementById("goalSection").classList.remove("hidden");
      document.getElementById("attachSection")?.classList.remove("hidden");
      // Call showGoalsUI when login succeeds (add this line to your loginUser success block)
      document.getElementById("goalSection").classList.remove("hidden");
      document.getElementById("attachSection")?.classList.remove("hidden");
      document.getElementById("loginMain").value = "";
      document.getElementById("loginPassword").value = "";
      showGoalsUI();
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- UI TOGGLES ----------------
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", (e) => {
  e.preventDefault();
  registerSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// ---------------- DYNAMIC STEPS ----------------

const stepsContainer = document.getElementById("stepsContainer");

stepsContainer.addEventListener("input", (e) => {
  if (
    e.target.classList.contains("stepInput") &&
    e.target.value.trim() !== "" &&
    !e.target.nextElementSibling // only add if there's no next input yet
  ) {
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "stepInput";
    newInput.placeholder = "Step name";
    newInput.setAttribute("enterkeyhint", "done");
    stepsContainer.appendChild(newInput);
  }
});

// ---------------- GOAL CREATION ----------------
async function createGoal() {
  const title = document.getElementById("goalTitle").value.trim();
  const frequency = document.getElementById("stepFrequency").value;
  const status = document.getElementById("goalStatus");

  const steps = [...document.querySelectorAll(".stepInput")]
    .map((input) => input.value.trim())
    .filter((val) => val !== "")
    .map((name, index) => ({
      index,
      name,
      frequency,
      subscription,
    }));

  if (!title || steps.length === 0) {
    return showMessage(status, "Title and steps required", "error");
  }

  if (!subscription) {
    return showMessage(
      status,
      "Subscribe to reminders before creating goals",
      "error"
    );
  }

  showLoader(status, "Creating goal");
  try {
    const res = await fetch("/student/create/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, steps }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(status, "Goal created successfully", "success");
      document.getElementById("goalTitle").value = "";
      document.querySelectorAll(".stepInput").forEach((e) => {
        e.value = "";
      });
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- PUSH SUBSCRIPTION ----------------
async function registerSW() {
  if (!("serviceWorker" in navigator))
    throw new Error("Service Worker not supported");
  return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getOrCreateSubscription() {
  await registerSW();
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  if (!vapidPublicKey) throw new Error("Missing VAPID key. Login first.");

  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

document.getElementById("subscribeBtn").onclick = async () => {
  const status = document.getElementById("pushStatus");
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return showMessage(
        status,
        "Notifications are blocked. Enable them in browser settings.",
        "error"
      );
    }

    subscription = await getOrCreateSubscription();
    localStorage.setItem("subscription", JSON.stringify(subscription));
    showMessage(status, "Subscribed successfully", "success");
  } catch (err) {
    showMessage(status, "Subscribe error: " + err.message, "error");
  }
};

document.getElementById("testPushBtn").onclick = async () => {
  const status = document.getElementById("pushStatus");
  try {
    if (!subscription) {
      return showMessage(
        status,
        "No subscription found. Click Subscribe first.",
        "error"
      );
    }

    const res = await fetch("/student/create/goals", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(subscription),
    });

    const data = await res.json();
    loadGoals();
    res.ok
      ? showMessage(status, data.message, "success")
      : showMessage(status, data.message, "error");
  } catch {
    showMessage(status, data.message, "error");
  }
};

// ---------------- EVENT BINDINGS ----------------
document.getElementById("registerBtn").onclick = registerUser;
document.getElementById("loginBtn").onclick = loginUser;
document.getElementById("createGoalBtn").onclick = createGoal;
// ---------------- GOALS LIST & PAGINATION ----------------
// ---------------- GOALS LIST & PAGINATION ----------------

let currentPage = 1;
let totalPages = 1;

async function fetchGoals(page = 1, limit = 10) {
  const status = document.getElementById("goalsStatus");
  showLoader(status, "Loading goals");

  try {
    const res = await fetch(
      `/student/create/goals?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      showMessage(status, data.message || "Failed to load goals", "error");
      return { goals: [], page: 1, pages: 1, total: 0 };
    }

    showMessage(status, `Loaded ${data.goals.length} goals`, "success");
    return {
      goals: data.goals,
      page: data.page,
      pages: data.pages,
      total: data.total,
    };
  } catch {
    showMessage(status, "contact admin if this persists", "error");
    return { goals: [], page: 1, pages: 1, total: 0 };
  }
}

function renderGoals(goals, page, pages) {
  const container = document.getElementById("goalsList");
  const pageInfo = document.getElementById("pageInfo");
  container.innerHTML = "";

  if (!goals.length) {
    container.innerHTML = `<p class="error">No goals found</p>`;
  }

  goals.forEach((goal) => {
    const card = document.createElement("div");
    card.className = "goal-card";

    const header = document.createElement("div");
    header.className = "goal-header";

    const title = document.createElement("h3");
    title.textContent = goal.title;

    const info = document.createElement("span");
    info.className = "meta";
    const start = goal.startDate
      ? new Date(goal.startDate).toLocaleDateString()
      : "-";
    const end = goal.endDate
      ? new Date(goal.endDate).toLocaleDateString()
      : "-";
    info.textContent = `Start: ${start} • End: ${end} • Status: ${
      goal.status || "active"
    }`;

    // Add View Streak button
    const streakBtn = document.createElement("button");
    streakBtn.textContent = "View Streak";
    streakBtn.onclick = () => loadStreak(goal._id);

    header.appendChild(title);
    header.appendChild(info);
    header.appendChild(streakBtn);

    const stepsWrap = document.createElement("div");
    stepsWrap.className = "steps-list";

    if (Array.isArray(goal.steps) && goal.steps.length) {
      goal.steps.forEach((step) => {
        const row = document.createElement("div");
        row.className = "step-row";

        const left = document.createElement("div");
        left.innerHTML = `<strong>${step.name}</strong><div class="meta">Frequency: ${step.frequency} • Index: ${step.index}</div>`;

        const btn = document.createElement("button");
        btn.textContent = step.completed ? "Done" : "Mark Done";
        btn.disabled = !!step.completed;

        btn.onclick = async () => {
          await markStepDone(goal._id, step.index);
        };

        row.appendChild(left);
        row.appendChild(btn);
        stepsWrap.appendChild(row);
      });
    } else {
      stepsWrap.innerHTML = `<p class="error">No steps for this goal</p>`;
    }

    card.appendChild(header);
    card.appendChild(stepsWrap);
    container.appendChild(card);
  });

  currentPage = page;
  totalPages = pages;
  pageInfo.textContent = `Page ${page} of ${pages}`;
  document.getElementById("prevPageBtn").disabled = page <= 1;
  document.getElementById("nextPageBtn").disabled = page >= pages;
}

async function loadGoals() {
  const limit = Number(document.getElementById("goalsPageSize").value || 10);
  const { goals, page, pages } = await fetchGoals(currentPage, limit);
  renderGoals(goals, page, pages);
}

async function markStepDone(goalId, stepIndex) {
  const status = document.getElementById("goalsStatus");
  showLoader(status, "Submitting step");

  try {
    const res = await fetch(`/student/goal/${goalId}/step/${stepIndex}/done`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      // backend resolves user from token
    });

    const data = await res.json();

    if (!res.ok) {
      return showMessage(
        status,
        data.message || "Failed to submit step",
        "error"
      );
    }

    showMessage(status, "Step ticked and streak updated", "success");
    await loadGoals();
  } catch {
    showMessage(status, data.message, "error");
  }
}

// ---------------- BINDINGS & LOGIN HOOK ----------------

function showGoalsUI() {
  document.getElementById("goalsListSection").classList.remove("hidden");
  loadGoals();
}

document.getElementById("refreshGoalsBtn").onclick = loadGoals;
document.getElementById("goalsPageSize").onchange = () => {
  currentPage = 1;
  loadGoals();
};
document.getElementById("prevPageBtn").onclick = () => {
  if (currentPage > 1) {
    currentPage -= 1;
    loadGoals();
  }
};
document.getElementById("nextPageBtn").onclick = () => {
  if (currentPage < totalPages) {
    currentPage += 1;
    loadGoals();
  }
};

// ---------------- STREAK LOGIC ----------------

async function loadStreak(goalId) {
  const status = document.getElementById("streakStatus");
  showLoader(status, "Loading streak");

  try {
    const res = await fetch(`/student/streaks/ALL/${goalId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      return showMessage(status, data.message, "error");
    }

    document.getElementById("streakCounts").innerHTML = `
      <p>Current Streak: <strong>${data.currentStreak}</strong></p>
      <p>Longest Streak: <strong>${data.longestStreak}</strong></p>
    `;

    renderCalendar(data.completedDates, data.completedWeeks);
    showMessage(status, "Streak loaded", "success");

    // Show modal
    document.getElementById("streakModal").classList.remove("hidden");
  } catch {
    showMessage(status, "Network error", "error");
  }
}

// Close modal handler
document.getElementById("closeStreakModal").onclick = () => {
  document.getElementById("streakModal").classList.add("hidden");
};

// Optional: close modal when clicking outside content
window.onclick = (event) => {
  const modal = document.getElementById("streakModal");
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
};

// Track current view
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function renderCalendar(completedDates, completedWeeks) {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();

  // ✅ Normalize sets
  // Daily completions → compare by toDateString
  const completedSet = new Set(
    completedDates.map((d) => new Date(d).toDateString())
  );

  // Weekly completions → convert serialized strings back to Date, then to timestamp
  const weekSet = new Set(completedWeeks.map((d) => new Date(d).getTime()));

  // Month header with navigation
  const headerRow = document.createElement("div");
  headerRow.className = "calendar-nav";
  headerRow.innerHTML = `
    <button id="prevMonth">&lt;</button>
    <span>${firstDay.toLocaleString("default", {
      month: "long",
    })} ${currentYear}</span>
    <button id="nextMonth">&gt;</button>
  `;
  grid.appendChild(headerRow);

  // Weekday headers
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  weekdays.forEach((day) => {
    const headerCell = document.createElement("div");
    headerCell.textContent = day;
    headerCell.className = "calendar-header";
    grid.appendChild(headerCell);
  });

  // Offset for first day (make Monday=1)
  let startOffset = firstDay.getDay();
  if (startOffset === 0) startOffset = 7;
  for (let i = 1; i < startOffset; i++) {
    const emptyCell = document.createElement("div");
    grid.appendChild(emptyCell);
  }

  // Render each day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = day;

    const dateStr = date.toDateString();
    const weekKey = getWeekStart(date).getTime(); // canonical Monday timestamp

    if (completedSet.has(dateStr)) {
      cell.classList.add("completed"); // daily completion
    } else if (weekSet.has(weekKey)) {
      cell.classList.add("completed"); // weekly completion
    } else {
      cell.classList.add("missed"); // not completed
    }

    grid.appendChild(cell);
  }

  // Navigation buttons
  document.getElementById("prevMonth").onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(completedDates, completedWeeks);
  };

  document.getElementById("nextMonth").onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(completedDates, completedWeeks);
  };
}

// Helper: get Monday of the week
function getWeekStart(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const dayNum = d.getUTCDay() || 7; // Sunday=0 → 7
  d.setUTCDate(d.getUTCDate() - dayNum + 1);
  return d;
}
