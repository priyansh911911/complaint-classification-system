import React, { useState } from 'react';
import config from './config';

const ComplaintForm = ({ initialStudentName = '', studentId = '', chatHistory = [], onBackToChat, onComplaintSubmitted }) => {
  const [studentName, setStudentName] = useState(initialStudentName);
  const [complaintText, setComplaintText] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pre-fill complaint text from chat if available
  React.useEffect(() => {
    if (chatHistory.length > 0) {
      const userMessages = chatHistory.filter(msg => msg.type === 'user').map(msg => msg.text);
      if (userMessages.length > 0) {
        setComplaintText(userMessages.join(' '));
      }
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentName.trim() || !complaintText.trim()) {
      alert('Please enter both your name and complaint');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}/classify-complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          complaint_text: complaintText,
          complaint_type: complaintType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          id: data.id,
          category: data.category,
          sentiment: data.sentiment,
          status: data.status
        });
        // Clear form and notify parent
        setComplaintText('');
        if (onComplaintSubmitted) {
          setTimeout(() => onComplaintSubmitted(), 2000);
        }
      } else {
        setResult({ error: data.error });
      }
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '50px auto', padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>
          📝 Submit Complaint
        </h1>
        {onBackToChat && (
          <button
            onClick={onBackToChat}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back to Chat
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="studentName" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Your Name:
          </label>
          <input
            id="studentName"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter your full name"
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
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="complaintType" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Complaint Type:
          </label>
          <select
            id="complaintType"
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Select complaint type (optional - AI will classify if not selected)</option>
            <option value="Mess">🍽️ Mess/Food Issues</option>
            <option value="WiFi/Network">📶 WiFi/Network Problems</option>
            <option value="Technical Issue">🔧 Technical Issues</option>
            <option value="Academic/Teacher">📚 Academic/Teacher Issues</option>
            <option value="Safety/Security">🛡️ Safety/Security Concerns</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label htmlFor="complaint" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            Your Complaint:
          </label>
          <textarea
            id="complaint"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="e.g., The WiFi is not working in the library, or The food in mess hall is cold"
            rows="5"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '🔄 Analyzing...' : '📝 Submit Complaint'}
        </button>
      </form>
      
      {result && (
        <div style={{
          marginTop: '25px',
          padding: '20px',
          backgroundColor: result.error ? '#f8d7da' : '#d1ecf1',
          border: `2px solid ${result.error ? '#f5c6cb' : '#bee5eb'}`,
          borderRadius: '8px'
        }}>
          {result.error ? (
            <div style={{ color: '#721c24' }}>
              <strong>❌ Error: {result.error}</strong>
            </div>
          ) : (
            <div style={{ color: '#0c5460' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>✅ Complaint Submitted Successfully!</h3>
              <p><strong>Complaint ID:</strong> #{result.id}</p>
              <p><strong>Category:</strong> {result.category}</p>
              <p><strong>Priority:</strong> {result.sentiment.toUpperCase()}</p>
              <p><strong>Status:</strong> Pending Review</p>
              <p style={{ marginTop: '15px', fontSize: '14px', fontStyle: 'italic' }}>
                💡 Your complaint has been logged and will be reviewed by the admin team.
              </p>
              {chatHistory.length > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <small style={{ color: '#666' }}>📋 Based on your chat conversation</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
        {!onBackToChat && (
          <a 
            href="/" 
            style={{ 
              color: '#007bff', 
              textDecoration: 'none', 
              fontSize: '14px',
              padding: '8px 16px',
              border: '1px solid #007bff',
              borderRadius: '4px'
            }}
          >
            🤖 Chat Assistant
          </a>
        )}
        <a 
          href="/admin" 
          style={{ 
            color: '#6c757d', 
            textDecoration: 'none', 
            fontSize: '14px',
            padding: '8px 16px',
            border: '1px solid #6c757d',
            borderRadius: '4px'
          }}
        >
          🔧 Admin Dashboard
        </a>
      </div>
    </div>
  );
};

export default ComplaintForm;