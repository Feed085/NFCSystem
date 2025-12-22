import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';

// Admin Protected Route
const AdminRoute = ({ children }) => {
  // Dizaynı görmək üçün giriş yoxlanışını müvəqqəti söndürürük
  return children;
};

// Student Protected Route
const StudentRoute = ({ children }) => {
  // Dizaynı görmək üçün giriş yoxlanışını müvəqqəti söndürürük
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route path="/dashboard" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />

        {/* Student Dashboard */}
        <Route path="/student/dashboard" element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } />

        {/* Varsayılan olarak login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
