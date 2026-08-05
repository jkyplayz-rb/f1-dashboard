import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function RaceDetail() {
  const { year, round } = useParams()
  const [race, setRace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:5000/api/race/${year}/${round}`)
      .then((res) => res.json())
      .then((data) => {
        setRace(data)
        setLoading(false)
      })
  }, [year, round])

  if (loading) return <p className="muted-text">Loading...</p>
  if (!race || !race.race_name) return <p className="muted-text">No data found for this race.</p>

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