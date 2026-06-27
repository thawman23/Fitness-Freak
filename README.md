# Fitness Tracker Backend – Setup & Demo

## Prerequisites
- **Node.js** (v18 or later) installed and available in PATH.
- **MongoDB** server running locally (default URI `mongodb://localhost:27017/fitness_db`).
- Internet connection to download npm packages.

## 1️⃣ Install dependencies
```bash
cd "C:/Users/baji3/OneDrive/Desktop/fitness-project"
npm install   # installs express, mongoose, bcryptjs, jsonwebtoken, joi, helmet, cors, express-rate-limit, dotenv, etc.
```
If `npm` is not recognized, ensure Node.js installation includes npm or use the Node installer from https://nodejs.org/.

## 2️⃣ Create an environment file
Create a `.env` file in the project root (already generated) with the following variables (edit as needed):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitness_db
JWT_SECRET=your_very_secret_key
CORS_ORIGIN=http://localhost:3000
```
Replace `your_very_secret_key` with a strong random string.

## 3️⃣ Start the server (development mode)
```bash
npm run dev   # uses nodemon to auto‑restart on code changes
```
You should see console output similar to:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3000
```
The server now exposes the full REST API under `/api/...`.

## 4️⃣ Open the demo UI
Open a Chrome (or any) browser and navigate to:
```
http://localhost:3000/demo
```
The page loads a simple UI that lets you:
- Register a test user (`test_user` / `Password123`).
- Log in to obtain a JWT.
- View / update the user profile.
- Create, list, update, delete **workouts**.
- Create, list, delete **goals**.
- Add weight logs and see BMI calculations.

All actions are performed via the live API, and the responses are shown in `<pre>` blocks.

## 5️⃣ API reference (quick)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Register new user (returns JWT) |
| POST   | `/api/auth/login`    | Login (returns JWT) |
| GET    | `/api/user/profile` | Get profile (auth required) |
| PUT    | `/api/user/profile` | Update profile |
| POST   | `/api/workouts`     | Create workout |
| GET    | `/api/workouts`     | List user workouts |
| GET    | `/api/workouts/:id` | Get single workout |
| PUT    | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| POST   | `/api/goals`        | Create goal |
| GET    | `/api/goals`        | List goals |
| …      | …                    | (CRUD for goals follows same pattern) |

## 6️⃣ Stopping the server
Press `Ctrl+C` in the terminal where the server is running.

---
**Tip:** For production, use `npm start` (no hot‑reload) and consider a process manager like **PM2**.
