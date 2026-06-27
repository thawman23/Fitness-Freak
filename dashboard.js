// ===== AUTH CHECK =====
const loggedInUser = localStorage.getItem("user");
if (!loggedInUser) window.location.href = "login.html";

// ===== USER DATA =====
const U = {
  name: "Athlete",
  age: "24",
  weight: "70",
  gender: "male",
  goal: "gain",
  body: "fit",
  split: "ppl",
  budget: "medium",
  diet: "non-veg",
  cuisine: "clean",
  vibe: "default",
  mode: "intermediate"
};

// ===== GLOBAL FALLBACKS FOR STATIC TEMPLATE EVALUATION =====
let s = true;
let goalLabel = "Gain Muscle";
let observer;

// ===== DYNAMIC DIET GENERATOR =====
function generateDietPlan(goal, budget, diet, cuisine) {
  let meals = [];
  let title = "";
  
  const bLbl = { low: "Budget-Friendly", medium: "Balanced Standard", high: "Premium Organic" }[budget] || "Balanced";
  const dLbl = { veg: "Vegetarian", vegan: "Vegan", "non-veg": "Non-Vegetarian", keto: "Keto" }[diet] || "Non-Vegetarian";
  const cLbl = { indian: "Indian Style", sweet: "Sweet Balanced", clean: "Clean Fit" }[cuisine] || "Clean Fit";
  
  title = `🥗 AI Custom ${bLbl} ${dLbl} Diet (${cLbl})`;
  const isGain = goal === "gain";

  // BREAKFAST
  let breakfast = { name: "Breakfast", items: [], macros: "" };
  if (diet === "vegan") {
    if (budget === "low") {
      breakfast.items = ["Oats (80g) cooked in water", "Peanut butter (2 tbsp)", "1 Banana", "Roasted Chickpeas (chana) (30g)"];
      breakfast.macros = isGain ? "~550 kcal • 20g P • 80g C" : "~380 kcal • 15g P • 50g C";
    } else if (budget === "high") {
      breakfast.items = ["Organic Avocado Toast on Sourdough", "Vegan Protein Shake (Premium Pea/Rice protein)", "Chia Seed Pudding w/ almond milk & berries"];
      breakfast.macros = isGain ? "~700 kcal • 35g P • 75g C" : "~450 kcal • 28g P • 45g C";
    } else {
      breakfast.items = ["Oats (80g) w/ almond milk", "Vegan Protein powder (1 scoop)", "Banana + 1 tbsp Almond butter"];
      breakfast.macros = isGain ? "~620 kcal • 30g P • 75g C" : "~400 kcal • 25g P • 48g C";
    }
  } else if (diet === "veg") {
    if (budget === "low") {
      if (cuisine === "indian") {
        breakfast.items = ["Sattu Drink (60g roasted gram powder in water w/ lemon)", "2 Bananas", "Boiled Potato (100g) w/ pinch of salt"];
        breakfast.macros = isGain ? "~600 kcal • 22g P • 95g C" : "~400 kcal • 16g P • 65g C";
      } else {
        breakfast.items = ["Oats (80g) in whole milk", "Peanut butter (2 tbsp)", "1 Banana"];
        breakfast.macros = isGain ? "~650 kcal • 22g P • 85g C" : "~420 kcal • 15g P • 55g C";
      }
    } else if (budget === "high") {
      breakfast.items = ["Avocado Toast w/ organic honey", "Greek Yogurt (200g) w/ berries & hemp seeds", "Premium Whey Shake"];
      breakfast.macros = isGain ? "~750 kcal • 48g P • 65g C" : "~450 kcal • 38g P • 35g C";
    } else {
      breakfast.items = ["Oats (80g) w/ milk & honey", "Whey Protein (1 scoop)", "Banana"];
      breakfast.macros = isGain ? "~620 kcal • 38g P • 80g C" : "~410 kcal • 32g P • 45g C";
    }
  } else if (diet === "keto") {
    if (budget === "low") {
      breakfast.items = ["3 Eggs scrambled in butter", "Cheddar Cheese (30g)", "Spinach sautéed in coconut oil"];
      breakfast.macros = isGain ? "~550 kcal • 28g P • 4g C" : "~400 kcal • 24g P • 3g C";
    } else if (budget === "high") {
      breakfast.items = ["Organic Eggs (3) fried in ghee", "Avocado (1 whole)", "Premium Smoked Salmon (100g)"];
      breakfast.macros = isGain ? "~750 kcal • 42g P • 5g C" : "~500 kcal • 35g P • 4g C";
    } else {
      breakfast.items = ["3 Eggs fried in olive oil", "Bacon strips (3)", "Half Avocado"];
      breakfast.macros = isGain ? "~620 kcal • 32g P • 5g C" : "~450 kcal • 28g P • 3g C";
    }
  } else {
    if (budget === "low") {
      if (cuisine === "indian") {
        breakfast.items = ["Sattu High-Protein Shake (40g sattu + water)", "3 Boiled Eggs (2 whites, 1 whole)", "Banana"];
        breakfast.macros = isGain ? "~580 kcal • 32g P • 70g C" : "~380 kcal • 25g P • 40g C";
      } else {
        breakfast.items = ["3 Boiled Eggs", "Whole wheat bread (2 slices) w/ peanut butter", "Banana"];
        breakfast.macros = isGain ? "~600 kcal • 30g P • 60g C" : "~400 kcal • 24g P • 35g C";
      }
    } else if (budget === "high") {
      breakfast.items = ["Organic Avocado Toast (2 slices)", "3 Scrambled Eggs w/ spinach & mushrooms", "Organic Berries w/ honey", "Whey Shake"];
      breakfast.macros = isGain ? "~850 kcal • 55g P • 80g C" : "~480 kcal • 42g P • 35g C";
    } else {
      breakfast.items = ["Oats (80g) w/ milk", "Whey Protein (1 scoop)", "2 Scrambled Eggs"];
      breakfast.macros = isGain ? "~680 kcal • 45g P • 70g C" : "~430 kcal • 35g P • 40g C";
    }
  }

  // LUNCH
  let lunch = { name: "Lunch", items: [], macros: "" };
  if (diet === "vegan") {
    if (budget === "low") {
      if (cuisine === "indian") {
        lunch.items = ["Double Dal Tadka (yellow/black lentils)", "Brown Rice (150g cooked)", "Boiled Soy Chunks (50g dry wt) bhurji w/ spices"];
        lunch.macros = isGain ? "~720 kcal • 38g P • 110g C" : "~480 kcal • 28g P • 70g C";
      } else {
        lunch.items = ["Boiled Lentils & Chickpeas (150g)", "Rice or Pasta (100g)", "Steamed broccoli or seasonal greens"];
        lunch.macros = isGain ? "-650 kcal • 28g P • 95g C" : "~450 kcal • 22g P • 65g C";
      }
    } else if (budget === "high") {
      lunch.items = ["Premium Tempeh steak (150g)", "Quinoa bowl (150g) w/ cherry tomatoes", "Avocado & pumpkin seed salad"];
      lunch.macros = isGain ? "~800 kcal • 38g P • 75g C" : "~520 kcal • 28g P • 45g C";
    } else {
      lunch.items = ["Tofu Stir-fry (150g firm tofu)", "Brown Rice (150g)", "Mixed Veggies (peppers, mushrooms, broccoli)"];
      lunch.macros = isGain ? "~680 kcal • 26g P • 85g C" : "~450 kcal • 20g P • 55g C";
    }
  } else if (diet === "veg") {
    if (budget === "low") {
      if (cuisine === "indian") {
        lunch.items = ["Double Dal Tadka (yellow lentils)", "Roti / Chapati (3 medium)", "Curd / Dahi (150g)", "Soy Chunks dry sabzi"];
        lunch.macros = isGain ? "~750 kcal • 42g P • 105g C" : "~490 kcal • 30g P • 65g C";
      } else {
        lunch.items = ["Boiled Lentils (150g cooked)", "Chapati or Rice (100g)", "Cottage cheese (100g) or paneer cubes"];
        lunch.macros = isGain ? "~680 kcal • 28g P • 80g C" : "~450 kcal • 22g P • 50g C";
      }
    } else if (budget === "high") {
      lunch.items = ["Premium Organic Paneer (150g) in spinach gravy (Palak Paneer)", "Organic Quinoa or Basmati Rice", "Greek Salad w/ feta cheese & olives"];
      lunch.macros = isGain ? "~850 kcal • 42g P • 70g C" : "~550 kcal • 28g P • 40g C";
    } else {
      lunch.items = ["Paneer bhurji (120g paneer)", "Roti (3 medium) or Brown Rice", "Steamed Broccoli & carrots"];
      lunch.macros = isGain ? "~720 kcal • 32g P • 80g C" : "~480 kcal • 24g P • 50g C";
    }
  } else if (diet === "keto") {
    if (budget === "low") {
      lunch.items = ["Chicken Thighs (150g) fried in lard/butter", "Spinach & cabbage salad w/ full fat mayo"];
      lunch.macros = isGain ? "~650 kcal • 35g P • 6g C" : "~480 kcal • 30g P • 4g C";
    } else if (budget === "high") {
      lunch.items = ["Ribeye Steak or Premium Salmon (200g)", "Asparagus sautéed in garlic butter", "Avocado salad w/ olive oil dressing"];
      lunch.macros = isGain ? "~900 kcal • 48g P • 5g C" : "~600 kcal • 38g P • 4g C";
    } else {
      lunch.items = ["Chicken Breast (150g) w/ skin", "Broccoli & cauliflower stir-fry in olive oil", "Cheese slices (40g)"];
      lunch.macros = isGain ? "~700 kcal • 40g P • 6g C" : "~500 kcal • 34g P • 4g C";
    }
  } else {
    if (budget === "low") {
      if (cuisine === "indian") {
        lunch.items = ["Chicken Curry (150g chicken breast)", "Steamed Rice (150g)", "Dal (1 bowl)", "Cucumber salad"];
        lunch.macros = isGain ? "~780 kcal • 48g P • 90g C" : "~520 kcal • 38g P • 60g C";
      } else {
        lunch.items = ["Chicken Breast (150g cooked)", "Steamed White Rice (150g)", "Broccoli + 1 tsp olive oil"];
        lunch.macros = isGain ? "~650 kcal • 45g P • 75g C" : "~450 kcal • 38g P • 50g C";
      }
    } else if (budget === "high") {
      lunch.items = ["Grilled Salmon or Sea Bass (200g)", "Wild Quinoa w/ herbs", "Roasted Asparagus & brussels sprouts", "Extra virgin olive oil splash"];
      lunch.macros = isGain ? "~850 kcal • 50g P • 65g C" : "~550 kcal • 40g P • 40g C";
    } else {
      lunch.items = ["Chicken Breast (180g cooked)", "Basmati Rice (150g)", "Steamed Broccoli & Carrots"];
      lunch.macros = isGain ? "~720 kcal • 52g P • 75g C" : "~480 kcal • 42g P • 50g C";
    }
  }

  // SNACK
  let snack = { name: "Snack", items: [], macros: "" };
  if (diet === "vegan") {
    if (budget === "low") {
      snack.items = ["Roasted Chana (50g)", "Peanuts (a handful - 20g)"];
      snack.macros = isGain ? "~320 kcal • 16g P • 35g C" : "~220 kcal • 11g P • 22g C";
    } else if (budget === "high") {
      snack.items = ["Vegan Protein Bar (Premium Organic)", "Almond Butter (2 tbsp) w/ Apple slices", "Mixed Pumpkin & Sunflower seeds"];
      snack.macros = isGain ? "~500 kcal • 25g P • 40g C" : "~320 kcal • 18g P • 25g C";
    } else {
      snack.items = ["Vegan Protein shake w/ water", "Almonds (25g)", "1 Apple"];
      snack.macros = isGain ? "~380 kcal • 26g P • 30g C" : "~260 kcal • 22g P • 18g C";
    }
  } else if (diet === "veg" || diet === "non-veg") {
    if (budget === "low") {
      if (cuisine === "indian") {
        snack.items = ["Sprouted Moong Salad (1 cup w/ onions & tomatoes)", "Buttermilk (Chaas) (1 glass)"];
        snack.macros = isGain ? "~280 kcal • 14g P • 45g C" : "~180 kcal • 10g P • 25g C";
      } else {
        snack.items = ["Peanut Butter toast (1 slice)", "Glass of Whole Milk"];
        snack.macros = isGain ? "~350 kcal • 14g P • 40g C" : "~220 kcal • 10g P • 25g C";
      }
    } else if (budget === "high") {
      snack.items = ["Premium Whey Protein shake w/ almond milk", "Organic Almonds (30g)", "Gluten-free protein bar"];
      snack.macros = isGain ? "~550 kcal • 42g P • 35g C" : "~350 kcal • 32g P • 20g C";
    } else {
      snack.items = ["Whey Protein shake (1 scoop)", "Almonds (25g)", "Banana"];
      snack.macros = isGain ? "~420 kcal • 32g P • 45g C" : "~280 kcal • 28g P • 25g C";
    }
  } else if (diet === "keto") {
    if (budget === "low") {
      snack.items = ["2 Boiled Eggs", "Cheddar Cheese cube (25g)"];
      snack.macros = isGain ? "~280 kcal • 18g P • 2g C" : "~210 kcal • 15g P • 1g C";
    } else if (budget === "high") {
      snack.items = ["Premium Macadamia Nuts (40g)", "Greek Yogurt 10% Fat (150g)", "Celery sticks w/ Cream Cheese"];
      snack.macros = isGain ? "~500 kcal • 16g P • 7g C" : "~350 kcal • 12g P • 5g C";
    } else {
      snack.items = ["Walnuts or Almonds (30g)", "Cheese slices (40g)"];
      snack.macros = isGain ? "~380 kcal • 14g P • 4g C" : "~280 kcal • 10g P • 3g C";
    }
  }

  // DINNER
  let dinner = { name: "Dinner", items: [], macros: "" };
  if (diet === "vegan") {
    if (budget === "low") {
      if (cuisine === "indian") {
        dinner.items = ["Roti (3 medium) or Rice", "Dal / Rajma (kidney beans curry)", "Aloo Gobbi sabzi"];
        dinner.macros = isGain ? "~680 kcal • 22g P • 110g C" : "~450 kcal • 16g P • 70g C";
      } else {
        dinner.items = ["Boiled Lentil Pasta w/ marinara", "Tofu chunks (80g) mixed in", "Side green salad"];
        dinner.macros = isGain ? "~620 kcal • 25g P • 85g C" : "~420 kcal • 18g P • 55g C";
      }
    } else if (budget === "high") {
      dinner.items = ["Grilled Organic Tofu (200g)", "Sweet Potato mash (200g)", "Roasted Asparagus & zucchini", "Olive oil splash"];
      dinner.macros = isGain ? "~780 kcal • 30g P • 70g C" : "~500 kcal • 24g P • 45g C";
    } else {
      dinner.items = ["Tempeh stir-fry (120g)", "Sweet Potato (150g baked)", "Steamed Green Veggies"];
      dinner.macros = isGain ? "~650 kcal • 26g P • 75g C" : "~430 kcal • 20g P • 48g C";
    }
  } else if (diet === "veg") {
    if (budget === "low") {
      if (cuisine === "indian") {
        dinner.items = ["Paneer Bhurji (80g paneer)", "Chapati (3 medium)", "Mixed vegetable sabzi"];
        dinner.macros = isGain ? "~690 kcal • 25g P • 85g C" : "~460 kcal • 18g P • 55g C";
      } else {
        dinner.items = ["Paneer slices (80g) lightly grilled", "Sweet Potato (150g boiled)", "Green Salad w/ curd dressing"];
        dinner.macros = isGain ? "~620 kcal • 22g P • 60g C" : "~420 kcal • 16g P • 40g C";
      }
    } else if (budget === "high") {
      dinner.items = ["Grilled Paneer (180g) w/ premium herbs", "Roasted Sweet Potatoes w/ butter", "Broccoli & mushroom stir-fry", "Organic honey-mustard drizzle"];
      dinner.macros = isGain ? "~850 kcal • 36g P • 75g C" : "~550 kcal • 26g P • 45g C";
    } else {
      dinner.items = ["Paneer bhurji (150g)", "Sweet Potato (150g baked)", "Mixed Green Salad"];
      dinner.macros = isGain ? "~720 kcal • 30g P • 65g C" : "~480 kcal • 22g P • 40g C";
    }
  } else if (diet === "keto") {
    if (budget === "low") {
      dinner.items = ["Chicken Mince (150g) cooked in lard", "Cabbage & broccoli sautéed in butter"];
      dinner.macros = isGain ? "~680 kcal • 36g P • 6g C" : "~480 kcal • 30g P • 4g C";
    } else if (budget === "high") {
      dinner.items = ["Premium Ribeye Steak or Grilled Salmon (250g)", "Butter-steamed green beans", "Avocado mash w/ bacon bits"];
      dinner.macros = isGain ? "~950 kcal • 55g P • 5g C" : "~650 kcal • 45g P • 3g C";
    } else {
      dinner.items = ["Ground Beef 80/20 (200g)", "Cauliflower mash w/ butter", "Broccoli florets"];
      dinner.macros = isGain ? "~750 kcal • 44g P • 7g C" : "~520 kcal • 36g P • 4g C";
    }
  } else {
    if (budget === "low") {
      if (cuisine === "indian") {
        dinner.items = ["Egg Curry (3 Boiled Eggs in spice gravy)", "Roti / Chapati (3 medium)", "Mixed green salad"];
        dinner.macros = isGain ? "~680 kcal • 28g P • 80g C" : "~460 kcal • 22g P • 50g C";
      } else {
        dinner.items = ["Chicken breast mince (150g)", "White Pasta (100g) w/ red sauce", "Spinach side salad"];
        dinner.macros = isGain ? "~650 kcal • 38g P • 85g C" : "~450 kcal • 32g P • 55g C";
      }
    } else if (budget === "high") {
      dinner.items = ["Premium Tenderloin Beef or Lamb Chops (200g)", "Mashed Sweet Potatoes w/ butter", "Side Caesar salad w/ avocado & bacon"];
      dinner.macros = isGain ? "~900 kcal • 52g P • 60g C" : "~600 kcal • 42g P • 35g C";
    } else {
      dinner.items = ["Lean Ground Beef or Turkey (200g)", "Baked Sweet Potato (200g)", "Zucchini & Asparagus stir-fry"];
      dinner.macros = isGain ? "~780 kcal • 48g P • 70g C" : "~500 kcal • 40g P • 40g C";
    }
  }

  // PRE-BED
  let prebed = { name: "Before Bed", items: [], macros: "" };
  if (diet === "vegan") {
    if (budget === "low") {
      prebed.items = ["Warm water w/ 1 tbsp peanut butter dissolved", "Roasted Pumpkin Seeds (15g)"];
      prebed.macros = isGain ? "~220 kcal • 8g P • 10g C" : "~120 kcal • 5g P • 5g C";
    } else if (budget === "high") {
      prebed.items = ["Premium Vegan Casein/Slow Protein (1 scoop)", "Organic Almond butter (1 tbsp)", "Walnuts (15g)"];
      prebed.macros = isGain ? "~380 kcal • 28g P • 12g C" : "~220 kcal • 24g P • 5g C";
    } else {
      prebed.items = ["Peanut Butter (1.5 tbsp)", "Soy milk (1 cup)"];
      prebed.macros = isGain ? "~280 kcal • 12g P • 15g C" : "~180 kcal • 8g P • 8g C";
    }
  } else if (diet === "veg" || diet === "non-veg") {
    if (budget === "low") {
      if (cuisine === "indian") {
        prebed.items = ["Warm Milk w/ turmeric (1 glass)", "Roasted Chana (15g)"];
        prebed.macros = isGain ? "~240 kcal • 11g P • 25g C" : "~150 kcal • 8g P • 15g C";
      } else {
        prebed.items = ["Low-fat Cottage Cheese (100g)", "5 Almonds"];
        prebed.macros = isGain ? "~200 kcal • 15g P • 8g C" : "~120 kcal • 12g P • 4g C";
      }
    } else if (budget === "high") {
      prebed.items = ["Organic Casein Shake (1 scoop)", "Mixed organic nuts (30g)", "Organic Cottage Cheese (100g)"];
      prebed.macros = isGain ? "~450 kcal • 38g P • 10g C" : "~250 kcal • 30g P • 5g C";
    } else {
      prebed.items = ["Cottage cheese (150g) w/ cinnamon", "Almonds (10 nuts)"];
      prebed.macros = isGain ? "~280 kcal • 20g P • 8g C" : "~180 kcal • 16g P • 4g C";
    }
  } else if (diet === "keto") {
    if (budget === "low") {
      prebed.items = ["Cheese cube (25g)", "Butter broth (hot water + 10g butter)"];
      prebed.macros = isGain ? "~200 kcal • 6g P • 1g C" : "~120 kcal • 5g P • 0g C";
    } else if (budget === "high") {
      prebed.items = ["Premium Cashew/Almond butter (2 tbsp)", "Casein Shake w/ water", "5 Macadamia Nuts"];
      prebed.macros = isGain ? "~450 kcal • 28g P • 6g C" : "~280 kcal • 24g P • 3g C";
    } else {
      prebed.items = ["Greek Yogurt 10% (100g)", "Walnuts (15g)"];
      prebed.macros = isGain ? "~300 kcal • 10g P • 5g C" : "~200 kcal • 8g P • 3g C";
    }
  }

  // TOTALS
  let totals = { name: "Total Target", items: [], macros: "" };
  if (isGain) {
    if (budget === "low") {
      totals.items = ["Calories: ~2,800 - 3,000 kcal", "Protein: ~110g - 140g P", "Carbs: ~300g - 360g C", "Fats: ~80g - 100g F"];
      totals.macros = "Cost-effective muscle gains 💸";
    } else if (budget === "high") {
      totals.items = ["Calories: ~3,300 - 3,500 kcal", "Protein: ~190g - 230g P", "Carbs: ~300g - 350g C", "Fats: ~110g - 130g F"];
      totals.macros = "Premium organic surplus 💎";
    } else {
      totals.items = ["Calories: ~3,100 - 3,300 kcal", "Protein: ~160g - 190g P", "Carbs: ~300g - 330g C", "Fats: ~90g - 110g F"];
      totals.macros = "Standard surplus for growth ⚖️";
    }
  } else {
    if (budget === "low") {
      totals.items = ["Calories: ~1,400 - 1,600 kcal", "Protein: ~90g - 115g P", "Carbs: ~140g - 160g C", "Fats: ~45g - 55g F"];
      totals.macros = "Economical fat loss deficit 💸";
    } else if (budget === "high") {
      totals.items = ["Calories: ~1,600 - 1,800 kcal", "Protein: ~140g - 165g P", "Carbs: ~100g - 120g C", "Fats: ~60g - 70g F"];
      totals.macros = "Premium clean deficit 🔥";
    } else {
      totals.items = ["Calories: ~1,500 - 1,700 kcal", "Protein: ~120g - 145g P", "Carbs: ~120g - 140g C", "Fats: ~50g - 60g F"];
      totals.macros = "Balanced deficit for fat loss ⚖️";
    }
  }

  meals = [breakfast, lunch, snack, dinner, prebed, totals];
  
  return {
    t: title,
    m: meals
  };
}

