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
import StudentAssignments from './features/assignments/StudentAssignments';
import LecturerLayout from './features/lecturer/LecturerLayout';
import LecturerSubmissions from './features/lecturer/LecturerSubmissions';
import LecturerAssignments from './features/lecturer/LecturerAssignments';
import LecturerStudents from './features/lecturer/LecturerStudents';
import QuestionnaireDashboard from './features/admin/QuestionnaireDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import PostInterviewWizard from './features/post-interview/PostInterviewWizard';
import { ToastContainer } from './components/ui/ToastContainer';


// Loads data from Supabase when authenticated
const DataLoader = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const loadCourses = useCourseStore(s => s.loadCourses);
  const loadAssignments = useAssignmentStore(s => s.loadAssignments);
  const loadSubmissions = useSubmissionStore(s => s.loadSubmissions);
  const loadRubrics = useRubricStore(s => s.loadRubrics);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      Promise.all([
        loadCourses(user),
        loadAssignments(user),
        loadSubmissions(user),
        loadRubrics()
      ]).finally(() => setLoaded(true));
    }
  }, [isAuthenticated, user]);

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

// Onboarding Guard — currently disabled
const OnboardingGuard = ({ children }) => {
  return children;
};

// Dashboard Switcher based on User Role
const Dashboard = () => {
  const role = useAuthStore(state => state.role);
  if (role === 'admin') return <QuestionnaireDashboard />;
  if (role === 'lecturer') return <LecturerDashboard />;
  return <StudentDashboard />;
};

// Auto-logout after 10 minutes of inactivity
const IDLE_TIMEOUT = 10 * 60 * 1000;
const IdleLogout = () => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, logout]);

  return null;
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
          <IdleLogout />
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
                  <OnboardingGuard>
                    <DataLoader>
                      <Layout />
                    </DataLoader>
                  </OnboardingGuard>
                </CheckAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="submissions" element={<UploadPortal />} />

              <Route path="courses" element={<CourseList />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="settings" element={<Settings />} />
              <Route path="history" element={<SubmissionHistory />} />
              <Route path="lecturer" element={<LecturerLayout />}>
                <Route index element={<Navigate to="submissions" replace />} />
                <Route path="submissions" element={<LecturerSubmissions />} />
                <Route path="assignments" element={<LecturerAssignments />} />
                <Route path="students" element={<LecturerStudents />} />
              </Route>
              <Route path="admin" element={<QuestionnaireDashboard />} />
              <Route path="analytics" element={<AdminDashboard />} />
            </Route>

            {/* Onboarding Route */}
            <Route 
              path="/onboarding" 
              element={
                <CheckAuth>
                  <OnboardingWizard />
                </CheckAuth>
              }
            />

            {/* Post-Interview Route */}
            <Route 
              path="/post-interview" 
              element={
                <CheckAuth>
                  <PostInterviewWizard />
                </CheckAuth>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeContextProvider>
    </HelmetProvider>
  );
};

export default App;
