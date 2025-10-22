import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'

// Components
import Login from './components/Login'
import Navigation from './components/Navigation'
import Games from './components/Games'
import AddGame from './components/AddGame'
import Statistics from './components/Statistics'
import PlayerStatistics from './components/PlayerStatistics'

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  useEffect(() => {
    // Handle redirect from 404.html
    const storedPath = sessionStorage.getItem('spa-path');
    if (storedPath) {
      sessionStorage.removeItem('spa-path');
      const basePath = '/dartstatic_brela';
      window.history.replaceState(null, null, basePath + storedPath);
    }
  }, []);

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username)
    }
  }, [username])

  if (!username) {
    return <Login onLogin={setUsername} />
  }

  return (
    <Router basename="/dartstatic_brela">
      <div className="app-container">
        <Navigation username={username} onLogout={() => setUsername('')} />
        <main className="main-content">
          <Routes>
            <Route path="/games" element={<Games username={username} />} />
            <Route path="/add-game" element={<AddGame username={username} />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/player-statistics" element={<PlayerStatistics />} />
            <Route path="/" element={<Navigate to="/games" replace />} />
            <Route path="/index.html" element={<Navigate to="/games" replace />} />
            <Route path="*" element={<Navigate to="/games" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
