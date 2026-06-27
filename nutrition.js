// ===== FOOD DATABASE (per 100g) =====
const DB = {
  "chicken breast": { cal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85, vitA: 2, vitC: 0, vitB6: 30, vitB12: 5, vitD: 1, iron: 6, calcium: 1, potassium: 256, zinc: 7, magnesium: 7, serving: "100g cooked" },
  "rice": { cal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 8, vitB12: 0, vitD: 0, iron: 1, calcium: 1, potassium: 35, zinc: 3, magnesium: 3, serving: "100g cooked" },
  "egg": { cal: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124, cholesterol: 373, vitA: 16, vitC: 0, vitB6: 7, vitB12: 37, vitD: 21, iron: 10, calcium: 6, potassium: 126, zinc: 9, magnesium: 3, serving: "2 large eggs (~100g)" },
  "banana": { cal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1, cholesterol: 0, vitA: 1, vitC: 15, vitB6: 20, vitB12: 0, vitD: 0, iron: 2, calcium: 1, potassium: 358, zinc: 1, magnesium: 7, serving: "1 medium banana (~118g)" },
  "oats": { cal: 389, protein: 17, carbs: 66, fat: 7, fiber: 11, sugar: 1, sodium: 2, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 6, vitB12: 0, vitD: 0, iron: 26, calcium: 5, potassium: 429, zinc: 26, magnesium: 44, serving: "100g dry oats" },
  "paneer": { cal: 265, protein: 18, carbs: 1.2, fat: 21, fiber: 0, sugar: 0, sodium: 18, cholesterol: 70, vitA: 10, vitC: 0, vitB6: 2, vitB12: 15, vitD: 5, iron: 1, calcium: 48, potassium: 100, zinc: 5, magnesium: 3, serving: "100g" },
  "milk": { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5, sodium: 43, cholesterol: 14, vitA: 3, vitC: 0, vitB6: 2, vitB12: 18, vitD: 25, iron: 0, calcium: 13, potassium: 132, zinc: 3, magnesium: 3, serving: "100ml whole milk" },
  "whey protein": { cal: 400, protein: 80, carbs: 10, fat: 5, fiber: 0, sugar: 3, sodium: 200, cholesterol: 50, vitA: 0, vitC: 0, vitB6: 0, vitB12: 0, vitD: 0, iron: 5, calcium: 20, potassium: 300, zinc: 10, magnesium: 5, serving: "100g (approx 3 scoops)" },
  "salmon": { cal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59, cholesterol: 55, vitA: 2, vitC: 0, vitB6: 40, vitB12: 127, vitD: 66, iron: 3, calcium: 1, potassium: 363, zinc: 4, magnesium: 7, serving: "100g cooked" },
  "broccoli": { cal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0, vitA: 12, vitC: 149, vitB6: 9, vitB12: 0, vitD: 0, iron: 4, calcium: 5, potassium: 316, zinc: 3, magnesium: 5, serving: "100g" },
  "sweet potato": { cal: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55, cholesterol: 0, vitA: 384, vitC: 4, vitB6: 11, vitB12: 0, vitD: 0, iron: 4, calcium: 3, potassium: 337, zinc: 2, magnesium: 6, serving: "100g baked" },
  "peanut butter": { cal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 459, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 14, vitB12: 0, vitD: 0, iron: 11, calcium: 4, potassium: 649, zinc: 20, magnesium: 40, serving: "100g (~3.5 tbsp)" },
  "avocado": { cal: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7, cholesterol: 0, vitA: 3, vitC: 17, vitB6: 13, vitB12: 0, vitD: 0, iron: 3, calcium: 1, potassium: 485, zinc: 4, magnesium: 7, serving: "100g (~half avocado)" },
  "greek yogurt": { cal: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 36, cholesterol: 5, vitA: 0, vitC: 0, vitB6: 4, vitB12: 22, vitD: 0, iron: 1, calcium: 11, potassium: 141, zinc: 5, magnesium: 3, serving: "100g non-fat" },
  "almonds": { cal: 579, protein: 21, carbs: 22, fat: 50, fiber: 13, sugar: 4, sodium: 1, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 7, vitB12: 0, vitD: 0, iron: 21, calcium: 27, potassium: 733, zinc: 22, magnesium: 67, serving: "100g (~23 almonds per 28g)" },
  "tuna": { cal: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sugar: 0, sodium: 47, cholesterol: 49, vitA: 6, vitC: 0, vitB6: 15, vitB12: 156, vitD: 5, iron: 8, calcium: 1, potassium: 237, zinc: 5, magnesium: 9, serving: "100g canned in water" },
  "apple": { cal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1, cholesterol: 0, vitA: 1, vitC: 8, vitB6: 2, vitB12: 0, vitD: 0, iron: 1, calcium: 1, potassium: 107, zinc: 0, magnesium: 1, serving: "1 medium apple (~182g)" },
  "brown rice": { cal: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 1, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 7, vitB12: 0, vitD: 0, iron: 3, calcium: 1, potassium: 79, zinc: 4, magnesium: 11, serving: "100g cooked" },
  "cottage cheese": { cal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364, cholesterol: 17, vitA: 4, vitC: 0, vitB6: 2, vitB12: 7, vitD: 0, iron: 1, calcium: 8, potassium: 104, zinc: 3, magnesium: 2, serving: "100g" },
  "beef": { cal: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72, cholesterol: 90, vitA: 0, vitC: 0, vitB6: 18, vitB12: 104, vitD: 2, iron: 15, calcium: 2, potassium: 318, zinc: 44, magnesium: 5, serving: "100g ground (80/20)" },
  "spinach": { cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, cholesterol: 0, vitA: 188, vitC: 47, vitB6: 10, vitB12: 0, vitD: 0, iron: 15, calcium: 10, potassium: 558, zinc: 4, magnesium: 20, serving: "100g raw" },
  "lentils": { cal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8, sugar: 1.8, sodium: 2, cholesterol: 0, vitA: 0, vitC: 3, vitB6: 9, vitB12: 0, vitD: 0, iron: 19, calcium: 2, potassium: 369, zinc: 8, magnesium: 9, serving: "100g cooked" },
  "tofu": { cal: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 3, vitB12: 0, vitD: 0, iron: 30, calcium: 35, potassium: 121, zinc: 6, magnesium: 8, serving: "100g firm" },
  "pasta": { cal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 3, vitB12: 0, vitD: 0, iron: 6, calcium: 1, potassium: 44, zinc: 4, magnesium: 5, serving: "100g cooked" },
  "bread": { cal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 4, vitB12: 0, vitD: 0, iron: 19, calcium: 26, potassium: 100, zinc: 5, magnesium: 6, serving: "100g white bread" },
  "cheese": { cal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621, cholesterol: 105, vitA: 20, vitC: 0, vitB6: 4, vitB12: 28, vitD: 3, iron: 4, calcium: 72, potassium: 98, zinc: 21, magnesium: 7, serving: "100g cheddar" },
  "potato": { cal: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6, cholesterol: 0, vitA: 0, vitC: 33, vitB6: 15, vitB12: 0, vitD: 0, iron: 4, calcium: 1, potassium: 421, zinc: 2, magnesium: 6, serving: "100g boiled" },
  "mango": { cal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14, sodium: 1, cholesterol: 0, vitA: 36, vitC: 60, vitB6: 6, vitB12: 0, vitD: 0, iron: 1, calcium: 1, potassium: 168, zinc: 1, magnesium: 3, serving: "100g" },
  "dal": { cal: 104, protein: 7, carbs: 18, fat: 0.4, fiber: 5, sugar: 2, sodium: 2, cholesterol: 0, vitA: 0, vitC: 1, vitB6: 8, vitB12: 0, vitD: 0, iron: 15, calcium: 2, potassium: 300, zinc: 6, magnesium: 8, serving: "100g cooked" },
  "chapati": { cal: 240, protein: 7.5, carbs: 38, fat: 7, fiber: 3, sugar: 2, sodium: 300, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 5, vitB12: 0, vitD: 0, iron: 10, calcium: 3, potassium: 120, zinc: 5, magnesium: 8, serving: "100g (~2 medium)" },
  "fish": { cal: 120, protein: 22, carbs: 0, fat: 3, fiber: 0, sugar: 0, sodium: 75, cholesterol: 60, vitA: 2, vitC: 0, vitB6: 15, vitB12: 50, vitD: 10, iron: 5, calcium: 2, potassium: 300, zinc: 5, magnesium: 8, serving: "100g white fish" },
  "turkey": { cal: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 50, cholesterol: 75, vitA: 0, vitC: 0, vitB6: 25, vitB12: 10, vitD: 1, iron: 7, calcium: 1, potassium: 280, zinc: 13, magnesium: 7, serving: "100g breast" },
  "honey": { cal: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0, sugar: 82, sodium: 4, cholesterol: 0, vitA: 0, vitC: 1, vitB6: 1, vitB12: 0, vitD: 0, iron: 2, calcium: 1, potassium: 52, zinc: 1, magnesium: 1, serving: "100g (~5 tbsp)" },
  "protein bar": { cal: 350, protein: 20, carbs: 40, fat: 12, fiber: 5, sugar: 15, sodium: 250, cholesterol: 20, vitA: 5, vitC: 5, vitB6: 10, vitB12: 15, vitD: 10, iron: 10, calcium: 15, potassium: 200, zinc: 10, magnesium: 8, serving: "1 bar (~60g values per 100g)" },
  "roti": { cal: 240, protein: 7.5, carbs: 38, fat: 7, fiber: 3, sugar: 2, sodium: 300, cholesterol: 0, vitA: 0, vitC: 0, vitB6: 5, vitB12: 0, vitD: 0, iron: 10, calcium: 3, potassium: 120, zinc: 5, magnesium: 8, serving: "100g (~2 medium)" },
  "curd": { cal: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46, cholesterol: 13, vitA: 3, vitC: 1, vitB6: 2, vitB12: 14, vitD: 1, iron: 1, calcium: 12, potassium: 155, zinc: 4, magnesium: 3, serving: "100g" },
  "biryani": { cal: 175, protein: 7, carbs: 22, fat: 7, fiber: 1, sugar: 1, sodium: 350, cholesterol: 25, vitA: 3, vitC: 2, vitB6: 8, vitB12: 5, vitD: 0, iron: 5, calcium: 2, potassium: 120, zinc: 5, magnesium: 4, serving: "100g chicken biryani" }
};

