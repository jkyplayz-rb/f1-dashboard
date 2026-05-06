from flask import Flask, render_template, request
import requests

app = Flask(__name__)

OPENF1_BASE = "https://api.openf1.org/v1"

def get_drivers(year):
    res = requests.get(f"{OPENF1_BASE}/drivers?session_key=latest", timeout=15)
    if res.status_code != 200:
        return []
    return res.json()

def get_race_results(year, round_num):
    sessions = requests.get(f"{OPENF1_BASE}/sessions?year={year}&session_type=Race", timeout=15)
    if sessions.status_code != 200:
        return None, []
    session_list = sessions.json()
    if not session_list or round_num > len(session_list):
        return None, []
    session = session_list[round_num - 1]
    session_key = session['session_key']
    race_name = session['session_name'] + " — " + session['location']

    positions = requests.get(f"{OPENF1_BASE}/position?session_key={session_key}", timeout=15)
    if positions.status_code != 200:
        return race_name, []
    pos_data = positions.json()

    final_positions = {}
    for entry in pos_data:
        drv = entry['driver_number']
        final_positions[drv] = entry['position']

    drivers = requests.get(f"{OPENF1_BASE}/drivers?session_key={session_key}", timeout=15)
    driver_map = {}
    if drivers.status_code == 200:
        for d in drivers.json():
            driver_map[d['driver_number']] = d

    results = []
    for drv_num, pos in sorted(final_positions.items(), key=lambda x: x[1]):
        d = driver_map.get(drv_num, {})
        results.append({
            'position': pos,
            'name': d.get('full_name', f"Driver #{drv_num}"),
            'team': d.get('team_name', 'Unknown'),
        })

    return race_name, results[:20]

def get_schedule(year):
    res = requests.get(f"{OPENF1_BASE}/sessions?year={year}&session_type=Race", timeout=15)
    if res.status_code != 200:
        return []
    return res.json()

def get_standings(year):
    return []

@app.route('/', methods=['GET', 'POST'])
def index():
    year = int(request.form.get('year', '2024'))
    round_num = int(request.form.get('round', '1'))

    schedule = get_schedule(year)
    race_name, results = get_race_results(year, round_num)
    standings = get_standings(year)

    return render_template('index.html',
        year=year,
        round_num=round_num,
        schedule=schedule,
        race_name=race_name,
        results=results,
        standings=standings
    )

if __name__ == '__main__':
    app.run(debug=True)