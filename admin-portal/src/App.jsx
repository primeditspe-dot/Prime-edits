import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function App() {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('prime_admin_token');
    if (storedToken) {
      setTokenState(storedToken);
    }
    setLoading(false);
  }, []);

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('prime_admin_token', newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem('prime_admin_token');
      setTokenState(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#04050a',
        color: '#f4f6fb',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(76, 219, 232, 0.1)',
            borderTopColor: '#4cdbe8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ letterSpacing: '0.1em', fontSize: '0.8rem' }}>LOADING PORTAL...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <AdminDashboard token={token} handleLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
