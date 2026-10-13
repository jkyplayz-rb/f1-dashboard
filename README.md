# F1 Dashboard

A full-stack Formula 1 dashboard with a Flask REST API backend and a React frontend, using real race data from the OpenF1 API.

**Live site:** https://f1-dashboard-7fuf.vercel.app

## Features

- Race results, fastest lap, and pit stop data for any round in any season (2023-present)
- Lap time chart for the top 5 finishers of each race
- Full race schedule per season, with search
- Driver and constructor championship standings per season
- Live session indicator - shows the current or most recent F1 session
- Dense, dark-themed UI

## Tech stack

- **Backend:** Python, Flask, Flask-CORS - deployed on Vercel
- **Frontend:** React (Vite), React Router, Recharts - deployed on Vercel
- **Data:** OpenF1 API - https://openf1.org

## Project structure

```
f1-dashboard/
├── backend/            Flask API
│   └── app.py
└── frontend/           React app
    └── src/
        ├── pages/      Home, Schedule, Race Detail, Standings, Not Found
        ├── App.jsx
        └── teamColors.js
```

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/schedule?year=<year>` | Full race schedule for a season |
| `GET /api/race/<year>/<round_num>` | Results, fastest lap, lap times, and pit stops for a race |
| `GET /api/standings/<year>` | Driver and constructor standings after the latest completed race |
| `GET /api/live-status` | Whether an F1 session is currently live |

Live API: https://f1-dashboard-tawny.vercel.app

## How to run locally

**Backend:**

```
cd backend
pip3 install -r requirements.txt
python3 app.py
```

Runs at `http://127.0.0.1:5000`

**Frontend:**

```
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`

Both need to be running at the same time for the app to work locally. Create a `.env` file in `frontend/` with `VITE_API_URL=http://127.0.0.1:5000` (see `.env.example`).

## Known limitations

- OpenF1 restricts free access during live race weekends, so schedule, race and standings data can be temporarily unavailable while a session is running. The app shows an error message instead of data until access returns.
- Responses are cached in memory for 5 minutes, so very recent changes can take a few minutes to appear.

## Status

Deployed and live. Schedule, race results, lap times, standings and live session status are complete. Planned: points progression chart, starting-lights countdown animation, and a dedicated upcoming races page.