# F1 Dashboard

A web dashboard built with Flask that displays real Formula 1 race data using the OpenF1 API.

## Features

- Race results for any round in any season (2023–2025)
- Full race schedule per season
- Clean F1-themed dark UI

## How to run

Clone the repo and install dependencies:

git clone https://github.com/jkyplayz-rb/f1-dashboard.git
cd f1-dashboard
pip3 install -r requirements.txt

Then start the server:

python3 app.py

Open your browser at http://127.0.0.1:5000

## Usage

1. Enter a season (2023, 2024, or 2025)
2. Enter a round number
3. Click Load Race to see results and schedule

## Data source

Powered by OpenF1 — https://openf1.org
Real-time and historical Formula 1 data.

## Tech stack

- Python + Flask (backend)
- HTML + CSS (frontend)
- OpenF1 API (data)