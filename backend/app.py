from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
import requests
import time

app = Flask(__name__)
CORS(app)

OPENF1_BASE = "https://api.openf1.org/v1"

_cache = {}
CACHE_TTL = 300  # 5 minutes

def cached_get(url, timeout=15):
    now = time.time()
    if url in _cache:
        cached_time, cached_response = _cache[url]
        if now - cached_time < CACHE_TTL:
            return cached_response
    res = requests.get(url, timeout=timeout)
    if res.status_code == 200:
        _cache[url] = (now, res)
    return res

def get_lap_times(session_key, top5_drivers):
    lap_data = {}
    for driver_num in top5_drivers:
        res = cached_get(f"{OPENF1_BASE}/laps?session_key={session_key}&driver_number={driver_num}")
        if res.status_code == 200:
            laps = res.json()
            lap_data[driver_num] = [
                {
                    'lap': l.get('lap_number'),
                    'time': l.get('lap_duration')
                }
                for l in laps if l.get('lap_duration')
            ]
    return lap_data

def get_fastest_lap(session_key, driver_map):
    res = cached_get(f"{OPENF1_BASE}/laps?session_key={session_key}")
    if res.status_code != 200:
        return None
    laps = res.json()
    fastest = None
    for lap in laps:
        if not lap.get('lap_duration'):
            continue
        if fastest is None or lap['lap_duration'] < fastest['lap_duration']:
            fastest = lap
    if not fastest:
        return None
    drv_num = fastest['driver_number']
    d = driver_map.get(drv_num, {})
    return {
        'name': d.get('full_name', f"Driver #{drv_num}"),
        'team': d.get('team_name', 'Unknown'),
        'lap': fastest['lap_number'],
        'time': f"{int(fastest['lap_duration'] // 60)}:{fastest['lap_duration'] % 60:06.3f}",
    }

def get_pit_stops(session_key, driver_map):
    res = cached_get(f"{OPENF1_BASE}/pit?session_key={session_key}")
    if res.status_code != 200:
        return []
    pits = res.json()
    stops = []
    for p in pits:
        drv_num = p.get('driver_number')
        d = driver_map.get(drv_num, {})
        duration = p.get('pit_duration')
        stops.append({
            'name': d.get('full_name', f"Driver #{drv_num}"),
            'team': d.get('team_name', 'Unknown'),
            'lap': p.get('lap_number'),
            'duration': round(duration, 1) if duration else '—',
        })
    stops.sort(key=lambda x: x['lap'] if x['lap'] else 0)
    return stops

def get_race_results(year, round_num):
    sessions = cached_get(f"{OPENF1_BASE}/sessions?year={year}&session_name=Race")
    if sessions.status_code != 200:
        return None, [], {}, {}, None, []
    session_list = sessions.json()
    if not session_list or round_num > len(session_list):
        return None, [], {}, {}, None, []
    session = session_list[round_num - 1]
    session_key = session['session_key']
    race_name = session['session_name'] + " — " + session['location']

    positions = cached_get(f"{OPENF1_BASE}/position?session_key={session_key}")
    if positions.status_code != 200:
        return race_name, [], {}, {}, None, []
    pos_data = positions.json()

    final_positions = {}
    for entry in pos_data:
        drv = entry['driver_number']
        final_positions[drv] = entry['position']

    drivers = cached_get(f"{OPENF1_BASE}/drivers?session_key={session_key}")
    driver_map = {}
    if drivers.status_code == 200:
        for d in drivers.json():
            driver_map[d['driver_number']] = d

    results = []
    for drv_num, pos in sorted(final_positions.items(), key=lambda x: x[1]):
        d = driver_map.get(drv_num, {})
        results.append({
            'position': pos,
            'driver_num': drv_num,
            'name': d.get('full_name', f"Driver #{drv_num}"),
            'team': d.get('team_name', 'Unknown'),
        })

    top5 = [r['driver_num'] for r in results[:5]]
    lap_data = get_lap_times(session_key, top5)
    top5_names = {r['driver_num']: r['name'] for r in results[:5]}
    fastest_lap = get_fastest_lap(session_key, driver_map)
    pit_stops = get_pit_stops(session_key, driver_map)

    return race_name, results[:20], lap_data, top5_names, fastest_lap, pit_stops

def get_schedule(year):
    res = cached_get(f"{OPENF1_BASE}/sessions?year={year}&session_name=Race")
    if res.status_code != 200:
        return []
    return res.json()

def get_json(url):
    # Returns a list on success, [] when OpenF1 has no data (404),
    # and None when OpenF1 is unavailable (paywall during live weekends, errors, timeouts)
    try:
        res = cached_get(url)
    except requests.RequestException:
        return None
    if res.status_code == 404:
        return []
    if res.status_code != 200:
        return None
    try:
        return res.json()
    except ValueError:
        return None

def format_points(points):
    if points is not None and points == int(points):
        return int(points)
    return points

