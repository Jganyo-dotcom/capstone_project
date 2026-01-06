// ---------------- STATE ----------------
let token = localStorage.getItem("token") || null;
let vapidPublicKey = null;
let subscription = JSON.parse(localStorage.getItem("subscription")) || null;

// ---------------- UTILITIES ----------------
function showLoader(el) {
  el.innerHTML = 'Processing <span class="loader"></span>';
}
function showMessage(el, msg, type = "success") {
  el.className = type;
  el.textContent = msg;
}

// ---------------- AUTH ----------------
async function registerUser() {
  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const email = document.getElementById("email").value.trim();
  const status = document.getElementById("authStatus");

  if (!name || !username || !phone || !password) {
    return showMessage(status, "All fields are required", "error");
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
      ? showMessage(status, "Registration successful", "success")
      : showMessage(status, data.error || data.message, "error");
  } catch {
    showMessage(status, "Network error", "error");
  }
}

async function loginUser() {
  const main = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("authStatus");

  if (!username || !password) {
    return showMessage(status, "Username and password required", "error");
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
      localStorage.setItem("token", token);
      vapidPublicKey = data.vapidPublicKey;
      showMessage(status, "Login successful", "success");

      document.getElementById("goalSection").classList.remove("hidden");
      document.getElementById("attachSection").classList.remove("hidden");
    } else {
      showMessage(status, data.error || data.message, "error");
    }
  } catch {
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
    .map((input, index) => input.value.trim())
    .filter((val) => val !== "")
    .map((name, index) => ({
      index,
      name: name,
      frequency,
      subscription: subscription, // attach subscription object
    }));

  if (!title || steps.length === 0) {
    return showMessage(status, "Title and steps required", "error");
  }

  showLoader(status);
  try {
    if (!subscription) {
      alert("Subscribe to reminders before creating goals");
      return;
    }

    const res = await fetch("/student/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, steps }),
    });

    const data = await res.json();
    res.ok
      ? showMessage(status, "Goal created successfully", "success")
      : showMessage(status, data.error || data.message, "error");
  } catch {
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
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(subscription),
    });
    const data = await res.json();

    res.ok
      ? showMessage(status, "Subscription attached successfully", "success")
      : showMessage(status, data.error || data.message, "error");
  } catch {
    showMessage(status, "Network error", "error");
  }
}

// ---------------- PUSH SUBSCRIPTION ----------------
async function registerSW() {
  if (!("serviceWorker" in navigator))
    throw new Error("Service Worker not supported");
  return await navigator.serviceWorker.register("/sw.js");
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

document.getElementById("subscribeBtn").onclick = async () => {
  const status = document.getElementById("pushStatus");
  try {
    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      showMessage(
        status,
        "Notifications are blocked. Please enable them in browser settings.",
        "error"
      );
      return; // stop here if denied
    }

    // Register service worker and subscribe
    const reg = await registerSW();
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    localStorage.setItem("subscription", JSON.stringify(subscription));
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

    const res = await fetch("/student/notify-me-daily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(subscription),
    });

    const data = await res.json();
    res.ok
      ? showMessage(status, "Test push sent", "success")
      : showMessage(status, data.error || data.message, "error");
  } catch {
    showMessage(status, "Network error", "error");
  }
};

// ---------------- EVENT BINDINGS ----------------
document.getElementById("registerBtn").onclick = registerUser;
document.getElementById("loginBtn").onclick = loginUser;
document.getElementById("createGoalBtn").onclick = createGoal;
document.getElementById("attachSubBtn").onclick = attachSubscription;
