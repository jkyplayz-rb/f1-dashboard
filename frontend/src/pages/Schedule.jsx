import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Schedule() {
  const [races, setRaces] = useState([])
  const [year, setYear] = useState(2024)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${import.meta.env.VITE_API_URL}/api/schedule?year=${year}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load schedule')
        return res.json()
      })
      .then((data) => {
        setRaces(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [year])

  const now = new Date()

  const filteredRaces = races.filter((race) => {
    const query = search.toLowerCase()
    return (
      race.location.toLowerCase().includes(query) ||
      race.country_name.toLowerCase().includes(query)
    )
  })

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h2 className="page-title">{year} Race Schedule</h2>
        <input
          type="number"
          className="year-input"
          min={2023}
          max={new Date().getFullYear()}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search by location or country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? (
        <p className="muted-text"><span className="spinner"></span>Loading...</p>
      ) : error ? (
        <p className="error-text">Something went wrong: {error}</p>
      ) : races.length === 0 ? (
        <p className="muted-text">No races found for {year}.</p>
      ) : filteredRaces.length === 0 ? (
        <p className="muted-text">No races match "{search}".</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Country</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRaces.map((race) => {
              const originalIndex = races.indexOf(race)
              const isPast = new Date(race.date_start) < now
              return (
                <tr
                  key={race.session_key}
                  className={`clickable-row ${isPast ? 'past-row' : ''}`}
                  onClick={() => navigate(`/race/${year}/${originalIndex + 1}`)}
                >
                  <td>
                    {race.location}
                    {!isPast && <span className="upcoming-badge">Upcoming</span>}
                  </td>
                  <td className="muted-text">{race.country_name}</td>
                  <td className="muted-text tabular">
                    {new Date(race.date_start).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Schedule