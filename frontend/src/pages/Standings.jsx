import { useState, useEffect } from 'react'
import { getTeamColor } from '../teamColors'

function Standings() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [view, setView] = useState('drivers')
  const [result, setResult] = useState({ year: null, standings: null, error: null })

  // Each result remembers which year it belongs to, so a different year means a new one is still loading
  const loading = result.year !== year
  const { standings, error } = result

  useEffect(() => {
    // Ignore responses from an older request if the year changed before it finished
    let ignore = false
    fetch(`${import.meta.env.VITE_API_URL}/api/standings/${year}`)
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .catch(() => ({}))
            .then((body) => {
              throw new Error(body.error || 'Failed to load standings')
            })
        }
        return res.json()
      })
      .then((data) => {
        if (ignore) return
        setResult({ year, standings: data, error: null })
      })
      .catch((err) => {
        if (ignore) return
        setResult({ year, standings: null, error: err.message })
      })
    return () => {
      ignore = true
    }
  }, [year])

  const handleTabKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = view === 'drivers' ? 'constructors' : 'drivers'
    setView(next)
    document.getElementById(`${next}-tab`).focus()
  }

  const rows = standings ? standings[view] : []

  return (
    <div className="standings-page">
      <div className="schedule-header">
        <h2 className="page-title">{year} Standings</h2>
        <input
          type="number"
          className="year-input"
          aria-label="Season year"
          min={2023}
          max={new Date().getFullYear()}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      <div className="segmented-control" role="tablist" aria-label="Standings type">
        <button
          type="button"
          role="tab"
          id="drivers-tab"
          aria-selected={view === 'drivers'}
          aria-controls="standings-panel"
          tabIndex={view === 'drivers' ? 0 : -1}
          onClick={() => setView('drivers')}
          onKeyDown={handleTabKeyDown}
        >
          Drivers
        </button>
        <button
          type="button"
          role="tab"
          id="constructors-tab"
          aria-selected={view === 'constructors'}
          aria-controls="standings-panel"
          tabIndex={view === 'constructors' ? 0 : -1}
          onClick={() => setView('constructors')}
          onKeyDown={handleTabKeyDown}
        >
          Constructors
        </button>
      </div>

      <div id="standings-panel" role="tabpanel" aria-labelledby={`${view}-tab`}>
        {loading ? (
          <p className="muted-text"><span className="spinner"></span>Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : rows.length === 0 ? (
          <p className="muted-text">No standings found for {year}.</p>
        ) : (
          <>
            <p className="muted-text standings-subtitle">After {standings.race_name}</p>
            {view === 'drivers' ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Driver</th>
                    <th>Team</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.drivers.map((d) => (
                    <tr key={d.driver_num} style={{ borderLeft: `3px solid ${getTeamColor(d.team)}` }}>
                      <td className="tabular">{d.position}</td>
                      <td>{d.name}</td>
                      <td className="muted-text">{d.team}</td>
                      <td className="tabular">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.constructors.map((c) => (
                    <tr key={c.team} style={{ borderLeft: `3px solid ${getTeamColor(c.team)}` }}>
                      <td className="tabular">{c.position}</td>
                      <td>{c.team}</td>
                      <td className="tabular">{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Standings
