// ===== DAILY GOALS ENGINE =====
// Uses U object from dashboard.js (name, weight, goal, age, gender)

// ===== CALCULATE TARGETS =====
let calTarget = 2000;
let proTarget = 150;
let waterTarget = 8;
const burnTarget = 500; // daily burn goal

function calculateTargets() {
  const wt = parseInt(U.weight) || 70;
  const age = parseInt(U.age) || 24;
  const bmr = U.gender === "male"
    ? Math.round(88.362 + (13.397 * wt) + (4.799 * 170) - (5.677 * age))
    : Math.round(447.593 + (9.247 * wt) + (3.098 * 160) - (4.330 * age));
  const tdee = Math.round(bmr * 1.55);
  calTarget = U.goal === "gain" ? tdee + 400 : tdee - 500;
  proTarget = U.goal === "gain" ? Math.round(wt * 2) : Math.round(wt * 1.8);
  waterTarget = Math.round(wt * 0.035 * 4); // glasses (250ml each)

  // Set targets in UI
  document.getElementById("cal-target").textContent = calTarget;
  document.getElementById("pro-target").textContent = proTarget;
  document.getElementById("water-target").textContent = waterTarget;
  document.getElementById("goals-date").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// Initial calculation
calculateTargets();

// ===== LOAD TODAY'S DATA =====
const todayKey = new Date().toDateString();

function loadToday(key, def) {
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.date === todayKey) return parsed.value;
  }
  return def;
}
function saveToday(key, value) {
  localStorage.setItem(key, JSON.stringify({ date: todayKey, value }));
}

// ===== WATER =====
let waterCount = loadToday("waterCount", 0);

function addWater() {
  waterCount++;
  saveToday("waterCount", waterCount);
  updateGoals();
}
function resetWater() {
  waterCount = 0;
  saveToday("waterCount", 0);
  updateGoals();
}

// ===== CALORIES BURNED FROM EXERCISES =====
// Approximate calories burned per exercise type per set
const burnPerSet = {
  "bench press": 8, "squats": 12, "deadlift": 14, "pull-ups": 9,
  "shoulder press": 7, "barbell rows": 9, "bicep curls": 5, "leg press": 10,
  "incline": 8, "overhead": 7, "lateral": 5, "flyes": 6, "dips": 8,
  "lunges": 10, "calf": 5, "curls": 5, "tricep": 6, "cable": 6,
  "plank": 4, "burpees": 15, "mountain": 12, "jumping": 10, "push-up": 7,
  "pushup": 7, "pushups": 7, "default": 7
};

function getCalsBurned() {
  const history = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
  if (history.length === 0) return 0;
  const latest = history[0];
  // Check if today
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  if (latest.date !== todayStr) return 0;

  let totalBurn = 0;
  (latest.exercises || []).forEach(ex => {
    const name = ex.name.toLowerCase();
    let rate = burnPerSet.default;
    for (const key in burnPerSet) {
      if (name.includes(key)) { rate = burnPerSet[key]; break; }
    }
    const sets = parseInt(ex.sets) || 0;
    const reps = parseInt(ex.reps) || 10;
    totalBurn += sets * reps * rate * 0.15; // rough estimate
  });
  return Math.round(totalBurn);
}

