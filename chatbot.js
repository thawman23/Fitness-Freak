// ===== THAWMAN AI — FITNESS COACH CHATBOT =====

// Read user profile from localStorage
const chatUser = JSON.parse(localStorage.getItem("userData") || "{}");
const cU = {
  name: chatUser.name || "Champ",
  goal: chatUser.goal || "gain",
  body: chatUser.body || "fit",
  split: chatUser.split || "ppl",
  weight: chatUser.weight || "70",
  age: chatUser.age || "24",
  gender: chatUser.gender || "male"
};

let chatOpen = false;
const panel = document.getElementById("chat-panel");
const messagesEl = document.getElementById("chat-messages");

// ===== TOGGLE =====
function toggleChat() {
  chatOpen = !chatOpen;
  if (chatOpen) {
    panel.classList.remove("chat-hidden");
    panel.classList.add("chat-open");
    document.getElementById("chat-icon").textContent = "✕";
    if (messagesEl.children.length === 0) greet();
    document.getElementById("chat-input").focus();
  } else {
    panel.classList.remove("chat-open");
    panel.classList.add("chat-hidden");
    document.getElementById("chat-icon").textContent = "🤖";
  }
}

// ===== GREET =====
function greet() {
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  addBot(`${timeGreet}, ${cU.name}! 👋 I'm Thawman AI Coach, your AI fitness coach. Ask me anything — workouts, nutrition, recovery, or just chat. I'm here for you! 💪`);
}

// ===== SEND =====
function sendMsg() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;
  addUser(text);
  input.value = "";
  showTyping();
  setTimeout(() => {
    hideTyping();
    Promise.resolve(getResponse(text))
      .then(reply => {
        if (reply) addBot(reply);
      })
      .catch(e => {
        console.error(e);
        addBot("Oops, something went wrong. Please try again.");
      });
  }, 600 + Math.random() * 800);
}

function sendChip(el) {
  const text = el.textContent;
  addUser(text);
  showTyping();
  setTimeout(() => {
    hideTyping();
    Promise.resolve(getResponse(text))
      .then(reply => {
        if (reply) addBot(reply);
      })
      .catch(e => {
        console.error(e);
        addBot("Oops, something went wrong. Please try again.");
      });
  }, 600 + Math.random() * 800);
}

// ===== MESSAGES =====
function addUser(text) {
  const div = document.createElement("div");
  div.className = "msg msg-user";
  div.textContent = text;
  messagesEl.appendChild(div);
  scrollChat();
}

function addBot(text) {
  const div = document.createElement("div");
  div.className = "msg msg-bot";
  div.innerHTML = text;
  messagesEl.appendChild(div);
  scrollChat();
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg msg-bot typing"; div.id = "typing-indicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(div);
  scrollChat();
}

function hideTyping() {
  const t = document.getElementById("typing-indicator");
  if (t) t.remove();
}

