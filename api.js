// ===== THAWMAN FITNESS API SYNC ENGINE =====
const API_BASE = "http://localhost:3000/api";

// 1. Helper to push local states to backend
async function pushUserToBackend(username) {
  if (!username) return;
  const streakKey = `thawman_streak_${username}`;

  const payload = {
    username: username,
    userData: JSON.parse(localStorage.getItem("userData") || "{}"),
    workoutHistory: JSON.parse(localStorage.getItem("workoutHistory") || "[]"),
    foodLog_today: JSON.parse(localStorage.getItem("foodLog_today") || "[]"),
    foodLog_date: localStorage.getItem("foodLog_date") || "",
    streakData: JSON.parse(localStorage.getItem(streakKey) || "null")
  };

  try {
    const res = await fetch(`${API_BASE}/user/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Sync post failed: ${res.statusText}`);
    }
    console.log("[Sync] Local data successfully pushed to server.");
  } catch (err) {
    console.warn("[Sync] Could not push data to server. Operating in offline mode.", err);
  }
}

// 2. Helper to pull backend data and merge into localStorage
async function syncUserFromBackend(username) {
  if (!username) return;
  const streakKey = `thawman_streak_${username}`;

  try {
    const res = await fetch(`${API_BASE}/user/sync?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error(`Sync get failed: ${res.statusText}`);
    }

    const serverData = await res.json();
    console.log("[Sync] Received server data:", serverData);

    // Merge strategy: Server wins for main records if they are not empty,
    // but if local is newer or has data, we merge. For simple workout logs,
    // we union the unique logs by timestamp/date.
    
    // Merge workout histories (union by date/timestamp if available, or just keep unique stringified values)
    const localHistory = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
    const serverHistory = serverData.workoutHistory || [];
    const mergedHistory = mergeWorkoutHistories(localHistory, serverHistory);

    // Write back to localStorage if updated
    let updated = false;

    const currentUD = localStorage.getItem("userData");
    const serverUDStr = JSON.stringify(serverData.userData || {});
    if (serverUDStr !== currentUD && Object.keys(serverData.userData || {}).length > 0) {
      localStorage.setItem("userData", serverUDStr);
      updated = true;
    }

    const currentHistory = localStorage.getItem("workoutHistory") || "[]";
    const mergedHistoryStr = JSON.stringify(mergedHistory);
    if (mergedHistoryStr !== currentHistory) {
      localStorage.setItem("workoutHistory", mergedHistoryStr);
      updated = true;
    }
    
    const currentFoodLog = localStorage.getItem("foodLog_today") || "[]";
    const serverFoodLogStr = JSON.stringify(serverData.foodLog_today || []);
    if (serverFoodLogStr !== currentFoodLog && (serverData.foodLog_today || []).length > 0) {
      localStorage.setItem("foodLog_today", serverFoodLogStr);
      localStorage.setItem("foodLog_date", serverData.foodLog_date);
      updated = true;
    }

    const currentStreak = localStorage.getItem(streakKey);
    const serverStreakStr = JSON.stringify(serverData.streakData || {});
    if (serverStreakStr !== currentStreak && Object.keys(serverData.streakData || {}).length > 0) {
      localStorage.setItem(streakKey, serverStreakStr);
      updated = true;
    }

    console.log("[Sync] Synchronized and merged client local storage.");
    
    if (updated) {
      // Trigger custom event to notify other scripts (e.g. dashboard lists) to redraw
      window.dispatchEvent(new Event("backendSyncComplete"));
    }

    // Push back the merged history to make sure server is updated
    await pushUserToBackend(username);
  } catch (err) {
    console.warn("[Sync] Pull sync failed (offline). Running locally.", err);
  }
}

// Helper to merge workout histories
function mergeWorkoutHistories(local, server) {
  const map = new Map();
  // Add server items
  server.forEach(item => {
    const key = item.timestamp || item.date || JSON.stringify(item);
    map.set(key, item);
  });
  // Local items overwrite or add
  local.forEach(item => {
    const key = item.timestamp || item.date || JSON.stringify(item);
    map.set(key, item);
  });
  return Array.from(map.values());
}

// 3. Authentication Wrappers
async function registerUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }
  
  const data = await res.json();
  localStorage.setItem("user", data.username);
  await pushUserToBackend(data.username);
  return data;
}

async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  
  const data = await res.json();
  localStorage.setItem("user", data.username);
  await syncUserFromBackend(data.username);
  return data;
}

// 4. Debounced LocalStorage Interceptor
let pushTimeout = null;
function triggerPushDebounced() {
  const username = localStorage.getItem("user");
  if (!username) return;

  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    pushUserToBackend(username).catch(err => {
      console.warn("[Sync] Server push failed (offline):", err);
    });
  }, 1200); // 1.2s debounce to aggregate quick consecutive writes
}

// Hook into localStorage.setItem to auto-sync changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);

  const syncKeys = ["userData", "workoutHistory", "foodLog_today", "foodLog_date"];
  if (syncKeys.includes(key) || key.startsWith("thawman_streak_")) {
    triggerPushDebounced();
  }
};

// 5. Automatic Startup Sync
(function initStartupSync() {
  window.addEventListener("load", () => {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      console.log(`[Sync] Startup sync initiated for active user: ${currentUser}`);
      syncUserFromBackend(currentUser);
    }
  });
})();