def get_standings(year):
    sessions = get_json(f"{OPENF1_BASE}/sessions?year={year}&session_name=Race")
    if sessions is None:
        return None, 'unavailable'

    now = datetime.now(timezone.utc)
    finished = [
        s for s in sessions
        if not s.get('is_cancelled') and datetime.fromisoformat(s['date_end']) < now
    ]
    if not finished:
        return None, 'no_races'

    # Standings for the newest race can take a while to be published, so also try the race before it
    session = None
    driver_rows = []
    team_rows = []
    for candidate in reversed(finished[-2:]):
        key = candidate['session_key']
        driver_rows = get_json(f"{OPENF1_BASE}/championship_drivers?session_key={key}")
        team_rows = get_json(f"{OPENF1_BASE}/championship_teams?session_key={key}")
        if driver_rows is None or team_rows is None:
            return None, 'unavailable'
        if driver_rows and team_rows:
            session = candidate
            break
    if session is None:
        return None, 'no_standings'

    session_key = session['session_key']
    drivers = get_json(f"{OPENF1_BASE}/drivers?session_key={session_key}")
    if drivers is None:
        return None, 'unavailable'
    driver_map = {}
    for d in drivers:
        driver_map[d['driver_number']] = d

    # Drivers who did not take part in this race are looked up in their most recent earlier session
    for row in driver_rows:
        drv_num = row['driver_number']
        if drv_num not in driver_map:
            history = get_json(f"{OPENF1_BASE}/drivers?driver_number={drv_num}&session_key<={session_key}")
            if history:
                driver_map[drv_num] = max(history, key=lambda d: d['session_key'])

    driver_standings = []
    for row in sorted(driver_rows, key=lambda r: r['position_current']):
        drv_num = row['driver_number']
        d = driver_map.get(drv_num, {})
        driver_standings.append({
            'position': row['position_current'],
            'driver_num': drv_num,
            'name': d.get('full_name', f"Driver #{drv_num}"),
            'team': d.get('team_name', 'Unknown'),
            'points': format_points(row['points_current']),
        })

    constructor_standings = []
    for row in sorted(team_rows, key=lambda r: r['position_current']):
        constructor_standings.append({
            'position': row['position_current'],
            'team': row['team_name'],
            'points': format_points(row['points_current']),
        })

    return {
        'year': year,
        'round': finished.index(session) + 1,
        'race_name': session['location'],
        'drivers': driver_standings,
        'constructors': constructor_standings,
    }, None

def get_live_status():
    res = requests.get(f"{OPENF1_BASE}/sessions?session_key=latest", timeout=15)
    if res.status_code != 200:
        return {'is_live': False}
    sessions = res.json()
    if not sessions:
        return {'is_live': False}
    session = sessions[0]
    now = datetime.now(timezone.utc)
    start = datetime.fromisoformat(session['date_start'])
    end = datetime.fromisoformat(session['date_end'])
    is_live = start <= now <= end
    return {
        'is_live': is_live,
        'session_name': session.get('session_name'),
        'location': session.get('location'),
        'country_name': session.get('country_name'),
        'date_start': session.get('date_start'),
        'date_end': session.get('date_end'),
    }

@app.route('/api/schedule')
def api_schedule():
    year = int(request.args.get('year', '2024'))
    schedule = get_schedule(year)
    return jsonify(schedule)

@app.route('/api/race/<int:year>/<int:round_num>')
def api_race(year, round_num):
    race_name, results, lap_data, top5_names, fastest_lap, pit_stops = get_race_results(year, round_num)
    return jsonify({
        'race_name': race_name,
        'results': results,
        'lap_data': lap_data,
        'top5_names': top5_names,
        'fastest_lap': fastest_lap,
        'pit_stops': pit_stops,
    })

@app.route('/api/standings/<int:year>')
def api_standings(year):
    current_year = datetime.now(timezone.utc).year
    if year < 2023 or year > current_year:
        return jsonify({'error': f"Standings are only available from 2023 to {current_year}."}), 400

    standings, error = get_standings(year)
    if error == 'unavailable':
        return jsonify({'error': 'Live data is temporarily unavailable during race weekends. Please try again later.'}), 503
    if error == 'no_races':
        return jsonify({'error': f"No races have been completed in {year} yet."}), 404
    if error == 'no_standings':
        return jsonify({'error': f"No standings data available for {year}."}), 404
    return jsonify(standings)

@app.route('/api/live-status')
def api_live_status():
    return jsonify(get_live_status())

@app.route('/', methods=['GET', 'POST'])
def index():
    year = int(request.form.get('year', '2024'))
    round_num = int(request.form.get('round', '1'))

    schedule = get_schedule(year)
    race_name, results, lap_data, top5_names, fastest_lap, pit_stops = get_race_results(year, round_num)

    return render_template('index.html',
        year=year,
        round_num=round_num,
        schedule=schedule,
        race_name=race_name,
        results=results,
        lap_data=lap_data,
        top5_names=top5_names,
        fastest_lap=fastest_lap,
        pit_stops=pit_stops,
    )

if __name__ == '__main__':
    app.run(debug=True)