function scrollChat() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ===== RESPONSE ENGINE =====
async function getResponse(input) {
  // Allow user to set API key via a message starting with "key:"
  if (input.toLowerCase().startsWith('key:')) {
    const newKey = input.slice(4).trim();
    if (newKey) {
      localStorage.setItem('openai_key', newKey);
      addBot('✅ API key saved! You can now ask questions.');

      addBot('⚠️ Please provide a non‑empty key after "key:".');
    }
    return; // Stop further processing after handling the key
  }
  // Retrieve stored API key
  const storedKey = localStorage.getItem('openai_key');
  if (!storedKey) {
    addBot('⚠️ Please provide your OpenAI API key. Send a message starting with "key:" followed by the key. It will be stored locally for future use.');
    return;
  }
  
  // Load user preferences
  const chatUser = JSON.parse(localStorage.getItem("userData") || "{}");
  cU.name = chatUser.name || "Champ";
  cU.goal = chatUser.goal || "gain";
  cU.body = chatUser.body || "fit";
  cU.split = chatUser.split || "ppl";
  cU.weight = chatUser.weight || "65";
  cU.age = chatUser.age || "18";
  cU.gender = chatUser.gender || "male";
  cU.budget = chatUser.budget || "medium";
  cU.diet = chatUser.diet || "non-veg";
  cU.cuisine = chatUser.cuisine || "clean";
  cU.vibe = chatUser.vibe || "default";

  // Normalise input
  const q = input.toLowerCase();

  const goalWord = cU.goal === "gain" ? "muscle gain" : "fat loss";
  const splitWord = { bro: "Bro Split", ppl: "Push/Pull/Legs", ul: "Upper/Lower" }[cU.split];
  // Regex for vibe detection to prevent ReferenceError
  const vibeBeast = /beast mode|beast/i;
  const vibeZen = /zen mode|zen/i;
  const vibeClean = /clean mode|clean/i;
  const vibeDefault = /default mode|standard/i;

  // ----- DYNAMIC PREFERENCE EXTRACTION -----
  let preferenceUpdated = false;
  let updateMsg = "";

  // A. Budget detection
  const budgetRegexLow = /(budget|cheap|broke|economical|low cost|inexpensive|student budget|save money|save cash|low budget|tight budget)/i;
  const budgetRegexHigh = /(premium|organic|salmon|avocado|ribeye|expensive|rich|unlimited budget|high budget|luxury|high-end)/i;
  const budgetRegexMedium = /(medium budget|standard budget|normal budget|average budget|middle class)/i;

  if (budgetRegexLow.test(q)) {
    cU.budget = "low";
    preferenceUpdated = true;
    updateMsg += "💸 I've set your budget to <strong>Economical / Student</strong>. I'll make sure your diet uses cost-effective, high-yield food sources like eggs, oats, lentils, and bananas! ";
  } else if (budgetRegexHigh.test(q)) {
    cU.budget = "high";
    preferenceUpdated = true;
    updateMsg += "💎 I've set your budget to <strong>Premium / Organic</strong>. Your diet will include top-tier ingredients like wild salmon, avocado, steak, and organic berries! ";
  } else if (budgetRegexMedium.test(q)) {
    cU.budget = "medium";
    preferenceUpdated = true;
    updateMsg += "⚖️ I've set your budget to <strong>Standard / Balanced</strong>. I'll keep a mix of clean, staple groceries. ";
  }

  // B. Diet type detection
  const dietVeg = /\b(vegetarian|veg|no meat|herbivore)\b/i;
  const dietVegan = /\b(vegan|completely plant.based|no dairy)\b/i;
  const dietKeto = /\b(keto|ketogenic|low carb|high fat|no carbs)\b/i;
  const dietNonVeg = /\b(non.veg|chicken|beef|meat.eater|fish.eater|non-vegetarian)\b/i;

  if (dietVegan.test(q)) {
    cU.diet = "vegan";
    preferenceUpdated = true;
    updateMsg += "🌱 I've adjusted your diet to <strong>Vegan</strong>. All animal products have been replaced with high-protein plant-based alternatives like tofu, soy chunks, and vegan powders! ";
  } else if (dietVeg.test(q)) {
    cU.diet = "veg";
    preferenceUpdated = true;
    updateMsg += "🥦 I've changed your diet to <strong>Vegetarian</strong>. I'll source protein from paneer, lentils, curd, and dairy! ";
  } else if (dietKeto.test(q)) {
    cU.diet = "keto";
    preferenceUpdated = true;
    updateMsg += "🥩 I've set your diet to <strong>Keto (Low-Carb, High-Fat)</strong>. I'll optimize for eggs, meat, healthy oils, and greens, cutting out high-carb grains! ";
  } else if (dietNonVeg.test(q)) {
    cU.diet = "non-veg";
    preferenceUpdated = true;
    updateMsg += "🍗 I've set your diet to <strong>Non-Vegetarian</strong>. I'll include high-quality poultry, meat, and eggs to hit your targets easily! ";
  }

  // C. Cuisine / taste detection
  const tasteIndian = /\b(indian|roti|chapati|dal|paneer bhurji|chana|sattu|masala|spicy)\b/i;
  const tasteSweet = /\b(sweet|sugar|sweet tooth|dessert|honey|fruit)\b/i;
  const tasteClean = /\b(clean|bland|simple|boiled|steamed|western|minimal)\b/i;

  if (tasteIndian.test(q)) {
    cU.cuisine = "indian";
    preferenceUpdated = true;
    updateMsg += "🌶️ I've set your cuisine to <strong>Indian Spice</strong>. Roti, dal, sabzi, sattu, and home-cooked spices are locked in! ";
  } else if (tasteSweet.test(q)) {
    cU.cuisine = "sweet";
    preferenceUpdated = true;
    updateMsg += "🍨 I've noted your <strong>Sweet Tooth</strong>. I'll include oats, peanut butter, honey, and fresh fruits to satisfy your cravings while keeping macros on point! ";
  } else if (tasteClean.test(q)) {
    cU.cuisine = "clean";
    preferenceUpdated = true;
    updateMsg += "🥑 I've set your cuisine to <strong>Clean / Whole Foods</strong>. Simple, steamed, high-protein foods without heavy seasoning. ";
  }

  // D. Vibe / Theme detection
  // Check for deactivation of Beast mode first
  if (/deactivate.*beast|turn off beast|disable beast|beast mode off/i.test(q)) {
    cU.vibe = "default";
    preferenceUpdated = true;
    updateMsg += "⚡ <strong>Beast Mode deactivated.</strong> Reverted to Standard Theme.";
  } else if (vibeBeast.test(q)) {
    cU.vibe = "beast";
    preferenceUpdated = true;
    updateMsg += "🔥 <strong>BEAST MODE ACTIVATED!</strong> Let's turn up the heat! Watch the UI transform into volcanic energy. Go crush your training! ";
  } else if (vibeZen.test(q)) {
    cU.vibe = "zen";
    preferenceUpdated = true;
    updateMsg += "🧘 <strong>Zen Recovery Mode active.</strong> Slowing down the particles and calming the environment. Take rest seriously, champ! ";
  } else if (vibeClean.test(q)) {
    cU.vibe = "clean";
    preferenceUpdated = true;
    updateMsg += "🍃 <strong>Green Vitality Mode active.</strong> A fresh, clean aesthetic for a fresh mindset. Nourish your body! ";
  } else if (vibeDefault.test(q)) {
    cU.vibe = "default";
    preferenceUpdated = true;
    updateMsg += "⚡ <strong>Standard Theme restored.</strong> Resetting the cyberpunk look. ";
  }

  if (preferenceUpdated) {
    // Save to localStorage
    const currentUD = JSON.parse(localStorage.getItem("userData") || "{}");
    currentUD.budget = cU.budget;
    currentUD.diet = cU.diet;
    currentUD.cuisine = cU.cuisine;
    currentUD.vibe = cU.vibe;
    localStorage.setItem("userData", JSON.stringify(currentUD));

    // Dynamic re-render dashboard if update function exists
    if (typeof window.updateDashboardDynamic === "function") {
      window.updateDashboardDynamic();
    }

    return `✨ <strong>Preference updated!</strong><br><br>${updateMsg}<br><br>Check out your updated diet plan and theme on the page! What else can I do for you, champ?`;
  }

  // -- GREETINGS --
  if (/^(hi|hello|hey|sup|yo|what'?s up)/.test(q))
    return pick([
      `Hey ${cU.name}! 😄 What's on your mind today? Workouts, food, or just vibes?`,
      `Yo ${cU.name}! Ready to crush it? Ask me anything 💪`,
      `What's up, champ! I'm here whenever you need me 🔥`
    ]);

  // -- TODAY'S WORKOUT --
  if (/today'?s workout|what.*(train|workout|exercise).*today|what.*do today/.test(q)) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    return getTodayWorkout(today);
  }

  // -- PROTEIN --
  if (/protein|how much protein/.test(q)) {
    const grams = cU.goal === "gain" ? Math.round(cU.weight * 2) : Math.round(cU.weight * 1.8);
    let response = `Great question! For your ${goalWord} goal at ${cU.weight}kg, aim for about <strong>${grams}g protein per day</strong>. 🥩<br><br>Good sources: Chicken breast, eggs, greek yogurt, whey protein, lentils, and fish. Spread it across 4-5 meals for best absorption!`;
    if (/shake.*bed|bed.*shake|before bed/.test(q)) {
      response += `<br><br>✨ For a bedtime protein shake, try a whey isolate mixed with water or almond milk, plus a handful of nuts or a scoop of peanut butter for healthy fats. It provides ~25g protein, supports muscle recovery overnight, and is easy on digestion.`;
    }
    return response;
  }

  // -- CALORIES --
  if (/calorie|how many cal|how much.*eat|caloric/.test(q)) {
    const bmr = cU.gender === "male"
      ? Math.round(88.362 + (13.397 * cU.weight) + (4.799 * 170) - (5.677 * cU.age))
      : Math.round(447.593 + (9.247 * cU.weight) + (3.098 * 160) - (4.330 * cU.age));
    const tdee = Math.round(bmr * 1.55);
    const target = cU.goal === "gain" ? tdee + 400 : tdee - 500;
    return `Based on your stats (${cU.weight}kg, age ${cU.age}):<br><br>🔹 Estimated TDEE: ~${tdee} kcal<br>🔹 Your ${goalWord} target: <strong>~${target} kcal/day</strong><br><br>${cU.goal === "gain" ? "That's a +400 surplus for lean gains!" : "That's a -500 deficit for steady fat loss!"} 📊`;
  }

  // -- ATE SOMETHING / WHAT TO EAT NEXT --
  if (/(ate|eat|eating|had|sugar|egg|chicken|rice|banana|milk|protein)/.test(q) && /(what next|suggest|complement|recommend|add|complete|goal|easy)/.test(q)) {
    const food = (typeof getFoodTotals === 'function') ? getFoodTotals() : { cal: 0, protein: 0 };
    const calTargetVal = (typeof calTarget !== 'undefined') ? calTarget : 2500;
    const proTargetVal = (typeof proTarget !== 'undefined') ? proTarget : 150;
    const calRemain = calTargetVal - food.cal;
    const proRemain = proTargetVal - food.protein;

    if (calRemain <= 0 && proRemain <= 0) {
      return `🎉 You've already hit your calorie and protein goals for today! Superb discipline, ${cU.name}! Keep it up! 💪`;
    }

    let pairingText = "";
    if (q.includes("egg")) {
      pairingText = `Eggs are a fantastic protein source! To complete your daily goal, you should pair them with something like a <strong>glass of whole milk</strong> or <strong>Greek yogurt</strong>. They are super easy to get and provide solid extra protein and healthy calories.<br><br>`;
    } else if (q.includes("chicken")) {
      pairingText = `Chicken breast is pure protein! To add some healthy fats and calories to balance it out, try adding <strong>avocado</strong>, some <strong>almonds</strong>, or a <strong>paneer slice</strong>.<br><br>`;
    } else if (q.includes("rice") || q.includes("oats") || q.includes("banana")) {
      pairingText = `You've got clean carbs sorted! Now you need to boost your protein. A <strong>Whey Protein shake</strong>, some <strong>paneer</strong>, or a couple of <strong>boiled eggs</strong> would be the perfect complement.<br><br>`;
    }

    const easyOptions = [
      { name: "Glass of Milk 🥛", desc: "Easy to drink, brings 6g protein & 120 kcal." },
      { name: "Boiled Eggs 🥚", desc: "Super cheap, 2 eggs give 13g protein & 150 kcal." },
      { name: "Paneer (100g) 🧀", desc: "Rich in protein & healthy fats, 18g protein & 265 kcal." },
      { name: "Greek Yogurt 🍨", desc: "No prep needed, packed with 17g protein & 100 kcal." },
      { name: "Whey Protein Shake 🥤", desc: "Fastest way to get 25g pure protein & 130 kcal." }
    ];

    let listHTML = pairingText ? pairingText : `To complete your goals (needs ${Math.max(0, calRemain)} kcal and ${Math.max(0, proRemain)}g protein remaining), here are easy-to-get options:<br><br>`;

    easyOptions.slice(0, 3).forEach(opt => {
      listHTML += `🔹 <strong>${opt.name}</strong> — ${opt.desc}<br>`;
    });

    listHTML += `<br>Which one of these fits into your plan today, buddy?`;
    return listHTML;
  }

  // -- DIET / FOOD --
  if (/eat today|what.*eat|meal|diet|food|nutrition|breakfast|lunch|dinner/.test(q)) {
    if (cU.goal === "gain")
      return `Here's a solid day of eating for ${goalWord}, ${cU.name}:<br><br>🌅 <strong>Breakfast:</strong> Oats + whey + banana + PB<br>🍗 <strong>Lunch:</strong> 200g chicken + rice + broccoli<br>🥤 <strong>Snack:</strong> Protein shake + almonds<br>🥩 <strong>Dinner:</strong> Beef + sweet potato + salad<br>🌙 <strong>Before bed:</strong> Cottage cheese + nuts<br><br>Hit ~3,200-3,500 kcal! 💪`;
    else
      return `Here's a clean day of eating for ${goalWord}, ${cU.name}:<br><br>🌅 <strong>Breakfast:</strong> Greek yogurt + berries + chia<br>🥗 <strong>Lunch:</strong> Grilled chicken + cauliflower rice<br>🥤 <strong>Snack:</strong> Whey + celery + hummus<br>🐟 <strong>Dinner:</strong> White fish + big green salad<br>🌙 <strong>Evening:</strong> Cottage cheese<br><br>Stay around ~1,500 kcal with high protein! 🔥`;
  }

  // -- MOTIVATION --
  if (/motivat|inspire|lazy|don'?t feel|can'?t|tired|give up|quit/.test(q))
    return pick([
      `${cU.name}, listen — the person you'll be in 6 months is watching you right now. Don't let them down. Every rep counts! 🔥💪`,
      `"The only bad workout is the one that didn't happen." Get up, put your shoes on, and just START. The motivation will follow! 🚀`,
      `Bro, remember why you started. ${cU.goal === "gain" ? "You wanted to build a stronger version of yourself" : "You wanted to transform your body"}. That person is still inside you. Let's GO! 💥`,
      `Champions aren't made in the gym — they're made from the decisions they make when no one's watching. Today's that day, ${cU.name}. 🏆`
    ]);

  // -- SUPPLEMENTS --
  if (/supplement|creatine|whey|pre.?workout|bcaa/.test(q))
    return `Here are the supplements I'd recommend for ${goalWord}:<br><br>✅ <strong>Whey Protein</strong> — Essential. 1-2 scoops/day<br>✅ <strong>Creatine Monohydrate</strong> — 5g daily, proven & safe<br>✅ <strong>Multivitamin</strong> — Fill nutritional gaps<br>${cU.goal === "lose" ? "✅ <strong>Caffeine/Green Tea</strong> — Natural fat burner" : "✅ <strong>Mass Gainer</strong> — If you struggle to eat enough"}<br><br>Skip the fancy stuff — these basics work! 💊`;

  // -- REST / RECOVERY / SLEEP --
  if (/rest|recovery|sleep|sore|muscle.*pain|overtraining/.test(q))
    return `Recovery is WHERE the gains happen, ${cU.name}! 🛌<br><br>💤 <strong>Sleep:</strong> 7-9 hours. Non-negotiable.<br>🧊 <strong>Soreness:</strong> Light stretching, foam rolling, and stay hydrated<br>🚶 <strong>Active recovery:</strong> Walk, yoga, or light swimming on rest days<br>⏱️ <strong>Rest between sets:</strong> ${cU.body === "muscular" ? "2-3 min for strength" : "60-90 sec for lean muscle"}<br><br>Your muscles grow OUTSIDE the gym. Respect the rest! 🧘`;

  // -- WORKOUT SPLIT --
  if (/split|routine|schedule|program|what.*split/.test(q))
    return `You're on the <strong>${splitWord}</strong> — solid choice for ${goalWord}! 💪<br><br>${getSplitOverview()}<br><br>Sunday is your rest day. Use it wisely — stretch, foam roll, and eat well!`;

  // -- FORM / TECHNIQUE --
  if (/form|technique|how to.*(squat|bench|deadlift|press|curl|row)/.test(q)) {
    if (/squat/.test(q))
      return `🏋️ <strong>Squat Form Tips:</strong><br>• Feet shoulder-width, toes slightly out<br>• Chest up, core braced<br>• Break at hips first, then knees<br>• Go to parallel or below<br>• Drive through your WHOLE foot<br>• Knees track over toes — don't cave in!<br><br>Start light and master the pattern. 💯`;
    if (/bench/.test(q))
      return `🏋️ <strong>Bench Press Tips:</strong><br>• Grip slightly wider than shoulders<br>• Retract shoulder blades — squeeze them together<br>• Arch your upper back slightly<br>• Lower bar to mid-chest<br>• Drive feet into the floor<br>• Press up and slightly back<br><br>Control the weight — ego lifting = injuries! 💪`;
    if (/deadlift/.test(q))
      return `🏋️ <strong>Deadlift Tips:</strong><br>• Bar over mid-foot, feet hip-width<br>• Hinge at hips, grip just outside knees<br>• Flat back — neutral spine always<br>• Push the floor away with your legs<br>• Lock out hips at the top<br>• Don't yank — smooth pull!<br><br>The king of all exercises. Respect it! 👑`;
    return `Great that you're focusing on form! 🎯 Here are general tips:<br>• Always warm up with lighter sets<br>• Control the eccentric (lowering phase)<br>• Full range of motion > heavy weight<br>• Film yourself to check form<br>• When in doubt, lower the weight<br><br>Form first, weight second! 💯`;
  }

  // -- WATER --
  if (/water|hydrat|how much.*drink/.test(q))
    return `Stay hydrated, ${cU.name}! 💧<br><br>Aim for <strong>${Math.round(cU.weight * 0.035 * 10) / 10} liters per day</strong> (~${Math.round(cU.weight * 0.035)} L).<br><br>Tips:<br>• Drink 500ml first thing in the morning<br>• Sip during workouts (don't chug)<br>• Add a pinch of salt for electrolytes<br>• Carry a bottle everywhere!`;

  // -- WARM UP / STRETCH --
  if (/warm.?up|stretch|mobility|flexible/.test(q))
    return `Here's a solid warm-up routine:<br><br>1️⃣ 5 min light cardio (jumping jacks / jog)<br>2️⃣ Arm circles — 20 each direction<br>3️⃣ Hip circles — 10 each side<br>4️⃣ Leg swings — 10 each leg<br>5️⃣ 2 sets of 10 bodyweight squats<br>6️⃣ Band pull-aparts — 15 reps<br><br>Never skip the warm-up — cold muscles = injuries! 🔥`;

  // -- PROGRESS / PLATEAU --
  if (/plateau|stuck|not growing|no progress|stall/.test(q))
    return `Plateaus happen to everyone, ${cU.name}. Here's how to break through:<br><br>🔄 <strong>Change stimulus:</strong> Switch rep ranges or exercise order<br>📈 <strong>Progressive overload:</strong> Add 2.5kg or 1 extra rep each week<br>🍽️ <strong>Check your diet:</strong> ${cU.goal === "gain" ? "You might not be eating enough!" : "Make sure you're not cutting too aggressively"}<br>😴 <strong>Sleep more:</strong> Seriously, sleep = gains<br>🧠 <strong>Deload week:</strong> Drop weight 40% for a week, then come back stronger<br><br>Trust the process! 📊`;

  // -- ABOUT / WHO ARE YOU --
  if (/who are you|what are you|your name|about you/.test(q))
    return `I'm <strong>Thawman AI Coach</strong> 🧠 — your AI fitness coach built into Fitness Freak! I know your profile (${cU.name}, ${cU.weight}kg, ${goalWord}, ${splitWord}) and I'm here 24/7 to help with workouts, nutrition, recovery, motivation, and anything fitness-related. Think of me as your gym buddy who never skips leg day! 😂💪<br/><br/>తెలుగు: "నాను మీ Thawman AI Coach కోచ్, మీరు ఏమి సహాయం కావాలో చెప్పండి."<br/>हिन्दी: "मैं Thawman AI Coach आपका AI कोच हूँ, आप क्या मदद चाहते हैं?"`;

  // -- THANK YOU --
  if (/thank|thanks|thx|appreciate/.test(q))
    return pick([
      `Anytime, ${cU.name}! That's what I'm here for 😄💪`,
      `You got it, champ! Keep pushing! 🔥`,
      `Always here for you, bro! Let's keep grinding 💪🧠`
    ]);

  // -- FALLBACK --
  return pick([
    `Hmm, I'm not sure about that one, ${cU.name}. Try asking about workouts, diet, protein, supplements, form tips, or motivation! 😊`,
    `That's a great question! I'm best at fitness stuff — try asking about your workout, nutrition, recovery, or even just "motivate me"! 💪`,
    `I didn't quite catch that, but I'm always learning! Ask me about your diet plan, workout split, supplement advice, or form tips 🧠`
  ]);
}

// ===== HELPERS =====
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getTodayWorkout(today) {
  const splitData = {
    bro: { Monday: "Chest", Tuesday: "Back", Wednesday: "Shoulders", Thursday: "Arms", Friday: "Legs", Saturday: "Abs & Core" },
    ppl: { Monday: "Push", Tuesday: "Pull", Wednesday: "Legs", Thursday: "Push (Hypertrophy)", Friday: "Pull (Hypertrophy)", Saturday: "Legs (Hypertrophy)" },
    ul: { Monday: "Upper Body", Tuesday: "Lower Body", Wednesday: "Rest / Recovery", Thursday: "Upper (Hypertrophy)", Friday: "Lower (Hypertrophy)", Saturday: "Full Body" }
  };
  const schedule = splitData[cU.split] || splitData.ppl;

  if (today === "Sunday")
    return `It's <strong>Sunday</strong> — REST DAY! 🛌<br><br>Your body builds muscle during rest. Take it easy today:<br>• Light walk or yoga<br>• Foam rolling & stretching<br>• Eat well & hydrate<br>• Get a good night's sleep<br><br>You've earned it, ${cU.name}! Come back Monday ready to dominate 🔥`;

  const focus = schedule[today];
  if (!focus) return `Hmm, I couldn't find today's session. Check your workout cards below! 👇`;

  return `Today is <strong>${today}</strong> — it's <strong>${focus}</strong> day! 🔥<br><br>Head to your workout cards below for the full exercise list. Warm up properly, stay focused, and push yourself! Remember: ${cU.goal === "gain" ? "progressive overload is key 📈" : "keep rest periods short for maximum burn 🔥"}<br><br>Let's crush it, ${cU.name}! 💪`;
}

function getSplitOverview() {
  const overviews = {
    bro: "Mon: Chest • Tue: Back • Wed: Shoulders • Thu: Arms • Fri: Legs • Sat: Abs",
    ppl: "Mon: Push • Tue: Pull • Wed: Legs • Thu: Push • Fri: Pull • Sat: Legs",
    ul: "Mon: Upper • Tue: Lower • Wed: Rest • Thu: Upper • Fri: Lower • Sat: Full Body"
  };
  return overviews[cU.split] || overviews.ppl;
}
