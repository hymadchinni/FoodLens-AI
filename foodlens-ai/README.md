# FoodLens AI — Local Node.js Server & Full-Stack Nutrition Platform

**FoodLens AI** is a full-stack React + Node.js (Express) nutrition application for scanning food photos, parsing text and voice meal descriptions, reading packaged food barcodes/labels, generating simple personalized diet plans, tracking daily calories/macros/water/weight, and asking about any food item in the world via the AI Food & Nutrition Encyclopedia.

---

## 1. Prerequisites (For Your Laptop)

Make sure you have the following installed on your laptop (Windows, macOS, or Linux):
* **Node.js**: v20+ or v22+ recommended ([Download Node.js](https://nodejs.org/))
* **npm**: Included automatically with Node.js
* **Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/apikey)

> **Zero Database Setup Required**: When running on your laptop without PostgreSQL configured, the Node.js server (`server.ts`) automatically creates and saves all your meals, scans, water logs, weight history, profile targets, diet plans, and chat messages to a local file at `./data/local-db.json`.

---

## 2. Step-by-Step Setup on Your Laptop

### Step 1: Open Project Folder in Terminal
Open your terminal (Command Prompt, PowerShell, or Terminal) inside the project folder and install all packages:

```bash
npm install
```

### Step 2: Create a `.env` File
Create a file named `.env` in the root folder (next to `package.json` and `server.ts`) and add your Gemini API key:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
PORT=3000
APP_URL="http://localhost:3000"
```

### Step 3: Start the Local Node.js Server

* **Option A — Development Mode (Recommended for Laptop Work)**:
  Runs the Express Node.js backend (`server.ts`) together with the Vite React frontend on port `3000`:
  ```bash
  npm run dev
  ```

* **Option B — Production Build & Node.js Server**:
  Compiles the frontend into `dist/` and starts the Node.js server:
  ```bash
  npm run build
  NODE_ENV=production npm start
  ```

### Step 4: Open in Your Browser
Open your browser and go to:
* **Application**: [http://localhost:3000](http://localhost:3000)
* **Server Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 3. Core Features

1. **Universal Photo Food Scanner (`/api/scan-image`)**:
   * Upload any food photo, drag-and-drop an image, or use your laptop's live webcam (**Open Camera** / **Turn Off Camera**).
   * Automatically compresses images on the client for fast recognition.
   * Detects all food items in the image with portion size adjustments (`S / M / L` or custom grams) and full breakdown of calories, protein, carbs, fat, fiber, sugar, sodium, vitamins (A, C, D, B12), and minerals (iron, calcium).
2. **Text, Voice & Barcode Scanner (`/api/scan-text` & `/api/scan-voice`)**:
   * Type or speak **any food item or meal in the world** (e.g., `"2 samosa and 1 cup green tea"`, `"150g grilled chicken"`, `"2 aloo paratha and curd"`).
   * Includes live browser speech recognition plus a direct microphone audio recorder fallback (`POST /api/scan-voice`).
3. **Universal AI Food Encyclopedia Chatbot (`/api/chat`)**:
   * Ask about any food item, fruit, vegetable, dish, snack, or beverage anywhere in the world and receive a clear, fast breakdown of what it contains, calories, macros, vitamins, and health benefits.
4. **Simplified Dashboard, Diet Plan & Progress Tracker**:
   * **Dashboard**: Clean daily calorie/macro progress bars, 1-click water glass tracker (`+1 Glass`), today's logged meals, and 2 simple next-food suggestions.
   * **Diet Plan**: Simple 4-meal daily menu (**Breakfast, Lunch, Evening Snack, Dinner**) with 1-click **+ Log** buttons.
   * **Progress**: Simple **Weight Goal Progress Meter** (`Start → Current → Goal`) and a **7-Day Daily Nutrition Scorecard**.

---

## 4. Project Folder Structure

```text
├── server.ts                          # Main Node.js + Express backend server (Port 3000)
├── package.json                       # Scripts & dependencies
├── .env.example                       # Sample environment variables for local setup
├── vite.config.ts                     # Vite bundler configuration
├── data/
│   └── local-db.json                  # Auto-created local disk database on your laptop
└── src/
    ├── App.tsx                        # Main workspace shell, sidebar navigation, dark mode, i18n
    ├── types.ts                       # TypeScript interfaces
    ├── components/
    │   ├── FoodScannerModule.tsx      # Photo, live camera, text/voice, and barcode scanner
    │   ├── DashboardModule.tsx        # Minimalist daily summary, water & meal logs
    │   ├── DietPlannerModule.tsx      # Simple 4-meal daily diet plan & 1-click logging
    │   ├── NutritionAssistantModule.tsx # Universal AI Food & Nutrition Encyclopedia chat
    │   ├── ProgressTrackingModule.tsx # Weight goal meter & 7-day nutrition scorecard
    │   └── ProfileGoalsModule.tsx     # Body metrics, BMR/TDEE calculator, allergies & goals
    ├── data/
    │   ├── indianAndUsdaFoods.ts      # Verified IFCT 2017 & USDA nutrition dataset + calculators
    │   └── foodKnowledgeEncyclopedia.ts # Offline food nutrition encyclopedia fallback
    ├── db/
    │   ├── index.ts                   # PostgreSQL connection pool (optional)
    │   ├── schema.ts                  # Drizzle ORM database schema
    │   └── repository.ts              # Dual-mode repository (PostgreSQL + Local JSON Disk Store)
    └── middleware/
        └── auth.ts                    # Firebase Auth & automatic Local Profile session middleware
```

---

## 5. Node.js Backend API Endpoints (`server.ts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Checks local Node.js server status, port, and AI configuration |
| `GET` | `/api/foods` | Returns verified food catalog |
| `GET` | `/api/bootstrap` | Loads user profile, daily targets, meal logs, diet plan, and history |
| `PUT` | `/api/profile` | Updates body metrics, allergies, goals, and BMR/TDEE targets |
| `POST` | `/api/scan-image` | Recognizes any uploaded/captured photo and calculates full nutrition |
| `POST` | `/api/scan-text` | Parses any typed or spoken meal description into nutrition items |
| `POST` | `/api/scan-voice` | Transcribes microphone audio recording and calculates meal nutrition |
| `POST` | `/api/scans/confirm` | Logs confirmed scan items into the daily meal diary |
| `DELETE` | `/api/meals/:id` | Deletes a logged meal item and recalculates daily totals |
| `POST` | `/api/water` | Updates daily water intake (ml) |
| `POST` | `/api/weight` | Logs a weight check-in and recalculates BMI |
| `POST` | `/api/diet-plan/generate` | Generates a new personalized 4-meal daily diet plan |
| `POST` | `/api/chat` | Answers nutrition questions about any food item in the world |
