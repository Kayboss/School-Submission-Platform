import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardCheck, 
  ListChecks,
  History, 
  GraduationCap,
  Archive,
  Users,
  FileText,
  Edit3,
  Settings,
  LogOut,
  Shield,
  Loader,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logActivity, ACTIONS } from '../../lib/activityService';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.main};
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  position: fixed;
  height: 100vh;
  box-shadow: 10px 0 30px rgba(179, 90, 56, 0.05);
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    width: 240px;
    padding: 2rem;
  }

  @media (max-width: 768px) {
    transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
  }
`;

const Overlay = styled.div`
  @media (max-width: 768px) {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 99;
  }
`;

const MenuToggle = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 110;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(179, 90, 56, 0.3);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 2.5rem 4rem;
  position: relative;

  @media (max-width: 1024px) {
    margin-left: 240px;
    padding: 2rem 2.5rem;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1.25rem;
    padding-top: 4rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(${({ theme }) => theme.colors.primary}08 1px, transparent 1px);
    background-size: 32px 32px;
    z-index: -1;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 4rem;
`;

const LogoIcon = styled.div`
  background: ${({ theme }) => theme.colors.secondary};
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
`;

const LogoText = styled.h2`
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: white;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.7rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(5px);
  }

  svg {
    opacity: ${({ $active }) => $active ? 1 : 0.7};
  }
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.7rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.tertiary};
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  margin-top: auto;

  &:hover {
    background: #3d6649;
    transform: translateX(5px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    opacity: 0.9;
  }
`;
const Layout = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    logActivity(ACTIONS.PAGE_VIEW, 'page', location.pathname, { path: location.pathname });
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  return (
    <LayoutContainer>
      <MenuToggle onClick={() => setSidebarOpen(v => !v)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </MenuToggle>
      {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}
      <Sidebar $open={sidebarOpen}>
        <LogoSection>
          <LogoIcon><GraduationCap size={26} strokeWidth={2.5} /></LogoIcon>
          <LogoText>TaTU Portal</LogoText>
        </LogoSection>

        <NavList>
          <NavLink to="/" $active={location.pathname === '/'} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/courses" $active={location.pathname === '/courses'} onClick={() => setSidebarOpen(false)}>
            <BookOpen size={18} /> Courses
          </NavLink>
          {user?.role !== 'lecturer' && (
            <>
              <NavLink to="/assignments" $active={location.pathname === '/assignments'} onClick={() => setSidebarOpen(false)}>
                <ListChecks size={18} /> Assignments
              </NavLink>
              <NavLink to="/submissions" $active={location.pathname === '/submissions'} onClick={() => setSidebarOpen(false)}>
                <ClipboardCheck size={18} /> Submissions
              </NavLink>
              <NavLink to="/history" $active={location.pathname === '/history'} onClick={() => setSidebarOpen(false)}>
                <History size={18} /> History
              </NavLink>
            </>
          )}
          {user?.role === 'lecturer' && (
            <>
              <NavLink to="/lecturer/students" $active={location.pathname.startsWith('/lecturer/students')} onClick={() => setSidebarOpen(false)}>
                <Users size={18} /> Students
              </NavLink>
              <NavLink to="/lecturer/submissions" $active={location.pathname.startsWith('/lecturer/submissions')} onClick={() => setSidebarOpen(false)}>
                <FileText size={18} /> Submissions
              </NavLink>
              <NavLink to="/lecturer/assignments" $active={location.pathname.startsWith('/lecturer/assignments')} onClick={() => setSidebarOpen(false)}>
                <Edit3 size={18} /> Assignments
              </NavLink>
              <NavLink to="/history" $active={location.pathname === '/history'} onClick={() => setSidebarOpen(false)}>
                <Archive size={18} /> Archive
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/analytics" $active={location.pathname === '/analytics'} onClick={() => setSidebarOpen(false)}>
              <Shield size={18} /> Analytics
            </NavLink>
          )}
          <NavLink to="/settings" $active={location.pathname === '/settings'} onClick={() => setSidebarOpen(false)}>
            <Settings size={18} /> Settings
          </NavLink>
        </NavList>

        <LogoutBtn onClick={() => { handleLogout(); setSidebarOpen(false); }} disabled={loggingOut}>
          {loggingOut ? <Loader className="spin" size={18} /> : <LogOut size={18} />} {loggingOut ? 'Signing out...' : 'Sign Out'}
        </LogoutBtn>
      </Sidebar>

      <Main>
        <Outlet />
      </Main>
    </LayoutContainer>
  );
};

export default Layout;
