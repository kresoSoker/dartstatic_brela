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

  // Keep server alive with periodic health checks
  useEffect(() => {
    if (!username) return;

    const keepAlive = () => {
      fetch('https://dartstatic-brela-backend.onrender.com/api/health')
        .catch(() => {}); // Silently fail
    };

    // Ping every 10 minutes to keep server awake
    const interval = setInterval(keepAlive, 10 * 60 * 1000);
    
    // Initial ping
    keepAlive();

    return () => clearInterval(interval);
  }, [username]);

  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (username) {
      setInitialLoading(true);
      // Try to fetch something from the server to trigger wakeup
      fetch('https://dartstatic-brela-backend.onrender.com/api/players')
        .then(() => setInitialLoading(false))
        .catch(() => setInitialLoading(false));
    }
  }, [username]);

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="60" height="60" viewBox="0 0 50 50" style={{ marginBottom: 16 }}>
            <circle cx="25" cy="25" r="20" stroke="#1976d2" strokeWidth="5" fill="none" strokeDasharray="31.4 31.4" strokeDashoffset="0">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div style={{ fontSize: '1.2rem', color: '#1976d2' }}>Spajam se sa serverom...<br />Može potrajati i do 3 minute prilikom prvog pokretanja.</div>
        </div>
      </div>
    );
  }

  return (
    <Router basename="/dartstatic_brela">
      <div className="app-container" style={{ minHeight: '100vh', background: '#000000' }}>
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
  );
}

export default App
