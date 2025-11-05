import React, { useState, useEffect, useCallback } from 'react';
import ChatBot from './ChatBot';
import ComplaintForm from './ComplaintForm';
import config from './config';

const StudentDashboard = ({ student, onLogout }) => {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/student-complaints/${student.id}`);
      const data = await response.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmitComplaint = (studentName, chatHistory) => {
    setActiveTab('complaint');
  };

  const getStatusColor = (status) => {
    return status === 'resolved' ? '#28a745' : '#ffc107';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'urgent': return '#dc3545';
      case 'angry': return '#fd7e14';
      case 'normal': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Mess': return '🍽️';
      case 'WiFi/Network': return '📶';
      case 'Technical Issue': return '🔧';
      case 'Academic/Teacher': return '📚';
      case 'Safety/Security': return '🛡️';
      default: return '📝';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <h1 style={{ margin: '0', color: '#333' }}>Welcome, {student.name}! 👋</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>ID: {student.id} | {student.email}</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #dee2e6'
      }}>
        {[
          { id: 'chat', label: '🤖 Smart Assistant', icon: '💬' },
          { id: 'complaint', label: '📝 Submit Complaint', icon: '📋' },
          { id: 'history', label: '📊 My Complaints', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <ChatBot 
          student={student}
          onSubmitComplaint={handleSubmitComplaint} 
        />
      )}

      {activeTab === 'complaint' && (
        <ComplaintForm 
          initialStudentName={student.name}
          studentId={student.id}
          onBackToChat={() => setActiveTab('chat')}
          onComplaintSubmitted={() => {
            fetchComplaints();
            setActiveTab('history');
          }}
        />
      )}

      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#333' }}>📊 Your Complaint History</h2>
            <button
              onClick={fetchComplaints}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Status
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>🔄 Loading your complaints...</h3>
            </div>
          ) : complaints.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              color: '#666'
            }}>
              <h3>📭 No complaints yet</h3>
              <p>You haven't submitted any complaints. Use the Smart Assistant or Submit Complaint tabs to get help!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {complaints.map(complaint => (
                <div 
                  key={complaint.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: complaint.status === 'resolved' ? '#f8f9fa' : 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                        {getCategoryIcon(complaint.category)} {complaint.category}
                      </h3>
                      <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                        Complaint #{complaint.id} | {new Date(complaint.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span 
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getSentimentColor(complaint.sentiment)
                        }}
                      >
                        {complaint.sentiment.toUpperCase()}
                      </span>
                      <span 
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getStatusColor(complaint.status)
                        }}
                      >
                        {complaint.status === 'resolved' ? '✅ RESOLVED' : '⏳ PENDING'}
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ margin: '0', lineHeight: '1.5', color: '#555' }}>
                    "{complaint.complaint_text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;