// ===== FOOD LOG =====
let foodLog = JSON.parse(localStorage.getItem("foodLog_today") || "[]");
const today = new Date().toDateString();
if (localStorage.getItem("foodLog_date") !== today) {
  foodLog = []; localStorage.setItem("foodLog_date", today);
  localStorage.setItem("foodLog_today", "[]");
}

// ===== TABS =====
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-content'));
  document.getElementById('tab-' + tab).classList.add('active-tab');
  document.getElementById('content-' + tab).classList.add('active-content');
}

// ===== SEARCH =====
function searchFood() { lookup(document.getElementById('food-input').value); }
function searchFoodCam() { lookup(document.getElementById('cam-food-input').value); }
function searchFoodUpload() { lookup(document.getElementById('upload-food-input').value); }
function quickSearch(name) { document.getElementById('food-input').value = name; lookup(name); }

function lookup(query) {
  if (!query || !query.trim()) return;
  const q = query.trim().toLowerCase();
  // Find best match
  let food = DB[q];
  if (!food) {
    for (const key in DB) { if (key.includes(q) || q.includes(key)) { food = DB[key]; query = key; break; } }
  }
  if (!food) {
    alert("Food not found! Try: chicken breast, rice, egg, banana, oats, paneer, salmon, etc.");
    return;
  }
  showResults(query.trim(), food);
  addToLog(query.trim(), food);
}

