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

      showMessage(status, "Login successful", "success");
      document.getElementById("goalSection").classList.remove("hidden");
      document.getElementById("attachSection")?.classList.remove("hidden");
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
    res.ok
      ? showMessage(status, "Goal created successfully", "success")
      : showMessage(status, data.error || data.message, "error");
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
    res.ok
      ? showMessage(status, data.message, "success")
      : showMessage(status, data.error || data.message, "error");
  } catch {
    showMessage(status, "Network error", "error");
  }
};

// ---------------- EVENT BINDINGS ----------------
document.getElementById("registerBtn").onclick = registerUser;
document.getElementById("loginBtn").onclick = loginUser;
document.getElementById("createGoalBtn").onclick = createGoal;
