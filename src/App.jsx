import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeContextProvider } from './context/ThemeContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useAuthStore } from './store/authStore';
import { useCourseStore } from './store/courseStore';
import { useAssignmentStore } from './store/assignmentStore';
import { useSubmissionStore } from './store/submissionStore';
import { useRubricStore } from './store/rubricStore';
import { HelmetProvider } from 'react-helmet-async';
import styled from 'styled-components';

const Splash = styled.div`
  height: 100vh; display: flex; align-items: center; justify-content: center;
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800; font-size: 1.5rem;
`;

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
import AdminDashboard from './features/admin/AdminDashboard';
import { ToastContainer } from './components/ui/ToastContainer';


// Loads data from Supabase when authenticated
const DataLoader = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const loadCourses = useCourseStore(s => s.loadCourses);
  const loadAssignments = useAssignmentStore(s => s.loadAssignments);
  const loadSubmissions = useSubmissionStore(s => s.loadSubmissions);
  const loadRubrics = useRubricStore(s => s.loadRubrics);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        loadCourses(),
        loadAssignments(),
        loadSubmissions(),
        loadRubrics()
      ]).finally(() => setLoaded(true));
    }
  }, [isAuthenticated]);

  if (isAuthenticated && !loaded) {
    return <Splash>Loading data...</Splash>;
  }

  return children;
};

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
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'lecturer') return <LecturerDashboard />;
  return <StudentDashboard />;
};

const App = () => {
  const initialize = useAuthStore(s => s.initialize);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initialize().finally(() => setInit(true));
  }, [initialize]);

  if (!init) {
    return (
      <HelmetProvider>
        <ThemeContextProvider>
          <GlobalStyles />
          <Splash>Loading...</Splash>
        </ThemeContextProvider>
      </HelmetProvider>
    );
  }

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
                  <DataLoader>
                    <Layout />
                  </DataLoader>
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
              <Route path="admin" element={<AdminDashboard />} />
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