// ===== SHOW RESULTS =====
function showResults(name, f) {
  const sec = document.getElementById('results-section');
  sec.style.display = 'block';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('result-name').textContent = name;
  document.getElementById('result-serving').textContent = f.serving;

  // Default quantity 100g (or equivalent)
  const qtyInput = document.createElement('div');
  qtyInput.innerHTML = `
    <div class="quantity-section" style="margin-top:12px; display:flex; gap:8px; align-items:center;">
      <input type="number" id="qty-input" min="0" value="100" style="width:80px; padding:4px;" />
      <select id="unit-select" style="padding:4px;">
        <option value="g">grams</option>
        <option value="oz">ounce</option>
      </select>
      <button class="update-btn" onclick="updateTotals()" style="padding:4px 8px; background:#4ade80; color:#fff; border:none; border-radius:4px;">Update</button>
    </div>`;
  const header = document.getElementById('result-name');
  header.parentNode.insertBefore(qtyInput, header.nextSibling);

  // Store current food data globally for updates
  // Store current food data globally for updates
  window.currentFood = f;
  window.currentFoodName = name;
  // Initial calculation for default 100g
  updateTotals();

  // Detail grid placeholder will be filled in updateTotals
}

function updateTotals() {
  const f = window.currentFood;
  if (!f) return;
  const qty = parseFloat(document.getElementById('qty-input').value) || 0;
  const unit = document.getElementById('unit-select').value;
  let factor = 1; // multiplier for base values (per 100g)
  if (unit === 'g') {
    factor = qty / 100;
  } else if (unit === 'oz') {
    factor = (qty * 28.35) / 100;
  }

  // Update rings
  animateRing('ring-cal-fill', 'ring-cal-val', f.cal * factor, 800, '');
  animateRing('ring-protein-fill', 'ring-protein-val', f.protein * factor, 80, 'g');
  animateRing('ring-carb-fill', 'ring-carb-val', f.carbs * factor, 100, 'g');
  animateRing('ring-fat-fill', 'ring-fat-val', f.fat * factor, 70, 'g');

  // Update detail grid
  const dg = document.getElementById('detail-grid');
  dg.innerHTML = '';
  const details = [
    ['Fiber', (f.fiber * factor).toFixed(1) + 'g'],
    ['Sugar', (f.sugar * factor).toFixed(1) + 'g'],
    ['Sodium', Math.round(f.sodium * factor) + 'mg'],
    ['Cholesterol', Math.round(f.cholesterol * factor) + 'mg'],
    ['Potassium', Math.round(f.potassium * factor) + 'mg'],
    ['Serving', `${qty} ${unit}`]
  ];
  details.forEach(([l, v]) => {
    dg.innerHTML += `<div class="detail-item"><span class="detail-label">${l}</span><span class="detail-value">${v}</span></div>`;
  });

  // Vitamins (scale values)
  const vg = document.getElementById('vitamins-grid');
  vg.innerHTML = '';
  const vits = [
    ['Vitamin A', f.vitA * factor], ['Vitamin C', f.vitC * factor], ['Vitamin B6', f.vitB6 * factor],
    ['Vitamin B12', f.vitB12 * factor], ['Vitamin D', f.vitD * factor], ['Iron', f.iron * factor],
    ['Calcium', f.calcium * factor], ['Zinc', f.zinc * factor], ['Magnesium', f.magnesium * factor]
  ];
  vits.forEach(([n, v]) => {
    const pct = Math.min(v, 100);
    vg.innerHTML += `<div class="vit-item">
      <div class="vit-name">${n}</div>
      <div class="vit-val">${v}% DV</div>
      <div class="vit-bar"><div class="vit-bar-fill" style="width:0%"></div></div>
    </div>`;
    setTimeout(() => {
      const bars = vg.querySelectorAll('.vit-bar-fill');
      bars[bars.length - 1].style.width = pct + '%';
    }, 100);
  });

  // Verdict (simple based on scaled calories)
  const vc = document.getElementById('verdict-card');
  let verdict = `<strong>🍎 ${window.currentFoodName}</strong> — `;
  if (f.protein * factor >= 20) verdict += "Excellent protein source! ";
  else if (f.protein * factor >= 10) verdict += "Good protein content. ";
  if (f.fat * factor > 30) verdict += "High in fat — use in moderation. ";
  if (f.fiber * factor >= 5) verdict += "Rich in fiber — great for digestion. ";
  if (f.cal * factor < 100) verdict += "Low calorie — eat freely! ";
  else if (f.cal * factor > 400) verdict += "Calorie-dense — track portions. ";
  vc.innerHTML = verdict;
}

