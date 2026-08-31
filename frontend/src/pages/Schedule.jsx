import { useState, useEffect } from 'react'

function Schedule() {
  const [races, setRaces] = useState([])
  const [year, setYear] = useState(2024)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://127.0.0.1:5000/api/schedule?year=${year}`)
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

  return (
    <div className="schedule-page">
      <h2 className="page-title">{year} Race Schedule</h2>
      {loading ? (
        <p className="muted-text"><span className="spinner"></span>Loading...</p>
      ) : error ? (
        <p className="error-text">Something went wrong: {error}</p>
      ) : races.length === 0 ? (
        <p className="muted-text">No races found for {year}.</p>
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
            {races.map((race) => (
              <tr key={race.session_key}>
                <td>{race.location}</td>
                <td className="muted-text">{race.country_name}</td>
                <td className="muted-text tabular">
                  {new Date(race.date_start).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Schedule