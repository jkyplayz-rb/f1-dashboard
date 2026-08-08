import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const formatLapTime = (seconds) => {
  if (seconds == null) return ''
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

function RaceDetail() {
  const { year, round } = useParams()
  const [race, setRace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://127.0.0.1:5000/api/race/${year}/${round}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load race data')
        return res.json()
      })
      .then((data) => {
        setRace(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [year, round])

  if (loading) return <p className="muted-text">Loading...</p>
  if (error) return <p className="error-text">Something went wrong: {error}</p>
  if (!race || !race.race_name) return <p className="muted-text">No data found for this race.</p>

  // Reshape lap_data (grouped by driver) into rows grouped by lap number, for a multi-line chart
  const buildChartData = () => {
    const lapMap = {}
    Object.entries(race.lap_data || {}).forEach(([driverNum, laps]) => {
      laps.forEach(({ lap, time }) => {
        if (!lapMap[lap]) lapMap[lap] = { lap }
        lapMap[lap][driverNum] = time
      })
    })
    return Object.values(lapMap).sort((a, b) => a.lap - b.lap)
  }

  const chartData = buildChartData()
  const driverNums = Object.keys(race.lap_data || {})
  const lineColors = ['#e10600', '#f0f0f0', '#a0a0a0', '#6b6b6b', '#3a3a3a']

  return (
    <div className="race-detail-page">
      <h2 className="race-title">{race.race_name}</h2>

      <div className="stat-card">
        <div className="stat-label">Fastest Lap</div>
        {race.fastest_lap ? (
          <>
            <div className="stat-value tabular">{race.fastest_lap.time}</div>
            <div className="stat-sub">
              {race.fastest_lap.name} — Lap {race.fastest_lap.lap}
            </div>
          </>
        ) : (
          <div className="stat-sub">No fastest lap data available.</div>
        )}
      </div>

      <h3 className="page-title">Race Results</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Driver</th>
            <th>Team</th>
          </tr>
        </thead>
        <tbody>
          {race.results.map((r) => (
            <tr key={r.driver_num}>
              <td className="tabular">{r.position}</td>
              <td>{r.name}</td>
              <td className="muted-text">{r.team}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="page-title">Lap Times — Top 5</h3>
      {chartData.length > 0 ? (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="lap" stroke="#6b6b6b" fontSize={12} />
              <YAxis
                stroke="#6b6b6b"
                fontSize={12}
                tickFormatter={formatLapTime}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid #262626' }}
                labelStyle={{ color: '#f0f0f0' }}
                formatter={(value) => formatLapTime(value)}
              />
              <Legend
                formatter={(value) => race.top5_names[value] || value}
              />
              {driverNums.map((num, i) => (
                <Line
                  key={num}
                  type="monotone"
                  dataKey={num}
                  name={num}
                  stroke={lineColors[i % lineColors.length]}
                  dot={false}
                  strokeWidth={1.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="muted-text">No lap time data available.</p>
      )}

      <h3 className="page-title">Pit Stops</h3>
      {race.pit_stops.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Team</th>
              <th>Lap</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {race.pit_stops.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td className="muted-text">{p.team}</td>
                <td className="tabular">{p.lap}</td>
                <td className="tabular">{p.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted-text">No pit stop data available.</p>
      )}
    </div>
  )
}

export default RaceDetail