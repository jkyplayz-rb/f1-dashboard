import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [liveStatus, setLiveStatus] = useState(null)
  const [error, setError] = useState(null)
  const [races, setRaces] = useState([])
  const [lastRaceStats, setLastRaceStats] = useState(null)
  const [now, setNow] = useState(new Date())

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
      .then((data) => setRaces(Array.isArray(data) ? data : []))
      .catch(() => setRaces([]))
  }, [])

  // Pull results/fastest-lap for the most recently completed race, reusing
  // the same /api/race endpoint the Race Detail page already relies on.
  useEffect(() => {
    if (races.length === 0) return
    const completed = races.filter((r) => new Date(r.date_start) < new Date())
    const lastRound = completed.length
    if (lastRound < 1) return
    const year = new Date().getFullYear()
    fetch(`${import.meta.env.VITE_API_URL}/api/race/${year}/${lastRound}`)
      .then((res) => res.json())
      .then((data) => setLastRaceStats(data))
      .catch(() => setLastRaceStats(null))
  }, [races])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const upcoming = races.filter((r) => new Date(r.date_start) > now).slice(0, 4)
  const nextRace = races.find((r) => new Date(r.date_start) > now)

  const heroRace = liveStatus?.is_live
    ? {
        location: liveStatus.location,
        country_name: liveStatus.country_name,
        date_start: liveStatus.date_start,
      }
    : nextRace

  const roundIndex = heroRace ? races.findIndex((r) => r.location === heroRace.location) : -1
  const roundNumber = roundIndex >= 0 ? roundIndex + 1 : null
  const totalRounds = races.length || 24

  let countdown = null
  if (heroRace && !liveStatus?.is_live) {
    const diff = new Date(heroRace.date_start) - now
    if (diff > 0) {
      countdown = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      }
    }
  }

  const winner = lastRaceStats?.results?.find((r) => r.position === 1)

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-overlay" aria-hidden="true"></div>

        <div className="home-hero-content">
          {error ? (
            <div className="error-text">Something went wrong: {error}</div>
          ) : heroRace ? (
            <>
              {liveStatus?.is_live && <div className="home-hero-live-badge">Live now</div>}
              <h1 className="home-hero-headline">{heroRace.country_name} Grand Prix</h1>
              <div className="home-hero-subtitle">
                {heroRace.location}, {heroRace.country_name} ·{' '}
                {new Date(heroRace.date_start).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              {countdown && (
                <div className="home-hero-countdown">
                  <div className="countdown-unit">
                    <span className="countdown-value tabular">{countdown.days}</span>
                    <span className="countdown-label">Days</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-value tabular">{countdown.hours}</span>
                    <span className="countdown-label">Hours</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-value tabular">{countdown.minutes}</span>
                    <span className="countdown-label">Minutes</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="stat-sub">
              <span className="spinner"></span>Loading...
            </div>
          )}
        </div>
      </div>

      <div className="home-stats-row">
        <div className="home-stat-card home-stat-card--winner">
          <div className="stat-label">Last Race Winner</div>
          {winner ? (
            <>
              <div className="stat-value">{winner.name}</div>
              <div className="stat-sub">{winner.team}</div>
            </>
          ) : (
            <div className="stat-sub">—</div>
          )}
        </div>
        <div className="home-stat-card home-stat-card--fastest">
          <div className="stat-label">Fastest Lap</div>
          {lastRaceStats?.fastest_lap ? (
            <>
              <div className="stat-value tabular">{lastRaceStats.fastest_lap.time}</div>
              <div className="stat-sub">{lastRaceStats.fastest_lap.name}</div>
            </>
          ) : (
            <div className="stat-sub">—</div>
          )}
        </div>
        <div className="home-stat-card home-stat-card--round">
          <div className="stat-label">Season Progress</div>
          <div className="stat-value tabular">
            {roundNumber ? `Round ${roundNumber}/${totalRounds}` : '—'}
          </div>
          <div className="stat-sub">{new Date().getFullYear()} Season</div>
        </div>
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
