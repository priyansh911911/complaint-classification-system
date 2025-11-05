import React, { useState } from 'react';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [student, setStudent] = useState(null);
  
  // Simple routing based on URL path
  const path = window.location.pathname;
  
  const handleStudentLogin = (studentData) => {
    setStudent(studentData);
  };
  
  const handleStudentLogout = () => {
    setStudent(null);
  };
  
  if (path === '/admin') {
    return <AdminDashboard />;
  }
  
  if (!student) {
    return <StudentLogin onLogin={handleStudentLogin} />;
  }
  
  return (
    <div className="App">
      <StudentDashboard 
        student={student} 
        onLogout={handleStudentLogout}
      />
    </div>
  );
}

export default App;