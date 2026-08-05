import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [liveStatus, setLiveStatus] = useState(null)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/live-status')
      .then((res) => res.json())
      .then((data) => setLiveStatus(data))
  }, [])

  return (
    <div className="home-page">
      <div className="stat-card home-status-card">
        <div className="stat-label">
          {liveStatus?.is_live ? 'Live now' : 'Most recent session'}
        </div>
        {liveStatus ? (
          <>
            <div className="stat-value">{liveStatus.session_name}</div>
            <div className="stat-sub">
              {liveStatus.location}, {liveStatus.country_name}
            </div>
          </>
        ) : (
          <div className="stat-sub">Loading...</div>
        )}
      </div>

      <Link to="/schedule" className="home-link">
        View full race schedule →
      </Link>
    </div>
  )
}

export default Home