const sec = document.getElementById('results-section');
sec.style.display = 'block';
sec.scrollIntoView({ behavior: 'smooth', block: 'start' });

document.getElementById('result-name').textContent = name;
document.getElementById('result-serving').textContent = f.serving;

// Animate rings
animateRing('ring-cal-fill', 'ring-cal-val', f.cal, 800, '');
animateRing('ring-protein-fill', 'ring-protein-val', f.protein, 80, 'g');
animateRing('ring-carb-fill', 'ring-carb-val', f.carbs, 100, 'g');
animateRing('ring-fat-fill', 'ring-fat-val', f.fat, 70, 'g');

// Detail grid
const dg = document.getElementById('detail-grid');
dg.innerHTML = '';
const details = [
  ['Fiber', f.fiber + 'g'], ['Sugar', f.sugar + 'g'], ['Sodium', f.sodium + 'mg'],
  ['Cholesterol', f.cholesterol + 'mg'], ['Potassium', f.potassium + 'mg'], ['Serving', f.serving]
];
details.forEach(([l, v]) => {
  dg.innerHTML += `<div class="detail-item"><span class="detail-label">${l}</span><span class="detail-value">${v}</span></div>`;
});

// Vitamins
const vg = document.getElementById('vitamins-grid');
vg.innerHTML = '';
const vits = [
  ['Vitamin A', f.vitA], ['Vitamin C', f.vitC], ['Vitamin B6', f.vitB6],
  ['Vitamin B12', f.vitB12], ['Vitamin D', f.vitD], ['Iron', f.iron],
  ['Calcium', f.calcium], ['Zinc', f.zinc], ['Magnesium', f.magnesium]
];
vits.forEach(([n, v]) => {
  const pct = Math.min(v, 100);
  vg.innerHTML += `<div class="vit-item">
      <div class="vit-name">${n}</div><div class="vit-val">${v}% DV</div>
      <div class="vit-bar"><div class="vit-bar-fill" style="width:0%"></div></div></div>`;
  // Animate bars after render
  setTimeout(() => {
    const bars = vg.querySelectorAll('.vit-bar-fill');
    bars[bars.length - 1].style.width = pct + '%';
  }, 100);
});

