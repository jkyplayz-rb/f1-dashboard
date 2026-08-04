# F1 Dashboard

A full-stack Formula 1 dashboard with a Flask REST API backend and a React frontend, using real race data from the OpenF1 API.

## Features

- Race results, fastest lap, and pit stop data for any round in any season (2023-present)
- Full race schedule per season
- Live session indicator - shows the current or most recent F1 session in real time
- Dense, dark-themed UI

## Tech stack

- **Backend:** Python, Flask, Flask-CORS
- **Frontend:** React (Vite), React Router
- **Data:** OpenF1 API - https://openf1.org

## Project structure

```
f1-dashboard/
├── backend/        Flask API
│   └── app.py
└── frontend/        React app
    └── src/
        ├── pages/    Home, Schedule, Race Detail
        └── App.jsx
```

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/schedule?year=<year>` | Full race schedule for a season |
| `GET /api/race/<year>/<round_num>` | Results, fastest lap, and pit stops for a race |
| `GET /api/live-status` | Whether an F1 session is currently live |

## How to run

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

Both need to be running at the same time for the app to work locally.

## Status

Actively in development. Backend API and core data-fetching are complete; UI styling, additional pages, and deployment are in progress.
```