// ===== RENDER WORKOUTS =====
function renderWorkoutPlansDynamic() {
  const goalLabel = U.goal === "gain" ? "Gain Muscle" : "Lose Weight";
  const s = U.goal === "gain";
  
  SPLITS.bro.title = `Bro Split — ${goalLabel}`;
  SPLITS.ppl.title = `Push Pull Legs — ${goalLabel}`;
  SPLITS.ul.title = `Upper Lower Split — ${goalLabel}`;

  const splitData = SPLITS[U.split] || SPLITS.ppl;
  document.getElementById("workout-title").textContent = splitData.title;

  const wc = document.getElementById("workout-container");
  wc.innerHTML = "";
  wc.style.gridTemplateColumns = "repeat(3, 1fr)";

  const completedKey = "thawman_completed_splits_today";
  const completedSplits = JSON.parse(localStorage.getItem(completedKey) || "[]");

  const isBeginner = U.mode === "beginner";
  const isExpert = U.mode === "expert";

  splitData.days.forEach((item, i) => {
    const isDone = completedSplits.includes(item.day);
    const el = document.createElement("div");
    const delayClass = `reveal-delay-${(i % 3) + 1}`;
    el.className = `workout-card reveal visible ${delayClass}`;
    
    const adjustedEx = item.ex.map(exStr => {
      const parts = exStr.split("—");
      const name = parts[0].trim();
      
      let repsStr = "";
      if (isBeginner) {
        repsStr = s ? "3×6-8" : "3×10-12";
      } else if (isExpert) {
        repsStr = s ? "5×5" : "5×12-15";
      } else {
        repsStr = s ? "4×6-8" : "4×12-15";
      }
      
      if (name.toLowerCase().includes("deadlift")) {
        repsStr = isBeginner ? (s ? "3×5" : "3×8-10") : (isExpert ? (s ? "5×3-4" : "4×8-10") : (s ? "4×5-6" : "3×10-12"));
      }
      if (name.toLowerCase().includes("overhead press")) {
        repsStr = isBeginner ? (s ? "3×6" : "3×10-12") : (isExpert ? (s ? "5×5" : "4×10-12") : (s ? "4×6-8" : "3×12-15"));
      }
      if (name.toLowerCase().includes("lateral raises")) {
        repsStr = isBeginner ? "3×10" : (isExpert ? "5×15-20" : (s ? "4×12" : "4×15-20"));
      }
      if (name.toLowerCase().includes("rear delt")) {
        repsStr = isBeginner ? "3×12" : (isExpert ? "4×15" : "3×15");
      }
      if (name.toLowerCase().includes("shrugs")) {
        repsStr = isBeginner ? "3×10" : (isExpert ? "5×10" : (s ? "4×10" : "3×15"));
      }
      if (name.toLowerCase().includes("face pull")) {
        repsStr = isBeginner ? "3×12" : (isExpert ? "4×15" : "3×15");
      }
      if (name.toLowerCase().includes("plank")) {
        repsStr = isBeginner ? "3×30s" : (isExpert ? "4×90s" : "3×60s");
      }
      if (name.toLowerCase().includes("crunches")) {
        repsStr = isBeginner ? "3×15" : (isExpert ? "4×25" : "3×20");
      }
      if (name.toLowerCase().includes("twists")) {
        repsStr = isBeginner ? "3×15/side" : (isExpert ? "4×25/side" : "3×20/side");
      }
      
      return `${name} — ${repsStr}`;
    });

    el.innerHTML = `
      <div class="card-day">${item.day}</div>
      <div class="card-focus">${item.focus}</div>
      <ul class="card-exercises">
        ${adjustedEx.map(e => `<li><span class="ex-dot"></span>${e}</li>`).join("")}
      </ul>
      <button class="card-complete-btn ${isDone ? 'completed' : ''}" id="btn-complete-${i}" onclick="completeSplitWorkout(${i})">
        <span>${isDone ? '✓ Completed & Logged' : '💪 Mark Completed'}</span>
      </button>`;
    wc.appendChild(el);
  });
  
  if (typeof observer !== "undefined" && observer.observe) {
    wc.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }
}