// Verdict
const vc = document.getElementById('verdict-card');
let verdict = `<strong>🍎 ${name}</strong> — `;
if (f.protein >= 20) verdict += "Excellent protein source! Great for muscle building. ";
else if (f.protein >= 10) verdict += "Good protein content. ";
if (f.fat > 30) verdict += "High in fat — use in moderation. ";
if (f.fiber >= 5) verdict += "Rich in fiber — great for digestion. ";
if (f.cal < 100) verdict += "Low calorie — eat freely! ";
else if (f.cal > 400) verdict += "Calorie-dense — track your portions carefully. ";
if (f.vitC > 30) verdict += "Packed with Vitamin C! ";
if (f.iron > 10) verdict += "Great iron source. ";
if (f.calcium > 20) verdict += "Strong calcium content for bones. ";
const ud = JSON.parse(localStorage.getItem("userData") || "{}");
if (ud.goal === "gain") verdict += "<br><br>💪 For your <strong>muscle gain</strong> goal, pair this with a protein source and complex carbs!";
else if (ud.goal === "lose") verdict += `<br><br>🔥 For your <strong>fat loss</strong> goal, ${f.cal > 300 ? "watch your portions with this one!" : "this is a solid choice — keep it up!"}`;
vc.innerHTML = verdict;


// ===== ANIMATE RING =====
function animateRing(fillId, valId, value, max, unit) {
  const circ = 2 * Math.PI * 52; // ~326.73
  const fill = document.getElementById(fillId);
  const valEl = document.getElementById(valId);
  const pct = Math.min(value / max, 1);
  fill.style.strokeDashoffset = circ; // reset
  setTimeout(() => { fill.style.strokeDashoffset = circ * (1 - pct); }, 50);
  // Count up
  let current = 0;
  const step = value / 30;
  const interval = setInterval(() => {
    current += step;
    if (current >= value) { current = value; clearInterval(interval); }
    valEl.textContent = Math.round(current) + unit;
  }, 30);
}

// ===== FOOD LOG =====
function addToLog(name, f) {
  // Determine selected quantity and unit (default 100g if not set)
  const qtyInput = document.getElementById('qty-input');
  const unitSelect = document.getElementById('unit-select');
  let qty = 100; // default 100g
  let unit = 'g';
  if (qtyInput && unitSelect) {
    qty = parseFloat(qtyInput.value) || 100;
    unit = unitSelect.value;
  }
  let factor = 1;
  if (unit === 'g') {
    factor = qty / 100;
  } else if (unit === 'oz') {
    factor = (qty * 28.35) / 100;
  }
  foodLog.push({
    name,
    cal: f.cal * factor,
    protein: f.protein * factor,
    carbs: f.carbs * factor,
    fat: f.fat * factor
  });
  localStorage.setItem('foodLog_today', JSON.stringify(foodLog));
  renderLog();
}


