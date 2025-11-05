import React, { useState, useEffect } from 'react';
import config from './config';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/complaints`);
      const data = await response.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveComplaint = async (id) => {
    try {
      await fetch(`${config.API_BASE_URL}/complaints/${id}/resolve`, {
        method: 'PUT'
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error resolving complaint:', error);
    }
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🔄 Loading complaints...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333' }}>🛠️ Admin Dashboard</h1>
        <a 
          href="/" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            padding: '8px 16px',
            border: '1px solid #007bff',
            borderRadius: '4px'
          }}
        >
          👨🎓 Student Portal
        </a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#007bff' }}>📊 Total</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', fontWeight: 'bold' }}>{complaints.length}</p>
        </div>
        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#856404' }}>⏳ Pending</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', fontWeight: 'bold' }}>
            {complaints.filter(c => c.status && c.status.toLowerCase() === 'pending').length}
          </p>
        </div>
        <div style={{ backgroundColor: '#d1ecf1', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0', color: '#0c5460' }}>✅ Resolved</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', fontWeight: 'bold' }}>
            {complaints.filter(c => c.status && c.status.toLowerCase() === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <h3>No complaints found</h3>
            <p>No complaints have been submitted yet.</p>
          </div>
        ) : (
          complaints.map(complaint => (
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
                    ID: #{complaint.id} | Student: {complaint.student_name} | 
                    {new Date(complaint.timestamp).toLocaleString()}
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
                      color: complaint.status === 'resolved' ? '#155724' : '#856404',
                      backgroundColor: complaint.status === 'resolved' ? '#d4edda' : '#fff3cd'
                    }}
                  >
                    {complaint.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p style={{ margin: '0 0 15px 0', lineHeight: '1.5' }}>
                "{complaint.complaint_text}"
              </p>
              <p style={{ fontSize: '12px', color: '#999' }}>Status: "{complaint.status}"</p>
              
              <button
                onClick={() => resolveComplaint(complaint.id)}
                style={{
                  backgroundColor: complaint.status && complaint.status.toLowerCase() === 'resolved' ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={complaint.status && complaint.status.toLowerCase() === 'resolved'}
              >
                {complaint.status && complaint.status.toLowerCase() === 'resolved' ? '✅ Resolved' : '✅ Mark as Resolved'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;