// ===== FOOD LOG DATA =====
function getFoodTotals() {
  const logDate = localStorage.getItem("foodLog_date");
  if (logDate !== todayKey) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const log = JSON.parse(localStorage.getItem("foodLog_today") || "[]");
  return log.reduce((a, b) => ({
    cal: a.cal + (b.cal || 0),
    protein: a.protein + (b.protein || 0),
    carbs: a.carbs + (b.carbs || 0),
    fat: a.fat + (b.fat || 0)
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

// ===== FOOD SUGGESTIONS =====
const suggestFoods = [
  { name: "Eggs (2 large)", cal: 155, protein: 13, easy: true },
  { name: "Glass of Milk", cal: 120, protein: 6, easy: true },
  { name: "Whey Shake", cal: 130, protein: 25, easy: true },
  { name: "Greek Yogurt", cal: 100, protein: 17, easy: true },
  { name: "Chicken Breast (100g)", cal: 165, protein: 31, easy: false },
  { name: "Paneer (100g)", cal: 265, protein: 18, easy: true },
  { name: "Peanut Butter Toast", cal: 250, protein: 10, easy: true },
  { name: "Banana + Whey", cal: 220, protein: 27, easy: true },
  { name: "Handful of Almonds", cal: 160, protein: 6, easy: true },
  { name: "Curd / Yogurt", cal: 60, protein: 4, easy: true },
  { name: "Dal + Rice", cal: 250, protein: 12, easy: false },
  { name: "Boiled Eggs (3)", cal: 230, protein: 19, easy: true },
  { name: "Cottage Cheese", cal: 98, protein: 11, easy: true },
  { name: "Tuna Can", cal: 132, protein: 28, easy: true },
  { name: "Protein Bar", cal: 200, protein: 20, easy: true },
];

function getSuggestion(calRemain, proRemain) {
  if (calRemain <= 0 && proRemain <= 0) return null;

  // Filter foods that help fill the gap
  let picks = suggestFoods
    .filter(f => f.cal <= calRemain + 100 && f.protein <= proRemain + 20)
    .sort((a, b) => b.protein - a.protein); // prioritize protein

  if (picks.length === 0) picks = suggestFoods.filter(f => f.easy).slice(0, 3);
  const top = picks.slice(0, 3);

  let html = `You still need <strong>${Math.max(0, calRemain)} kcal</strong> and <strong>${Math.max(0, proRemain)}g protein</strong> to hit today's goal. Try adding:<br><br>`;
  top.forEach(f => {
    html += `✅ <strong>${f.name}</strong> — ${f.cal} kcal, ${f.protein}g protein<br>`;
  });
  html += `<br>These are easy to prepare and will get you closer to your target!`;
  return html;
}

// ===== STREAK SYSTEM =====
const DISCIPLINED_QUOTES = [
  "Consistent action is the key to all transformations. You are building the future you!",
  "Great job showing up. No excuses. Keep this flame burning! 🔥",
  "Discipline is choosing between what you want now and what you want most.",
  "Success isn't always about greatness. It's about consistency.",
  "You are in the zone. Don't look back, keep moving forward! 🚀",
  "Your dedication today builds your strength tomorrow. Keep grinding!"
];

const RESTART_QUOTES = [
  "It's time to re-ignite the fire. Don't let yesterday's inaction define today! ⚡",
  "Your streak reset, but your goals didn't. Get back on track today!",
  "The secret of getting ahead is getting started. Do one small thing today.",
  "One workout, one healthy meal, one glass of water. That is all it takes to restart.",
  "Consistency is a choice. Choose your goals over your comfort today! 💪",
  "A year from now, you will wish you had started today. Let's go!"
];

function checkAndUpdateStreak() {
  const streakKey = "thawman_streak_data";
  const todayStr = new Date().toDateString();
  
  let streakData = JSON.parse(localStorage.getItem(streakKey) || JSON.stringify({
    currentStreak: 0,
    lastActiveDate: "",
    daysLogged: []
  }));

  // Activity = logged food OR finished a workout today.
  const foodTotals = getFoodTotals();
  const calsBurned = getCalsBurned();
  const hasActivityToday = (foodTotals.cal > 0 || calsBurned > 0);

  if (hasActivityToday) {
    if (!streakData.daysLogged.includes(todayStr)) {
      streakData.daysLogged.push(todayStr);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (streakData.lastActiveDate === yesterdayStr) {
        streakData.currentStreak += 1;
      } else if (streakData.lastActiveDate !== todayStr) {
        streakData.currentStreak = 1;
      }
      streakData.lastActiveDate = todayStr;
      localStorage.setItem(streakKey, JSON.stringify(streakData));
    }
  } else {
    // Check if streak was broken yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (streakData.lastActiveDate !== todayStr && streakData.lastActiveDate !== yesterdayStr) {
      streakData.currentStreak = 0;
      localStorage.setItem(streakKey, JSON.stringify(streakData));
    }
  }

  // Update UI
  const streakDaysEl = document.getElementById("streak-days");
  const streakBanner = document.getElementById("streak-banner");
  const motivationTitle = document.getElementById("motivation-title");
  const motivationQuote = document.getElementById("motivation-quote");

  const currentStreak = streakData.currentStreak;
  if (streakDaysEl) streakDaysEl.textContent = currentStreak;

  if (currentStreak > 0) {
    if (streakBanner) {
      streakBanner.style.background = "linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(124, 58, 237, 0.06))";
      streakBanner.style.borderColor = "rgba(255, 107, 0, 0.15)";
    }
    if (motivationTitle) motivationTitle.innerHTML = `🔥 DISCIPLINE MODE ACTIVE — ${currentStreak} DAY${currentStreak > 1 ? 'S' : ''} STREAK`;
    const quoteIndex = new Date().getDate() % DISCIPLINED_QUOTES.length;
    if (motivationQuote) motivationQuote.textContent = `"${DISCIPLINED_QUOTES[quoteIndex]}"`;
  } else {
    if (streakBanner) {
      streakBanner.style.background = "linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.04))";
      streakBanner.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }
    if (motivationTitle) motivationTitle.innerHTML = `⚡ RE-IGNITE THE FLAME`;
    const quoteIndex = new Date().getDate() % RESTART_QUOTES.length;
    if (motivationQuote) motivationQuote.textContent = `"${RESTART_QUOTES[quoteIndex]}"`;
  }
}

// ===== UPDATE ALL GOALS =====
function updateGoals() {
  calculateTargets();
  const food = getFoodTotals();
  const burned = getCalsBurned();

  // Calories
  // Adjust target calories for exercise burn when aiming to gain weight
  const effectiveCalTarget = (typeof U !== 'undefined' && U.goal === "gain") ? calTarget + burned : calTarget;
  const calPct = Math.min((food.cal / effectiveCalTarget) * 100, 100);
  document.getElementById("cal-eaten").textContent = food.cal;
  document.getElementById("cal-bar").style.width = calPct + "%";
  const calRemain = effectiveCalTarget - food.cal;
  document.getElementById("cal-remain").textContent = calRemain > 0 ? `${calRemain} kcal remaining` : "✅ Goal reached!";

  // Protein
  const proPct = Math.min((food.protein / proTarget) * 100, 100);
  document.getElementById("pro-eaten").textContent = food.protein;
  document.getElementById("pro-bar").style.width = proPct + "%";
  const proRemain = proTarget - food.protein;
  document.getElementById("pro-remain").textContent = proRemain > 0 ? `${proRemain}g remaining` : "✅ Goal reached!";

  // Water
  const waterPct = Math.min((waterCount / waterTarget) * 100, 100);
  document.getElementById("water-done").textContent = waterCount;
  document.getElementById("water-bar").style.width = waterPct + "%";

  // Burned
  const burnPct = Math.min((burned / burnTarget) * 100, 100);
  document.getElementById("cal-burned").textContent = burned;
  document.getElementById("burn-bar").style.width = burnPct + "%";
  document.getElementById("burn-detail").textContent = burned > 0 ? `🔥 ${burned} kcal burned from exercises today` : "No workout logged yet today";

  // AI Suggestion
  const sugCard = document.getElementById("suggestion-card");
  if (food.cal > 0 && (calRemain > 200 || proRemain > 10)) {
    const sug = getSuggestion(calRemain, proRemain);
    if (sug) {
      sugCard.style.display = "block";
      document.getElementById("sug-body").innerHTML = sug;
    }
  } else if (food.cal > 0 && calRemain <= 200 && proRemain <= 10) {
    sugCard.style.display = "block";
    document.getElementById("sug-body").innerHTML = "🎉 <strong>Amazing!</strong> You've nearly hit all your daily nutrition targets! Keep up the discipline, " + U.name + "! 💪";
  } else {
    sugCard.style.display = "none";
  }

  // Update streak status
  checkAndUpdateStreak();
  // Save stats to daily summary history
  saveDailySummary();
  // Render / refresh growth chart
  updateProgressChart(false);
}

// Initial render
updateGoals();
// Auto-refresh every 5 seconds to pick up nutrition/workout changes
setInterval(updateGoals, 5000);

// ===== GROWTH & TRACKING HISTORY ENGINE =====

function generateMockHistoryIfNeeded() {
  const historyKey = "thawman_daily_summary_history";
  const weightHistoryKey = "thawman_weight_history";
  
  let summaryHistory = localStorage.getItem(historyKey);
  let weightHistory = localStorage.getItem(weightHistoryKey);
  
  // Get active userData
  const ud = JSON.parse(localStorage.getItem("userData") || "{}");
  const currentWeight = parseFloat(ud.weight || U.weight || "70");
  const targetWeight = parseFloat(ud.targetWeight || U.targetWeight || ud.weight || "70");
  const goal = ud.goal || U.goal || "gain";
  
  if (!summaryHistory || !weightHistory) {
    const newSummaryHistory = [];
    const newWeightHistory = [];
    
    // We generate 30 days of history
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString(); // e.g. "Wed May 20 2026"
      
      // Calculate weight for this day
      // Linear transition from startWeight to currentWeight
      // If goal is lose: start weight was higher (e.g. current + 4.5kg)
      // If goal is gain: start weight was lower (e.g. current - 3.0kg)
      let progressPct = (30 - i) / 30; // 0 to 1
      let baseWeight;
      if (goal === "lose") {
        const startWeight = currentWeight + 4.5;
        baseWeight = startWeight - (4.5 * progressPct);
      } else {
        const startWeight = currentWeight - 3.0;
        baseWeight = startWeight + (3.0 * progressPct);
      }
      // Add slight daily noise
      const noise = (Math.sin(i) * 0.15) + (Math.cos(i * 1.5) * 0.1);
      const dayWeight = parseFloat((baseWeight + noise).toFixed(1));
      
      // Let's add today's actual weight exactly on i=0
      const finalWeight = (i === 0) ? currentWeight : dayWeight;
      
      // Add to weight history
      newWeightHistory.push({
        date: dateStr,
        weight: finalWeight
      });
      
      // Generate daily summary stats
      // Standard target estimates
      const wtForTarget = finalWeight;
      const age = parseInt(ud.age || U.age || "24");
      const gender = ud.gender || U.gender || "male";
      const bmr = gender === "male"
        ? Math.round(88.362 + (13.397 * wtForTarget) + (4.799 * 170) - (5.677 * age))
        : Math.round(447.593 + (9.247 * wtForTarget) + (3.098 * 160) - (4.330 * age));
      const tdee = Math.round(bmr * 1.55);
      const dayCalTarget = goal === "gain" ? tdee + 400 : tdee - 500;
      const dayProTarget = goal === "gain" ? Math.round(wtForTarget * 2) : Math.round(wtForTarget * 1.8);
      
      // Fluctuations
      const calNoisePct = 0.9 + (Math.sin(i * 0.5) * 0.12) + (Math.random() * 0.06);
      const calEaten = Math.round(dayCalTarget * calNoisePct);
      
      const proNoisePct = 0.85 + (Math.cos(i * 0.4) * 0.15) + (Math.random() * 0.05);
      const protein = Math.round(dayProTarget * proNoisePct);
      
      const waterBase = Math.round(wtForTarget * 0.035 * 4);
      const water = Math.max(3, Math.round(waterBase + (Math.sin(i) * 2)));
      
      let calBurned = 0;
      if (i % 3 !== 0) {
        calBurned = Math.round(350 + (Math.sin(i * 2.3) * 120) + (Math.random() * 50));
      }
      
      newSummaryHistory.push({
        date: dateStr,
        calEaten: i === 0 ? getFoodTotals().cal : calEaten,
        protein: i === 0 ? getFoodTotals().protein : protein,
        water: i === 0 ? waterCount : water,
        calBurned: i === 0 ? getCalsBurned() : calBurned,
        weight: finalWeight
      });
    }
    
    // Save to local storage
    localStorage.setItem(historyKey, JSON.stringify(newSummaryHistory));
    localStorage.setItem(weightHistoryKey, JSON.stringify(newWeightHistory));
    
    // Also save in userData so it syncs to server
    ud.dailySummaryHistory = newSummaryHistory;
    ud.weightHistory = newWeightHistory;
    localStorage.setItem("userData", JSON.stringify(ud));
    
    console.log("[Stats] Initialized 30-day mock history.");
  }
}

function saveDailySummary() {
  const todayStr = new Date().toDateString();
  const food = getFoodTotals();
  const burned = getCalsBurned();
  const historyKey = "thawman_daily_summary_history";
  
  // Make sure mock is generated first if empty
  generateMockHistoryIfNeeded();
  
  let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
  
  let entryIndex = history.findIndex(h => h.date === todayStr);
  let entry;
  if (entryIndex !== -1) {
    entry = history[entryIndex];
  } else {
    entry = { date: todayStr };
    history.push(entry);
  }
  entry.calEaten = food.cal;
  entry.protein = food.protein;
  entry.water = waterCount;
  entry.calBurned = burned;
  entry.weight = parseFloat(U.weight) || 70;
  
  localStorage.setItem(historyKey, JSON.stringify(history));

  // Sync to backend via userData
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.dailySummaryHistory = history;
  
  // Also synchronize weight history
  const weightHistoryKey = "thawman_weight_history";
  let wHistory = JSON.parse(localStorage.getItem(weightHistoryKey) || "[]");
  let wEntryIndex = wHistory.findIndex(h => h.date === todayStr);
  if (wEntryIndex !== -1) {
    wHistory[wEntryIndex].weight = parseFloat(U.weight) || 70;
  } else {
    wHistory.push({ date: todayStr, weight: parseFloat(U.weight) || 70 });
  }
  wHistory.sort((a,b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(weightHistoryKey, JSON.stringify(wHistory));
  userData.weightHistory = wHistory;

  localStorage.setItem("userData", JSON.stringify(userData));
}

// ===== CHART CONFIG AND VIEW CONTROLLERS =====

let currentChartType = 'weight';
let currentTimeframe = 'week';
let growthChartInstance = null;

function switchChartType(type) {
  currentChartType = type;
  document.getElementById("tab-chart-weight").classList.toggle("active", type === 'weight');
  document.getElementById("tab-chart-calories").classList.toggle("active", type === 'calories');
  updateProgressChart(true);
}

function switchTimeframe(tf) {
  currentTimeframe = tf;
  document.getElementById("tab-tf-week").classList.toggle("active", tf === 'week');
  document.getElementById("tab-tf-month").classList.toggle("active", tf === 'month');
  updateProgressChart(true);
}

function submitWeightLog() {
  const input = document.getElementById("input-log-weight");
  if (!input) return;
  const val = parseFloat(input.value);
  if (isNaN(val) || val <= 0 || val > 300) {
    alert("Please enter a valid weight in kg (e.g. 70.5).");
    return;
  }
  
  // Log weight
  const todayStr = new Date().toDateString();
  const weightHistoryKey = "thawman_weight_history";
  let history = JSON.parse(localStorage.getItem(weightHistoryKey) || "[]");
  
  history = history.filter(h => h.date !== todayStr);
  history.push({ date: todayStr, weight: val });
  history.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(weightHistoryKey, JSON.stringify(history));
  
  // Update U.weight and userData
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  userData.weight = val.toString();
  userData.weightHistory = history;
  localStorage.setItem("userData", JSON.stringify(userData));
  
  U.weight = val.toString();
  input.value = "";
  
  // Re-calculate BMR goals
  calculateTargets();
  updateGoals();
  
  // Sync page representation
  if (typeof updateDashboardDynamic === "function") {
    updateDashboardDynamic();
  }
  
  // Refresh chart with animation
  updateProgressChart(true);
  
  alert(`⚖️ Weight logged successfully: ${val} kg!\nTargets and progress chart updated.`);
}

function updateGoalProgressBar() {
  const ud = JSON.parse(localStorage.getItem("userData") || "{}");
  const goal = ud.goal || U.goal || "gain";
  const targetWeight = parseFloat(ud.targetWeight || U.targetWeight || ud.weight || "70");
  const currentWeight = parseFloat(U.weight) || 70;
  
  const weightHistoryKey = "thawman_weight_history";
  const wHistory = JSON.parse(localStorage.getItem(weightHistoryKey) || "[]");
  
  let startWeight = currentWeight;
  if (wHistory.length > 0) {
    startWeight = wHistory[0].weight;
  }
  
  const fillBar = document.getElementById("goal-progress-fill");
  const pctEl = document.getElementById("goal-progress-pct");
  const descEl = document.getElementById("goal-progress-desc");
  
  if (!fillBar || !pctEl || !descEl) return;
  
  if (startWeight === targetWeight) {
    fillBar.style.width = "100%";
    pctEl.textContent = "100%";
    descEl.innerHTML = `🎉 Goal reached! Target is matching starting weight.`;
    return;
  }
  
  let totalDiff = targetWeight - startWeight;
  let currentDiff = currentWeight - startWeight;
  
  let pct = 0;
  if (goal === "lose") {
    if (currentWeight <= targetWeight) {
      pct = 100;
    } else if (currentWeight >= startWeight) {
      pct = 0;
    } else {
      pct = Math.round((currentDiff / totalDiff) * 100);
    }
  } else {
    if (currentWeight >= targetWeight) {
      pct = 100;
    } else if (currentWeight <= startWeight) {
      pct = 0;
    } else {
      pct = Math.round((currentDiff / totalDiff) * 100);
    }
  }
  
  pct = Math.max(0, Math.min(100, pct));
  fillBar.style.width = pct + "%";
  pctEl.textContent = pct + "%";
  
  if (goal === "lose") {
    const remaining = (currentWeight - targetWeight).toFixed(1);
    if (currentWeight <= targetWeight) {
      descEl.innerHTML = `🎉 <strong>Goal Achieved!</strong> You have lost ${(startWeight - currentWeight).toFixed(1)} kg and reached your target!`;
    } else {
      descEl.innerHTML = `🔥 Lost <strong>${(startWeight - currentWeight).toFixed(1)} kg</strong> of the <strong>${(startWeight - targetWeight).toFixed(1)} kg</strong> goal. <strong>${remaining} kg</strong> to go!`;
    }
  } else {
    const remaining = (targetWeight - currentWeight).toFixed(1);
    if (currentWeight >= targetWeight) {
      descEl.innerHTML = `🎉 <strong>Goal Achieved!</strong> You have gained ${(currentWeight - startWeight).toFixed(1)} kg and reached your target!`;
    } else {
      descEl.innerHTML = `💪 Gained <strong>${(currentWeight - startWeight).toFixed(1)} kg</strong> of the <strong>${(targetWeight - startWeight).toFixed(1)} kg</strong> goal. <strong>${remaining} kg</strong> to go!`;
    }
  }
}

function updateProgressChart(animate = false) {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js not loaded yet. Retrying in 100ms...");
    setTimeout(() => updateProgressChart(animate), 100);
    return;
  }
  
  generateMockHistoryIfNeeded();
  
  const historyKey = "thawman_daily_summary_history";
  let history = JSON.parse(localStorage.getItem(historyKey) || "[]");
  
  if (history.length === 0) return;
  
  // Sort history by date to ensure correct timeline plotting
  history.sort((a,b) => new Date(a.date) - new Date(b.date));
  
  // Slice history based on timeframe
  const sliceCount = currentTimeframe === 'week' ? 7 : 30;
  let slicedHistory = history.slice(-sliceCount);
  
  // Calculate averages for summary cards
  const totalWeight = slicedHistory.reduce((sum, item) => sum + (item.weight || 70), 0);
  const avgWeight = (totalWeight / slicedHistory.length).toFixed(1);
  
  const startWeightSlice = slicedHistory[0].weight || 70;
  const endWeightSlice = slicedHistory[slicedHistory.length - 1].weight || 70;
  const weightChange = (endWeightSlice - startWeightSlice).toFixed(1);
  
  const totalCal = slicedHistory.reduce((sum, item) => sum + (item.calEaten || 0), 0);
  const avgCal = Math.round(totalCal / slicedHistory.length);
  
  const totalBurned = slicedHistory.reduce((sum, item) => sum + (item.calBurned || 0), 0);
  const avgBurned = Math.round(totalBurned / slicedHistory.length);
  
  // Populate UI stats cards
  const avgWeightEl = document.getElementById("stat-avg-weight");
  if (avgWeightEl) avgWeightEl.textContent = `${avgWeight} kg`;
  
  const totalWeightChangeEl = document.getElementById("stat-total-weight-change");
  const weightChangeLbl = document.getElementById("stat-lbl-weight-change");
  if (totalWeightChangeEl && weightChangeLbl) {
    const formattedChange = parseFloat(weightChange) > 0 ? `+${weightChange} kg` : `${weightChange} kg`;
    totalWeightChangeEl.textContent = formattedChange;
    weightChangeLbl.textContent = currentTimeframe === 'week' ? "Weekly Change" : "Monthly Change";
    
    // Color code change based on positive or negative
    const goal = U.goal || "gain";
    if ((goal === "lose" && parseFloat(weightChange) < 0) || (goal === "gain" && parseFloat(weightChange) > 0)) {
      totalWeightChangeEl.className = "mini-stat-val text-green-400";
    } else if (parseFloat(weightChange) === 0) {
      totalWeightChangeEl.className = "mini-stat-val text-gray-400";
    } else {
      totalWeightChangeEl.className = "mini-stat-val text-red-400";
    }
  }
  
  const avgCaloriesEl = document.getElementById("stat-avg-calories");
  if (avgCaloriesEl) avgCaloriesEl.textContent = `${avgCal} kcal`;
  
  const avgBurnedEl = document.getElementById("stat-avg-burned");
  if (avgBurnedEl) avgBurnedEl.textContent = `${avgBurned} kcal`;
  
  // Update progress bar
  updateGoalProgressBar();
  
  // Prepare labels and datasets for Chart.js
  const labels = slicedHistory.map(entry => {
    const dObj = new Date(entry.date);
    return dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  
  // Map body theme class to custom Chart.js palette
  const themeColors = {
    beast: { primary: "#ef4444", secondary: "#ea580c", fill: "rgba(239, 68, 68, 0.05)", text: "#94a3b8" },
    zen: { primary: "#06b6d4", secondary: "#3b82f6", fill: "rgba(6, 182, 212, 0.05)", text: "#94a3b8" },
    clean: { primary: "#10b981", secondary: "#84cc16", fill: "rgba(16, 185, 129, 0.05)", text: "#94a3b8" },
    default: { primary: "#7c3aed", secondary: "#4ade80", fill: "rgba(124, 58, 237, 0.05)", text: "#94a3b8" }
  };
  
  const currentTheme = U.vibe || "default";
  const colors = themeColors[currentTheme] || themeColors.default;
  
  const canvas = document.getElementById("growthChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let chartData = {};
  
  if (currentChartType === 'weight') {
    const weights = slicedHistory.map(entry => entry.weight || 70);
    
    chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Weight (kg)',
          data: weights,
          borderColor: colors.primary,
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHitRadius: 10
        }
      ]
    };
  } else {
    const caloriesEaten = slicedHistory.map(entry => entry.calEaten || 0);
    const caloriesBurned = slicedHistory.map(entry => entry.calBurned || 0);
    const calorieTargets = slicedHistory.map(() => calTarget);
    
    chartData = {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Calories Consumed',
          data: caloriesEaten,
          backgroundColor: 'rgba(124, 58, 237, 0.65)',
          borderColor: '#7c3aed',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          type: 'bar',
          label: 'Calories Burned',
          data: caloriesBurned,
          backgroundColor: 'rgba(74, 222, 128, 0.65)',
          borderColor: '#4ade80',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          type: 'line',
          label: 'Daily Target',
          data: calorieTargets,
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0
        }
      ]
    };
    
    if (currentTheme === 'beast') {
      chartData.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.65)';
      chartData.datasets[0].borderColor = '#ef4444';
      chartData.datasets[1].backgroundColor = 'rgba(249, 115, 22, 0.65)';
      chartData.datasets[1].borderColor = '#f97316';
    } else if (currentTheme === 'zen') {
      chartData.datasets[0].backgroundColor = 'rgba(6, 182, 212, 0.65)';
      chartData.datasets[0].borderColor = '#06b6d4';
      chartData.datasets[1].backgroundColor = 'rgba(59, 130, 246, 0.65)';
      chartData.datasets[1].borderColor = '#3b82f6';
    } else if (currentTheme === 'clean') {
      chartData.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.65)';
      chartData.datasets[0].borderColor = '#10b981';
      chartData.datasets[1].backgroundColor = 'rgba(132, 204, 22, 0.65)';
      chartData.datasets[1].borderColor = '#84cc16';
    }
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 20, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: '700' },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 10 }
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 10 }
        }
      }
    },
    animation: animate ? { duration: 600, easing: 'easeOutQuart' } : false
  };
  
  if (growthChartInstance) {
    growthChartInstance.data = chartData;
    growthChartInstance.options = options;
    growthChartInstance.update();
  } else {
    growthChartInstance = new Chart(ctx, {
      data: chartData,
      options: options
    });
  }
}

// Make functions globally accessible so HTML events can call them
window.switchChartType = switchChartType;
window.switchTimeframe = switchTimeframe;
window.submitWeightLog = submitWeightLog;
window.updateProgressChart = updateProgressChart;
window.saveDailySummary = saveDailySummary;
window.generateMockHistoryIfNeeded = generateMockHistoryIfNeeded;