function setGoals() {
  let goals = JSON.parse(localStorage.getItem('dietGoals') || 'null');
  if (!goals) {
    const cal = parseInt(prompt('Enter your daily calorie target (kcal)', '2000')) || 0;
    const protein = parseInt(prompt('Enter your daily protein target (g)', '150')) || 0;
    const carbs = parseInt(prompt('Enter your daily carbs target (g)', '250')) || 0;
    const fat = parseInt(prompt('Enter your daily fat target (g)', '70')) || 0;
    goals = { cal, protein, carbs, fat };
    localStorage.setItem('dietGoals', JSON.stringify(goals));
  }
  return goals;
}

function renderRemaining() {
  const totals = foodLog.reduce((a, b) => ({
    cal: a.cal + b.cal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
  const goals = setGoals();
  if (!goals) return;
  const remain = {
    cal: Math.max(0, goals.cal - totals.cal),
    protein: Math.max(0, goals.protein - totals.protein),
    carbs: Math.max(0, goals.carbs - totals.carbs),
    fat: Math.max(0, goals.fat - totals.fat)
  };
  document.getElementById('remain-cal').textContent = remain.cal + ' kcal left';
  document.getElementById('remain-protein').textContent = remain.protein + 'g protein left';
  document.getElementById('remain-carbs').textContent = remain.carbs + 'g carbs left';
  document.getElementById('remain-fat').textContent = remain.fat + 'g fat left';
  document.getElementById('remaining-totals').style.display = 'block';
}

// Ensure goals are set on load
setGoals();
  const el = document.getElementById('food-log');
  el.innerHTML = '';
  foodLog.forEach(item => {
    el.innerHTML += `<div class="log-item">
      <span class="log-food">${item.name}</span>
      <span class="log-macros">${item.cal} kcal • ${item.protein}g P • ${item.carbs}g C • ${item.fat}g F</span>
    </div>`;
  });
  if (foodLog.length > 0) {
    const totals = foodLog.reduce((a, b) => ({
      cal: a.cal + b.cal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat
    }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
    document.getElementById('log-totals').style.display = 'block';
    document.getElementById('total-cal').textContent = totals.cal + ' kcal';
    document.getElementById('total-protein').textContent = totals.protein + 'g protein';
    document.getElementById('total-carbs').textContent = totals.carbs + 'g carbs';
    document.getElementById('total-fat').textContent = Math.round(totals.fat * 10) / 10 + 'g fat';
  renderRemaining();
  }

renderLog();

// ===== CAMERA =====
let camStream = null;
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      camStream = stream;
      const vid = document.getElementById('cam-video');
      vid.srcObject = stream;
      document.getElementById('cam-overlay').style.display = 'none';
      document.getElementById('btn-start-cam').style.display = 'none';
      document.getElementById('btn-capture').style.display = 'block';
    })
    .catch(() => alert("Camera access denied. Please allow camera permissions."));
}

function capturePhoto() {
  const vid = document.getElementById('cam-video');
  const canvas = document.getElementById('cam-canvas');
  canvas.width = vid.videoWidth; canvas.height = vid.videoHeight;
  canvas.getContext('2d').drawImage(vid, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  document.getElementById('captured-img').src = dataUrl;
  document.getElementById('cam-result').style.display = 'block';
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); }
  vid.style.display = 'none';
  document.getElementById('btn-capture').style.display = 'none';
  document.getElementById('cam-food-input').focus();
}

// ===== UPLOAD =====
function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    document.getElementById('uploaded-img').src = ev.target.result;
    document.getElementById('upload-result').style.display = 'block';
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('upload-food-input').focus();
  };
  reader.readAsDataURL(file);
}

// Drag & drop
const uz = document.getElementById('upload-zone');
uz.addEventListener('dragover', e => { e.preventDefault(); uz.style.borderColor = 'rgba(74,222,128,0.5)'; });
uz.addEventListener('dragleave', () => { uz.style.borderColor = 'rgba(255,255,255,0.1)'; });
uz.addEventListener('drop', e => {
  e.preventDefault(); uz.style.borderColor = 'rgba(255,255,255,0.1)';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    document.getElementById('file-input').files = e.dataTransfer.files;
    handleUpload({ target: { files: [file] } });
  }
});
