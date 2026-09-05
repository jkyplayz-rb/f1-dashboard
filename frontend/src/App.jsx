import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import RaceDetail from './pages/RaceDetail.jsx'
import './App.css'

function App() {
  const [liveStatus, setLiveStatus] = useState(null)

  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/live-status`)
        .then((res) => res.json())
        .then((data) => setLiveStatus(data))
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="accent-bar"></span>
          <Link to="/" className="app-title">F1 Dashboard</Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link to="/" aria-label="Go to home page">Home</Link>
            <Link to="/schedule" aria-label="Go to race schedule">Schedule</Link>
          </nav>
        </div>
        <div className="live-status">
          <span className={`live-dot ${liveStatus?.is_live ? 'is-live' : ''}`}></span>
          <span>
            {!liveStatus
              ? 'Loading status...'
              : liveStatus.is_live
              ? `Live: ${liveStatus.session_name} — ${liveStatus.location}`
              : `Next: ${liveStatus.session_name} — ${liveStatus.location}`}
          </span>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/race/:year/:round" element={<RaceDetail />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <a href="https://github.com/jkyplayz-rb/f1-dashboard" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </footer>
    </div>
  )
}

export default App