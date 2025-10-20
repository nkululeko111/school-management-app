// src/App.tsx
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
import OnboardPage from './components/onboard/SchoolOnboardingPage';
import { supabase } from './supabaseClient';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [schoolExists, setSchoolExists] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSchool() {
      try {
        const { data, error } = await supabase.from('schools').select('id').limit(1).single();

        if (error && error.code !== 'PGRST116') {
          // Ignore "No rows returned" error code
          console.error(error);
        }

        setSchoolExists(!!data);
      } catch (err) {
        console.error(err);
        setSchoolExists(false);
      }
    }

    checkSchool();
  }, []);

  if (loading || schoolExists === null) {
    return <LoadingScreen />;
  }

  // // If no school exists, show onboarding page
  if (!schoolExists) {
    return <OnboardPage />;
  }

  // If user is not logged in, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If logged in and school exists, show main app
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
