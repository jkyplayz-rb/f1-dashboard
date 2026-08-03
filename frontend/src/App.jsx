import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import RaceDetail from './pages/RaceDetail.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="accent-bar"></span>
          <span className="app-title">F1 Dashboard</span>
        </div>
        <div className="live-status">
          <span className="live-dot"></span>
          <span>Loading status...</span>
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