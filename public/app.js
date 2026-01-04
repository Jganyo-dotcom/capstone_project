// State
let token = null;
let vapidPublicKey = null;
let subscription = null;

// Utility functions
function showLoader(el) {
  el.innerHTML = 'Processing <span class="loader"></span>';
}

function showMessage(el, msg, type = "success") {
  el.className = type;
  el.textContent = msg;
}

// ---------------- AUTH ----------------
async function registerUser() {
  const main = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("authStatus");

  if (!main || !password) {
    return showMessage(status, "Email and password required", "error");
  }

  showLoader(status);
  try {
    const res = await fetch("/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ main, password }),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(status, "Registration successful", "success");
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch (err) {
    showMessage(status, "Network error", "error");
  }
}

async function loginUser() {
  const main = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("authStatus");

  if (!main || !password) {
    return showMessage(status, "Email and password required", "error");
  }

  showLoader(status);
  try {
    const res = await fetch("/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ main, password }),
    });
    const data = await res.json();

    if (res.ok && data.token) {
      token = data.token;
      vapidPublicKey = data.vapidPublicKey;
      showMessage(status, "Login successful", "success");

      // Reveal hidden sections
      document.getElementById("goalSection").classList.remove("hidden");
      document.getElementById("attachSection").classList.remove("hidden");
    } else {
      alert(data.message);
      showMessage(status, data.error || data.message, "error");
    }
  } catch (err) {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- DYNAMIC STEPS ----------------
const stepsContainer = document.getElementById("stepsContainer");

stepsContainer.addEventListener("keydown", (e) => {
  if (e.target.classList.contains("stepInput") && e.key === "Enter") {
    e.preventDefault();
    if (e.target.value.trim() !== "") {
      const newInput = document.createElement("input");
      newInput.className = "stepInput";
      newInput.placeholder = "Step name";
      stepsContainer.appendChild(newInput);
      newInput.focus();
    }
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
    .map((name) => ({ name, frequency }));

  if (!title || steps.length === 0) {
    return showMessage(status, "Title and steps required", "error");
  }

  showLoader(status);
  try {
    const res = await fetch("/student/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, steps }),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(status, "Goal created successfully", "success");
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch (err) {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- ATTACH SUBSCRIPTION ----------------
async function attachSubscription() {
  const goalId = document.getElementById("goalId").value.trim();
  const status = document.getElementById("attachStatus");

  if (!subscription) {
    return showMessage(status, "Subscribe first", "error");
  }
  if (!goalId) {
    return showMessage(status, "Goal ID required", "error");
  }

  showLoader(status);
  try {
    const res = await fetch(`/api/goals/${goalId}/steps/0/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(status, "Subscription attached successfully", "success");
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch (err) {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- EVENT BINDINGS ----------------
document.getElementById("registerBtn").onclick = registerUser;
document.getElementById("loginBtn").onclick = loginUser;
document.getElementById("createGoalBtn").onclick = createGoal;
document.getElementById("attachSubBtn").onclick = attachSubscription;
