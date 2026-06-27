const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize JSON database
function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file. Resetting to empty database...", err);
    return { users: {} };
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// REST APIs
// 1. User Registration
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = loadDatabase();
  const normalizedUser = username.trim().toLowerCase();

  if (db.users[normalizedUser]) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // Create new user profile with default blank records
  db.users[normalizedUser] = {
    password: password, // In a production app, we would hash this (e.g. bcrypt)
    userData: {},
    workoutHistory: [],
    foodLog_today: [],
    foodLog_date: "",
    streakData: {
      daysLogged: [],
      currentStreak: 0,
      lastActiveDate: ""
    }
  };

  saveDatabase(db);
  console.log(`[Auth] Registered new user: ${normalizedUser}`);
  res.json({ success: true, username: normalizedUser });
});

// 2. User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = loadDatabase();
  const normalizedUser = username.trim().toLowerCase();
  const user = db.users[normalizedUser];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  console.log(`[Auth] User logged in: ${normalizedUser}`);
  res.json({ success: true, username: normalizedUser });
});

// 3. Get / Pull Sync Data
app.get('/api/user/sync', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Username query parameter is required" });
  }

  const db = loadDatabase();
  const normalizedUser = username.trim().toLowerCase();
  const user = db.users[normalizedUser];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Return synchronizable data assets
  res.json({
    userData: user.userData || {},
    workoutHistory: user.workoutHistory || [],
    foodLog_today: user.foodLog_today || [],
    foodLog_date: user.foodLog_date || "",
    streakData: user.streakData || {}
  });
});

// 4. Post / Push Sync Data
app.post('/api/user/sync', (req, res) => {
  const { username, userData, workoutHistory, foodLog_today, foodLog_date, streakData } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const db = loadDatabase();
  const normalizedUser = username.trim().toLowerCase();
  const user = db.users[normalizedUser];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Sync data (client data overrides since client is the generator of workouts/nutrition/profile updates)
  if (userData) user.userData = userData;
  if (workoutHistory) user.workoutHistory = workoutHistory;
  if (foodLog_today) user.foodLog_today = foodLog_today;
  if (foodLog_date) user.foodLog_date = foodLog_date;
  if (streakData) user.streakData = streakData;

  saveDatabase(db);
  console.log(`[Sync] Synchronized data assets for user: ${normalizedUser}`);
  res.json({ success: true });
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname)));

// Catch-all to direct user back to dashboard or login
app.get('*', (req, res, next) => {
  // If request is for an API, ignore static fallback
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`⚡ Thawman AI Fitness Express Backend running!`);
  console.log(`🌐 Address: http://localhost:${PORT}`);
  console.log(`💾 JSON Database: ${DB_FILE}`);
  console.log(`===================================================`);
});
