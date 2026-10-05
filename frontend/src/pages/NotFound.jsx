import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found-page">
      <h2 className="page-title">Page not found</h2>
      <p className="muted-text">That page doesn't exist.</p>
      <Link to="/">Back to home</Link>
    </div>
  )
}

export default NotFound