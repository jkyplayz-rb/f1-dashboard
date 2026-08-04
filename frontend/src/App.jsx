import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import RaceDetail from './pages/RaceDetail.jsx'
import './App.css'

function App() {
  const [liveStatus, setLiveStatus] = useState(null)

  useEffect(() => {
    const fetchStatus = () => {
      fetch('http://127.0.0.1:5000/api/live-status')
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
          <span className="app-title">F1 Dashboard</span>
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
    </div>
  )
}

export default App