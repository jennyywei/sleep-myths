# DreamBlaster 🌙

An arcade-style sleep-science quiz game built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

Blast the correct answer cloud before time runs out. Build streaks, unlock score multipliers, and prove your sleep science knowledge.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Run Locally

**Requirements:** Node.js ≥ 18.17, npm ≥ 9

```bash
# 1. Install dependencies
npm install

# 2. Start development server (hot reload)
npm run dev

# 3. Production build (optional)
npm run build && npm start
```

---

## How to Deploy to Vercel

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Leave all settings at their defaults (Next.js is auto-detected).
4. Click **Deploy**.

No environment variables are required. Everything runs client-side.

---

## How to Edit Questions

Questions live in:

```
public/data/questions.csv
```

### CSV Schema

```csv
question,answer,explanation
How many hours of sleep do adults need?,7-9 hours,The NSF recommends 7-9 hours for adults.
```

| Column        | Required | Notes                                      |
|---------------|----------|--------------------------------------------|
| `question`    | ✅        | The question displayed at the top of screen |
| `answer`      | ✅        | The single correct answer text              |
| `explanation` | optional  | Shown on the Results review sheet           |

### Rules
- The file must have **at least 4 rows** (the game needs 3 distractors per question).
- At runtime the game loads the CSV via `fetch`, picks one question at random, and samples 3 other rows' answers as distractors.
- Duplicates are automatically deduplicated.
- After editing the CSV, simply save the file — no rebuild needed in dev mode.

---

## How the Demo Leaderboard Works

The leaderboard runs entirely client-side — no backend or database.

### Seed data

```
public/data/seedLeaderboard.json
```

This file contains 25 fictional high scores that are loaded on every visit to `/leaderboard`. They give the board a populated, realistic feel.

### Local scores

When a player saves their score on the Results page, it is written to `localStorage` under the key `dreamblaster_scores`.

### Merge logic

On `/leaderboard`:

1. `seedLeaderboard.json` is fetched.
2. Local scores are read from `localStorage`.
3. Both lists are merged, sorted by: **score DESC → accuracy DESC → date ASC**.
4. The top 50 entries are displayed.
5. The player's own entries are highlighted in violet with a **YOU** badge.

A **"Demo Mode Leaderboard"** notice (with tooltip) appears at the top to explain that seed scores are fictional.

---

## Gameplay Rules

| Mechanic          | Value                                       |
|-------------------|---------------------------------------------|
| Starting health   | 5 segments                                  |
| Starting time     | 60 seconds                                  |
| Correct answer    | +100 pts, +0.5 s                            |
| Wrong answer      | −50 pts, −1 s, lose 1 HP                   |
| 3-streak bonus    | +50 pts                                     |
| 5-streak bonus    | 2× score multiplier on all subsequent answers |
| Keyboard shortcut | Keys `1`–`4` map to clouds                  |
| Round 1 (0–20 s)  | Slow clouds                                 |
| Round 2 (20–40 s) | Moderate speed                              |
| Round 3 (40–60 s) | Fast clouds + wobble                        |

### Badges

| Accuracy  | Badge             |
|-----------|-------------------|
| < 50%     | 😴 Sleepy Intern   |
| 50–79%    | 🌙 Dream Apprentice |
| 80–94%    | 🔬 Sleep Scientist  |
| 95%+      | ✨ Lucid Master     |

---

## Project Structure

```
sleep-myths/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Landing page (/)
│   ├── play/
│   │   └── page.tsx        # Main game (/play)
│   ├── results/
│   │   └── page.tsx        # Results + review (/results)
│   └── leaderboard/
│       └── page.tsx        # Leaderboard (/leaderboard)
├── components/
│   ├── StarField.tsx        # Canvas parallax starfield
│   ├── TimerBar.tsx         # Animated countdown bar
│   ├── HealthBar.tsx        # HP segments
│   ├── StreakMeter.tsx      # Streak + multiplier indicator
│   ├── Countdown.tsx        # 3-2-1-GO! overlay
│   ├── ScorePop.tsx         # Floating +/- score popups
│   └── FlashOverlay.tsx     # Green/red screen flash feedback
├── hooks/
│   └── useGame.ts           # Reducer-based game state machine
├── lib/
│   ├── types.ts             # All shared TypeScript types
│   ├── gameReducer.ts       # Pure reducer + localStorage helpers
│   ├── questions.ts         # CSV loader + question builder
│   └── leaderboard.ts       # Seed + local score merge logic
├── public/
│   └── data/
│       ├── questions.csv         # ← Edit this to change questions
│       └── seedLeaderboard.json  # ← Edit this to change seed scores
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Environment Variables

**None required.** The project has no backend, database, or API routes.

---

## Tech Stack

| Layer       | Choice                        |
|-------------|-------------------------------|
| Framework   | Next.js 15 (App Router)       |
| Language    | TypeScript (strict, no `any`) |
| Styling     | Tailwind CSS 3                |
| Animation   | Framer Motion 11              |
| CSV Parsing | PapaParse 5                   |
| State       | React useReducer (no Redux)   |
| Persistence | localStorage only             |
| Hosting     | Vercel (zero config)          |
