import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Film, AlertTriangle } from 'lucide-react';

function Login({ setToken }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your passcode.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error('No authentication token received.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#04050a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Glows */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(58, 134, 255, 0.08) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(76, 219, 232, 0.08) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        margin: '0 1rem'
      }}>
        {/* Logo Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4cdbe8, #3a86ff)',
            padding: '0.6rem',
            borderRadius: '12px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Film size={24} />
          </div>
          <span style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '1.8rem',
            letterSpacing: '0.05em',
            background: 'linear-gradient(to right, #ffffff, #aab1c5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            PRIME EDITS
          </span>
        </div>

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#f4f6fb',
          marginBottom: '0.5rem'
        }}>
          Admin Portal
        </h2>
        <p style={{
          fontSize: '0.85rem',
          color: '#aab1c5',
          marginBottom: '2rem',
          fontWeight: 400
        }}>
          Enter administrative passcode to manage client inquiries.
        </p>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            color: '#f87171',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#707892',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Lock size={18} />
            </div>
            
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter passcode"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem'
              }}
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#707892',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              borderRadius: '12px',
              fontSize: '0.95rem'
            }}
            disabled={loading}
          >
            {loading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: '2.5rem',
          fontSize: '0.75rem',
          color: '#707892',
          fontFamily: 'var(--font-mono)'
        }}>
          SECURE CONNECTED // SESSION MAX 24H
        </div>
      </div>
    </div>
  );
}

export default Login;
