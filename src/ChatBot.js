import React, { useState, useRef, useEffect } from 'react';
import config from './config';

const ChatBot = ({ student, onSubmitComplaint }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: 'Hi! 👋 I\'m your Smart Troubleshooting Assistant!\n\nI can help you with:\n• 📶 WiFi and network issues\n• 💻 Technical problems\n• 🍽️ Mess and dining concerns\n• 📚 Academic issues\n• 🛡️ Safety and security\n\nDescribe your problem in detail and I\'ll provide step-by-step solutions!',
      isDetailed: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    const newMessages = [...messages, { type: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages.map(msg => `${msg.type}: ${msg.text}`)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const botReply = data.reply;
        setMessages(prev => [...prev, { type: 'bot', text: botReply, isDetailed: true }]);
        
        // Check if bot suggests submitting complaint
        if (botReply.toLowerCase().includes('formal complaint') || botReply.toLowerCase().includes('submit a complaint')) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              type: 'bot', 
              text: '🎯 Ready to submit a formal complaint? I can help you create one based on our conversation!',
              showComplaintButton: true
            }]);
          }, 1500);
        }
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: '❌ Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: '🔌 Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSubmitComplaint = () => {
    onSubmitComplaint(student.name, messages);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>🛠️ Smart Troubleshooting Assistant</h1>
        <p style={{ color: '#666' }}>I'll help diagnose and solve your college issues step-by-step!</p>
      </div>

      <div style={{ 
        marginBottom: '15px', 
        textAlign: 'center', 
        padding: '10px',
        backgroundColor: '#e8f5e8',
        borderRadius: '6px',
        border: '1px solid #c3e6c3'
      }}>
        <span style={{ color: '#155724', fontWeight: 'bold' }}>
          ✅ Hi {student.name}! Let's solve your issues together!
        </span>
      </div>

      {/* Chat Messages */}
      <div style={{
        height: '450px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fafafa',
        marginBottom: '15px'
      }}>
        {messages.map((message, index) => (
          <div key={index} style={{
            marginBottom: '15px',
            display: 'flex',
            justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: message.isDetailed ? '15px 20px' : '10px 15px',
              borderRadius: message.isDetailed ? '12px' : '18px',
              backgroundColor: message.type === 'user' ? '#007bff' : (message.isDetailed ? '#f8f9fa' : '#e9ecef'),
              color: message.type === 'user' ? 'white' : '#333',
              wordWrap: 'break-word',
              border: message.isDetailed ? '1px solid #dee2e6' : 'none',
              boxShadow: message.isDetailed ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}>
              <div style={{ 
                whiteSpace: 'pre-line',
                lineHeight: message.isDetailed ? '1.6' : '1.4',
                fontSize: message.isDetailed ? '15px' : '14px'
              }}>
                {message.text}
              </div>
              {message.showComplaintButton && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={handleSubmitComplaint}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📝 Submit Complaint
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
            <div style={{
              padding: '12px 18px',
              borderRadius: '18px',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: '1px solid #bbdefb'
            }}>
              🔍 Analyzing your issue and finding solutions...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your problem in detail (e.g., 'WiFi keeps disconnecting in my dorm room')..."
          rows="2"
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            resize: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !inputMessage.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Send
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button
          onClick={handleSubmitComplaint}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📝 Skip Chat & Submit Complaint
        </button>
      </div>
    </div>
  );
};

export default ChatBot;