import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [liveStatus, setLiveStatus] = useState(null)
  const [error, setError] = useState(null)
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/live-status`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load live status')
        return res.json()
      })
      .then((data) => setLiveStatus(data))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    const year = new Date().getFullYear()
    fetch(`${import.meta.env.VITE_API_URL}/api/schedule?year=${year}`)
      .then((res) => res.json())
      .then((races) => {
        const now = new Date()
        const next = races
          .filter((r) => new Date(r.date_start) > now)
          .slice(0, 4)
        setUpcoming(next)
      })
      .catch(() => setUpcoming([]))
  }, [])

  return (
    <div className="home-page">
      <div className="stat-card home-status-card">
        <div className="stat-label">
          {liveStatus?.is_live ? 'Live now' : 'Most recent session'}
        </div>
        {error ? (
          <div className="error-text">Something went wrong: {error}</div>
        ) : liveStatus ? (
          <>
            <div className="stat-value">{liveStatus.session_name}</div>
            <div className="stat-sub">
              {liveStatus.location}, {liveStatus.country_name}
            </div>
          </>
        ) : (
          <div className="stat-sub"><span className="spinner"></span>Loading...</div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming-races">
          <div className="page-title">Upcoming Races</div>
          <ul className="upcoming-list">
            {upcoming.map((race) => (
              <li key={race.session_key} className="upcoming-item">
                <span>{race.location}</span>
                <span className="muted-text tabular">
                  {new Date(race.date_start).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link to="/schedule" className="home-link">
        View full race schedule →
      </Link>
    </div>
  )
}

export default Home