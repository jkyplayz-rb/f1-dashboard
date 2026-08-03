import { useState, useEffect } from 'react'

function Schedule() {
  const [races, setRaces] = useState([])
  const [year, setYear] = useState(2024)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:5000/api/schedule?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setRaces(data)
        setLoading(false)
      })
  }, [year])

  return (
    <div className="schedule-page">
      <h2 className="page-title">{year} Race Schedule</h2>
      {loading ? (
        <p className="muted-text">Loading...</p>
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