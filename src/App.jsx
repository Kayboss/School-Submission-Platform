import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useAuthStore } from './store/authStore';
import { HelmetProvider } from 'react-helmet-async';

// Features
import InstitutionalLogin from './features/auth/InstitutionalLogin';
import InstitutionalSignup from './features/auth/InstitutionalSignup';
import StudentDashboard from './features/dashboard/StudentDashboard';
import UploadPortal from './features/submissions/UploadPortal';
import SubmissionHistory from './features/history/SubmissionHistory';
import CourseList from './features/courses/CourseList';
import Layout from './components/common/Layout';
import LecturerDashboard from './features/lecturer/LecturerDashboard';
import Settings from './features/settings/Settings';
import LecturerLayout from './features/lecturer/LecturerLayout';
import LecturerSubmissions from './features/lecturer/LecturerSubmissions';
import LecturerAssignments from './features/lecturer/LecturerAssignments';
import LecturerStudents from './features/lecturer/LecturerStudents';
import { ToastContainer } from './components/ui/ToastContainer';


// Protected Route Wrapper
const CheckAuth = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Dashboard Switcher based on User Role
const Dashboard = () => {
  const role = useAuthStore(state => state.role);
  return role === 'lecturer' ? <LecturerDashboard /> : <StudentDashboard />;
};

const App = () => {
  return (
    <HelmetProvider>
      <ThemeContextProvider>
        <GlobalStyles />
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<InstitutionalLogin />} />
            <Route path="/signup" element={<InstitutionalSignup />} />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <CheckAuth>
                  <Layout />
                </CheckAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="submissions" element={<UploadPortal />} />

              <Route path="courses" element={<CourseList />} />
              <Route path="settings" element={<Settings />} />
              <Route path="history" element={<SubmissionHistory />} />
              <Route path="lecturer" element={<LecturerLayout />}>
                <Route index element={<Navigate to="submissions" replace />} />
                <Route path="submissions" element={<LecturerSubmissions />} />
                <Route path="assignments" element={<LecturerAssignments />} />
                <Route path="students" element={<LecturerStudents />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </HelmetProvider>
  );
};

export default App;
