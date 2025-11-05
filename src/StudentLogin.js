import React, { useState } from 'react';
import config from './config';

const StudentLogin = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim() || !password.trim()) {
      setError('Please enter both Student ID and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/student-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          password: password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        onLogin(data.student);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🎓 Student Portal</h1>
        <p style={{ color: '#666', margin: 0 }}>Login to access support services</p>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Student ID:
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g., STU001"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Logging in...' : '🔑 Login'}
        </button>
      </form>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <strong>📋 Demo Accounts:</strong>
        <div style={{ marginTop: '8px' }}>
          <div>👤 STU001 / student123</div>
          <div>👤 STU002 / student123</div>
          <div>👤 STU003 / student123</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a 
          href="/admin" 
          style={{ 
            color: '#6c757d', 
            textDecoration: 'none', 
            fontSize: '14px'
          }}
        >
          🔧 Admin Login
        </a>
      </div>
    </div>
  );
};

export default StudentLogin;