// ===== RENDER DIET =====
function renderDietPlansDynamic() {
  const dc = document.getElementById("diet-container");
  dc.innerHTML = "";
  dc.style.gridTemplateColumns = "repeat(3, 1fr)";

  const compiledDiet = generateDietPlan(U.goal, U.budget, U.diet, U.cuisine);
  document.getElementById("diet-title").textContent = compiledDiet.t;

  compiledDiet.m.forEach((item, i) => {
    const el = document.createElement("div");
    const delayClass = `reveal-delay-${(i % 3) + 1}`;
    el.className = `diet-card reveal visible ${delayClass}`;
    el.innerHTML = `
      <div class="meal-name">${item.meal || item.name}</div>
      <ul class="meal-items">
        ${item.items.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <div class="macro-bar">
        <div class="macro-label">Macros / Details</div>
        <div class="macro-val">${item.macros || item.mac}</div>
      </div>`;
    dc.appendChild(el);
  });

  if (typeof observer !== "undefined" && observer.observe) {
    dc.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }
}

// ===== DYNAMIC RENDER TRIGGER =====
window.updateDashboardDynamic = function() {
  const ud = JSON.parse(localStorage.getItem("userData") || "{}");
  U.name = ud.name || loggedInUser || "Athlete";
  U.age = ud.age || "24";
  U.weight = ud.weight || "70";
  U.targetWeight = ud.targetWeight || U.weight;
  U.gender = ud.gender || "male";
  U.goal = ud.goal || "gain";
  U.body = ud.body || "fit";
  U.split = ud.split || "ppl";
  
  // Custom chatbot parsed preference fallbacks
  U.budget = ud.budget || "medium";
  U.diet = ud.diet || "non-veg";
  U.cuisine = ud.cuisine || "clean";
  U.vibe = ud.vibe || "default";
  U.mode = ud.mode || "intermediate";

  // Highlight selected mode button
  const modeButtons = document.querySelectorAll(".nav-mode button");
  modeButtons.forEach(btn => {
    const btnText = btn.textContent.trim().toLowerCase();
    if (btnText === U.mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const goalLabel = U.goal === "gain" ? "Gain Muscle" : "Lose Weight";
  const bodyLabel = U.body === "muscular" ? "Muscular Fit" : "Lean Fit";
  const splitNames = { bro: "Bro Split", ppl: "Push / Pull / Legs", ul: "Upper / Lower" };
  const splitLabel = splitNames[U.split] || "Push / Pull / Legs";

  // Class theme changes on body
  document.body.className = "";
  document.body.classList.add("theme-" + U.vibe);

  // Populate dynamic profile panel values
  const budgetLabels = { low: "💸 Economical (Student)", medium: "⚖️ Balanced (Standard)", high: "💎 Premium (Organic)" };
  const dietLabels = { veg: "🥦 Vegetarian", vegan: "🌱 Vegan", "non-veg": "🍗 Non-Vegetarian", keto: "🥩 Keto Diet" };
  const cuisineLabels = { indian: "🌶️ Indian Spice", sweet: "🍨 Sweet Tooth", clean: "🥑 Clean & Simple" };
  const vibeLabels = { beast: "🔥 Beast Mode", zen: "🧘 Zen Recovery", clean: "🍃 Green Vitality", default: "⚡ Standard Vibe" };

  document.getElementById("p-budget").textContent = budgetLabels[U.budget] || budgetLabels.medium;
  document.getElementById("p-diet").textContent = dietLabels[U.diet] || dietLabels["non-veg"];
  document.getElementById("p-taste").textContent = cuisineLabels[U.cuisine] || cuisineLabels.clean;
  document.getElementById("p-vibe").textContent = vibeLabels[U.vibe] || vibeLabels.default;

  // Generic dashboard updates
  document.getElementById("nav-greeting").textContent = `Welcome, ${U.name}`;
  document.getElementById("hero-name").textContent = U.name;
  document.getElementById("hero-sub").textContent =
    `${splitLabel} program • ${bodyLabel} • ${goalLabel} — Let's crush it today.`;
  document.getElementById("stat-body").textContent = bodyLabel;
  document.getElementById("stat-goal").textContent = goalLabel;
  document.getElementById("stat-weight").textContent = `${U.weight} kg → ${U.targetWeight} kg`;
  document.getElementById("p-name").textContent = U.name;
  document.getElementById("p-age").textContent = U.age;
  document.getElementById("p-weight").textContent = `${U.weight} kg`;
  if (document.getElementById("p-target-weight")) {
    document.getElementById("p-target-weight").textContent = `${U.targetWeight} kg`;
  }
  document.getElementById("p-goal").textContent = goalLabel;
  document.getElementById("p-body").textContent = bodyLabel;

  renderWorkoutPlansDynamic();
  renderDietPlansDynamic();
};

window.setMode = function(mode) {
  const ud = JSON.parse(localStorage.getItem("userData") || "{}");
  ud.mode = mode;
  localStorage.setItem("userData", JSON.stringify(ud));
  window.updateDashboardDynamic();
};


// ===== FULL 6-DAY WORKOUT SPLITS =====
const SPLITS = {
  // ──── BRO SPLIT ────
  bro: {
    title: `Bro Split — ${goalLabel}`,
    days: [
      { day: "Monday", focus: "Chest", ex: [
        `Barbell Bench Press — ${s?"4×6-8":"4×12-15"}`,
        `Incline DB Press — ${s?"3×8-10":"3×12-15"}`,
        `Cable Crossover Flyes — ${s?"3×10-12":"3×15-18"}`,
        `Chest Dips — ${s?"3×8-10":"3×12-15"}`,
        `Pec Deck Machine — ${s?"3×10":"3×15"}`
      ]},
      { day: "Tuesday", focus: "Back", ex: [
        `Deadlift — ${s?"4×5-6":"3×10-12"}`,
        `Barbell Bent-Over Rows — ${s?"4×8":"3×12-15"}`,
        `Lat Pulldown — ${s?"3×8-10":"3×12-15"}`,
        `Seated Cable Row — ${s?"3×10":"3×15"}`,
        `Face Pulls — 3×15`
      ]},
      { day: "Wednesday", focus: "Shoulders", ex: [
        `Overhead Press — ${s?"4×6-8":"3×12-15"}`,
        `Lateral Raises — ${s?"4×12":"4×15-20"}`,
        `Rear Delt Flyes — 3×15`,
        `Arnold Press — ${s?"3×10":"3×12-15"}`,
        `Barbell Shrugs — ${s?"4×10":"3×15"}`
      ]},
      { day: "Thursday", focus: "Arms", ex: [
        `Barbell Curls — ${s?"4×8":"3×12-15"}`,
        `Skull Crushers — ${s?"4×8":"3×12-15"}`,
        `Hammer Curls — ${s?"3×10":"3×12"}`,
        `Tricep Rope Pushdowns — ${s?"3×10":"3×15"}`,
        `Concentration Curls — ${s?"3×10":"3×15"}`
      ]},
      { day: "Friday", focus: "Legs", ex: [
        `Barbell Back Squats — ${s?"4×6-8":"4×12-15"}`,
        `Romanian Deadlifts — ${s?"3×8-10":"3×12"}`,
        `Leg Press — ${s?"4×10":"3×15"}`,
        `Leg Curls — ${s?"3×10":"3×15"}`,
        `Standing Calf Raises — 4×15`
      ]},
      { day: "Saturday", focus: "Abs & Core", ex: [
        "Hanging Leg Raises — 4×15",
        "Cable Crunches — 3×20",
        "Russian Twists — 3×20/side",
        "Plank Hold — 3×60s",
        `Ab Wheel Rollouts — 3×12`
      ]}
    ]
  },

  // ──── PUSH / PULL / LEGS ────
  ppl: {
    title: `Push Pull Legs — ${goalLabel}`,
    days: [
      { day: "Monday", focus: "Push (Chest, Shoulders, Triceps)", ex: [
        `Barbell Bench Press — ${s?"4×6-8":"4×12-15"}`,
        `Overhead Press — ${s?"3×8":"3×12"}`,
        `Incline DB Press — ${s?"3×10":"3×12-15"}`,
        `Lateral Raises — ${s?"3×12":"4×15-20"}`,
        `Tricep Rope Pushdowns — ${s?"3×10":"3×15"}`
      ]},
      { day: "Tuesday", focus: "Pull (Back, Biceps, Rear Delts)", ex: [
        `Barbell Rows — ${s?"4×6-8":"3×12-15"}`,
        `Weighted Pull-ups — ${s?"3×8":"3×Max"}`,
        `Seated Cable Row — ${s?"3×10":"3×12-15"}`,
        `Face Pulls — 3×15`,
        `Barbell Curls — ${s?"3×10":"3×12-15"}`
      ]},
      { day: "Wednesday", focus: "Legs (Quads, Hams, Glutes, Calves)", ex: [
        `Barbell Squats — ${s?"4×6-8":"4×12-15"}`,
        `Romanian Deadlifts — ${s?"3×8-10":"3×12"}`,
        `Leg Press — ${s?"3×10":"3×15"}`,
        `Bulgarian Split Squats — ${s?"3×10/leg":"3×12/leg"}`,
        `Calf Raises — 4×15`
      ]},
      { day: "Thursday", focus: "Push (Hypertrophy)", ex: [
        `Incline Barbell Press — ${s?"4×8-10":"3×12-15"}`,
        `DB Shoulder Press — ${s?"3×10":"3×12-15"}`,
        `Cable Chest Flyes — ${s?"3×12":"3×15"}`,
        `Lateral Raises — ${s?"3×12":"4×15"}`,
        `Overhead Tricep Extension — ${s?"3×10":"3×15"}`
      ]},
      { day: "Friday", focus: "Pull (Hypertrophy)", ex: [
        `Lat Pulldown — ${s?"4×8-10":"3×12-15"}`,
        `Single-Arm DB Row — ${s?"3×10/arm":"3×12/arm"}`,
        `Cable Pullover — ${s?"3×12":"3×15"}`,
        `Rear Delt Flyes — 3×15`,
        `Hammer Curls — ${s?"3×10":"3×15"}`
      ]},
      { day: "Saturday", focus: "Legs (Hypertrophy)", ex: [
        `Front Squats — ${s?"4×8":"3×12"}`,
        `Leg Curls — ${s?"3×10":"3×15"}`,
        `Walking Lunges — 3×12/leg`,
        `Leg Extensions — ${s?"3×12":"3×15-20"}`,
        `Seated Calf Raises — 4×15`
      ]}
    ]
  },

  // ──── UPPER / LOWER ────
  ul: {
    title: `Upper Lower Split — ${goalLabel}`,
    days: [
      { day: "Monday", focus: "Upper Body (Strength)", ex: [
        `Barbell Bench Press — ${s?"4×6-8":"4×12"}`,
        `Barbell Rows — ${s?"4×6-8":"3×12"}`,
        `Overhead Press — ${s?"3×8":"3×12"}`,
        `Lat Pulldown — ${s?"3×10":"3×12-15"}`,
        `Barbell Curls + Skull Crushers — 3×10 superset`
      ]},
      { day: "Tuesday", focus: "Lower Body (Strength)", ex: [
        `Barbell Squats — ${s?"4×5-6":"4×12"}`,
        `Romanian Deadlifts — ${s?"3×8":"3×12"}`,
        `Leg Press — ${s?"4×8":"3×15"}`,
        `Leg Curls — ${s?"3×10":"3×15"}`,
        `Calf Raises — 4×15`
      ]},
      { day: "Wednesday", focus: "Rest / Active Recovery", ex: [
        "Light Walk or Yoga — 30 min",
        "Foam Rolling — 15 min",
        "Stretching & Mobility — 15 min",
        "Core Planks — 3×45s",
        "Meditation & Breathing — 10 min"
      ]},
      { day: "Thursday", focus: "Upper Body (Hypertrophy)", ex: [
        `Incline DB Press — ${s?"4×10":"3×12-15"}`,
        `Cable Rows — ${s?"3×10":"3×15"}`,
        `DB Shoulder Press — ${s?"3×10":"3×12-15"}`,
        `Cable Flyes + Face Pulls — 3×12 superset`,
        `Hammer Curls + Tricep Pushdowns — 3×12 superset`
      ]},
      { day: "Friday", focus: "Lower Body (Hypertrophy)", ex: [
        `Front Squats — ${s?"4×8-10":"3×12-15"}`,
        `Walking Lunges — 3×12/leg`,
        `Leg Extensions — ${s?"3×12":"3×15-20"}`,
        `Leg Curls — ${s?"3×12":"3×15"}`,
        `Seated Calf Raises — 4×15`
      ]},
      { day: "Saturday", focus: "Full Body Power", ex: [
        `Deadlift — ${s?"4×5":"3×10"}`,
        `Barbell Bench Press — ${s?"3×8":"3×12"}`,
        `Pull-ups — ${s?"3×Max":"3×Max"}`,
        `Squats — ${s?"3×8":"3×12"}`,
        "Plank + Leg Raises — 3×45s superset"
      ]}
    ]
  }
};

// ===== DIET DATABASE =====
const DT = {
  gain: {
    t: `Muscle Building Diet — Caloric Surplus`,
    m: [
      { meal: "Breakfast: Power Oats", items: ["100g Oats w/ whole milk", "2 scoops Whey Protein", "Banana + 2 tbsp Peanut Butter"], mac: "~850 kcal • 55g P • 95g C" },
      { meal: "Lunch: Muscle Rice Bowl", items: ["200g Grilled Chicken Breast", "150g Basmati Rice", "Steamed Broccoli + Olive Oil"], mac: "~750 kcal • 60g P • 70g C" },
      { meal: "Snack: Gainer Shake", items: ["2 scoops Whey + Milk", "1 tbsp Peanut Butter", "50g Oats blended"], mac: "~550 kcal • 40g P • 55g C" },
      { meal: "Dinner: Beef & Sweet Potato", items: ["200g Lean Ground Beef", "250g Baked Sweet Potato", "Avocado Green Salad"], mac: "~800 kcal • 50g P • 65g C" },
      { meal: "Pre-Bed: Casein & Nuts", items: ["1 scoop Casein Protein", "Handful of Mixed Nuts", "100g Cottage Cheese"], mac: "~400 kcal • 35g P • 15g C" },
      { meal: "Total Daily Target", items: ["Calories: ~3,350 kcal", "Protein: ~240g", "Carbs: ~300g • Fats: ~100g"], mac: "Surplus for muscle growth" }
    ]
  },
  lose: {
    t: `Fat Loss Diet — Caloric Deficit`,
    m: [
      { meal: "Breakfast: Berry Parfait", items: ["200g Greek Yogurt 0%", "1 scoop Whey mixed in", "50g Blueberries + Chia Seeds"], mac: "~320 kcal • 35g P • 20g C" },
      { meal: "Lunch: Chicken Stir-fry", items: ["150g Grilled Chicken Strips", "200g Cauliflower Rice", "Bell Peppers & Zucchini"], mac: "~400 kcal • 38g P • 15g C" },
      { meal: "Snack: Protein & Veggies", items: ["1 scoop Whey + Water", "Celery + Carrot Sticks", "2 tbsp Hummus"], mac: "~220 kcal • 28g P • 12g C" },
      { meal: "Dinner: White Fish & Greens", items: ["200g Cod or Tilapia", "Large Leafy Green Salad", "60g Avocado + Vinaigrette"], mac: "~380 kcal • 42g P • 10g C" },
      { meal: "Evening: Cottage Cheese", items: ["150g Low-fat Cottage Cheese", "Dash of Cinnamon", "5 Almonds"], mac: "~180 kcal • 22g P • 5g C" },
      { meal: "Total Daily Target", items: ["Calories: ~1,500 kcal", "Protein: ~165g", "Carbs: ~62g • Fats: ~55g"], mac: "Deficit for fat loss" }
    ]
  }
};

// ===== COMPLETED SPLITS STATE TRACKER =====
const completedKey = "thawman_completed_splits_today";
const todayStr = new Date().toDateString();
const completedDate = localStorage.getItem("thawman_completed_date");
if (completedDate !== todayStr) {
  localStorage.setItem("thawman_completed_date", todayStr);
  localStorage.removeItem(completedKey);
}

// ===== LOG SPLIT WORKOUT & CALORIES =====
function completeSplitWorkout(index) {
  const splitData = SPLITS[U.split] || SPLITS.ppl;
  const dayData = splitData.days[index];
  if (!dayData) return;

  const completed = JSON.parse(localStorage.getItem(completedKey) || "[]");
  if (completed.includes(dayData.day)) return;

  const isBeginner = U.mode === "beginner";
  const isExpert = U.mode === "expert";
  const s = U.goal === "gain";

  let totalCals = 0;
  const exLogs = dayData.ex.map(exStr => {
    const parts = exStr.split("—");
    const name = parts[0].trim();
    
    let repsStr = "";
    if (isBeginner) {
      repsStr = s ? "3×6-8" : "3×10-12";
    } else if (isExpert) {
      repsStr = s ? "5×5" : "5×12-15";
    } else {
      repsStr = s ? "4×6-8" : "4×12-15";
    }
    
    if (name.toLowerCase().includes("deadlift")) {
      repsStr = isBeginner ? (s ? "3×5" : "3×8-10") : (isExpert ? (s ? "5×3-4" : "4×8-10") : (s ? "4×5-6" : "3×10-12"));
    }
    if (name.toLowerCase().includes("overhead press")) {
      repsStr = isBeginner ? (s ? "3×6" : "3×10-12") : (isExpert ? (s ? "5×5" : "4×10-12") : (s ? "4×6-8" : "3×12-15"));
    }
    if (name.toLowerCase().includes("lateral raises")) {
      repsStr = isBeginner ? "3×10" : (isExpert ? "5×15-20" : (s ? "4×12" : "4×15-20"));
    }
    if (name.toLowerCase().includes("rear delt")) {
      repsStr = isBeginner ? "3×12" : (isExpert ? "4×15" : "3×15");
    }
    if (name.toLowerCase().includes("shrugs")) {
      repsStr = isBeginner ? "3×10" : (isExpert ? "5×10" : (s ? "4×10" : "3×15"));
    }
    if (name.toLowerCase().includes("face pull")) {
      repsStr = isBeginner ? "3×12" : (isExpert ? "4×15" : "3×15");
    }
    if (name.toLowerCase().includes("plank")) {
      repsStr = isBeginner ? "3×30s" : (isExpert ? "4×90s" : "3×60s");
    }
    if (name.toLowerCase().includes("crunches")) {
      repsStr = isBeginner ? "3×15" : (isExpert ? "4×25" : "3×20");
    }
    if (name.toLowerCase().includes("twists")) {
      repsStr = isBeginner ? "3×15/side" : (isExpert ? "4×25/side" : "3×20/side");
    }

    let sets = 3;
    let reps = 10;
    const nums = repsStr.match(/\d+/g);
    if (nums) {
      sets = parseInt(nums[0]) || 3;
      reps = parseInt(nums[1]) || 10;
    }
    
    let rate = 7; // default calories per rep index
    const burnPerSetLocal = {
      "bench": 8, "squat": 12, "deadlift": 14, "pull-up": 9,
      "press": 7, "row": 9, "curl": 5, "raise": 5, "extension": 6, "fly": 6,
      "pushdown": 6, "lunges": 10, "calf": 5, "plank": 4, "run": 10, "walk": 4
    };
    const lowerName = name.toLowerCase();
    for (const key in burnPerSetLocal) {
      if (lowerName.includes(key)) {
        rate = burnPerSetLocal[key];
        break;
      }
    }
    totalCals += sets * reps * rate * 0.15;
    
    return {
      name: name,
      sets: `${sets}/${sets}`,
      reps: reps,
      weight: 0
    };
  });

  totalCals = Math.round(totalCals);

  // Add to completed list
  completed.push(dayData.day);
  localStorage.setItem(completedKey, JSON.stringify(completed));

  // Save to workoutHistory
  const history = JSON.parse(localStorage.getItem("workoutHistory") || "[]");
  const session = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: "45m 00s",
    exercises: exLogs,
    totalSets: exLogs.length * 3,
    totalVolume: 0
  };
  history.unshift(session);
  localStorage.setItem("workoutHistory", JSON.stringify(history));

  // Update UI button
  const btn = document.getElementById(`btn-complete-${index}`);
  if (btn) {
    btn.classList.add("completed");
    btn.innerHTML = `<span>✓ Completed & Logged</span>`;
  }
  
  alert(`🎉 Awesome job completing your ${dayData.day} Workout!\n🔥 Estimated Calories Burned: ${totalCals} kcal!`);

// Show encouraging quote
const quoteDiv = document.createElement('div');
quoteDiv.className = 'quote';
quoteDiv.textContent = 'Not done yet';
quoteDiv.style.cssText = 'margin-top:1rem; color:#ffeb3b; font-weight:600; font-size:1.2rem; text-align:center;';
document.body.appendChild(quoteDiv);
setTimeout(() => quoteDiv.remove(), 5000);
  
  if (typeof updateGoals === 'function') {
    updateGoals();
  }
}


// ===== SCROLL REVEAL =====
observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ===== RUN STARTUP DYNAMIC RENDER =====
updateDashboardDynamic();

// ===== NAV SCROLL EFFECT =====
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 50);
});

