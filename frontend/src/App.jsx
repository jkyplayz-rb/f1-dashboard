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
        <p>Content goes here</p>
      </main>
    </div>
  )
}

export default App