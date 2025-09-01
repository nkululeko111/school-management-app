import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import StudentManagement from './pages/StudentManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import ClassManagement from './pages/ClassManagement';
import TimetableManagement from './pages/TimetableManagement';
import Communication from './pages/Communication';
import Reports from './pages/Reports';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<StudentManagement />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/timetable" element={<TimetableManagement />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SchoolProvider>
          <AppRoutes />
        </SchoolProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;