// ===== PARTICLE SYSTEM =====
(function() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener("resize", resize);

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w; this.y = Math.random() * h;
      this.r = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      let speedFactor = 1.0;
      if (typeof U !== 'undefined' && U.vibe === 'beast') speedFactor = 2.2;
      else if (typeof U !== 'undefined' && U.vibe === 'zen') speedFactor = 0.45;
      
      this.x += this.vx * speedFactor; this.y += this.vy * speedFactor;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      let fillStyle = `rgba(167, 139, 250, ${this.alpha})`;
      if (typeof U !== 'undefined') {
        if (U.vibe === 'beast') fillStyle = `rgba(239, 68, 68, ${this.alpha})`;
        else if (U.vibe === 'zen') fillStyle = `rgba(6, 182, 212, ${this.alpha})`;
        else if (U.vibe === 'clean') fillStyle = `rgba(16, 185, 129, ${this.alpha})`;
      }
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = fillStyle; ctx.fill();
    }
  }
  for (let i = 0; i < 50; i++) particles.push(new P());

  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          let strokeStyle = `rgba(124,58,237,${0.06*(1-dist/120)})`;
          if (typeof U !== 'undefined') {
            if (U.vibe === 'beast') strokeStyle = `rgba(239,68,68,${0.08*(1-dist/120)})`;
            else if (U.vibe === 'zen') strokeStyle = `rgba(6,182,212,${0.06*(1-dist/120)})`;
            else if (U.vibe === 'clean') strokeStyle = `rgba(16,185,129,${0.06*(1-dist/120)})`;
          }
          ctx.strokeStyle = strokeStyle; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== ACTIONS =====
function logout() { localStorage.removeItem("user"); window.location.href = "login.html"; }
function resetProfile() { localStorage.removeItem("userData"); window.location.href = "onboarding.html"; }
function openAI() { window.location.href = "pose.html"; }
