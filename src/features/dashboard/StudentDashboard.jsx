import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  Clock, ChevronRight, Bell, X,
  ListChecks, CheckCircle, AlertCircle, Send
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useNavigate } from 'react-router-dom';

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 3rem;
`;

const NotifWrapper = styled.div` position: relative; `;

const NotifButton = styled.button`
  background: white; border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.text.main}; box-shadow: ${({ theme }) => theme.shadows.small};
  position: relative;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; transform: translateY(-2px); }
`;

const NotifBadge = styled.span`
  position: absolute; top: -4px; right: -4px;
  background: ${({ theme }) => theme.colors.primary};
  color: white; font-size: 0.65rem; font-weight: 800;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
`;

const NotifDropdown = styled.div`
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 360px; background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.border}40;
  z-index: 100; overflow: hidden;
  @media (max-width: 600px) { width: 300px; right: -70px; }
`;

const NotifHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
  font-weight: 800; font-size: 0.9rem;
`;

const NotifList = styled.div` max-height: 300px; overflow-y: auto; `;

const NotifItem = styled.div`
  display: flex; gap: 0.75rem; padding: 0.875rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}15;
  cursor: pointer; transition: background 0.15s;
  background: ${({ $unread }) => $unread ? '#fefaf8' : 'transparent'};
  &:hover { background: ${({ theme }) => theme.colors.background.alt}; }
`;

const NotifDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0;
  background: ${({ $type, theme }) =>
    $type === 'overdue' ? theme.colors.primary :
    $type === 'deadline' ? theme.colors.secondary :
    theme.colors.tertiary};
`;

const NotifContent = styled.div` flex: 1; min-width: 0; `;

const NotifTitle = styled.div`
  font-weight: 700; font-size: 0.85rem; color: ${({ theme }) => theme.colors.text.main};
`;

const NotifDesc = styled.div`
  font-size: 0.8rem; color: ${({ theme }) => theme.colors.text.muted}; margin-top: 0.15rem;
`;

const GreetingSection = styled.div` margin-bottom: 2.5rem; `;

const Greeting = styled.h1`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const SubGreeting = styled.p`
  font-size: 1.125rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 500;
  @media (max-width: 600px) { font-size: 0.95rem; }
`;

const StatGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; margin-bottom: 2.5rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; gap: 1rem; }
`;

const StatCard = styled.div`
  background: white; padding: 1.5rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border-bottom: 4px solid ${({ color, theme }) => color || theme.colors.primary};
  display: flex; flex-direction: column; gap: 0.25rem;
`;

const StatLabel = styled.p`
  font-size: 0.75rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const StatValue = styled.p`
  font-size: 2rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main};
  letter-spacing: -1px; line-height: 1.2;
`;

const TabsRow = styled.div`
  display: flex; gap: 0.5rem; margin-bottom: 2rem;
  background: white; padding: 0.5rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small}; border: 1px solid ${({ theme }) => theme.colors.border}20;
`;

const TabBtn = styled.button`
  flex: 1; padding: 0.875rem 1.25rem; border-radius: 8px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#55433c'};
  font-weight: 800; font-size: 0.875rem;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: all 0.2s;
  &:hover { background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background.alt}; }
`;

const AssignmentCard = styled.div`
  background: white; padding: 1.5rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border}20;
  cursor: pointer; transition: all 0.3s;
  border-left: 4px solid ${({ $status, theme }) =>
    $status === 'overdue' ? theme.colors.primary :
    $status === 'submitted' ? theme.colors.tertiary :
    theme.colors.secondary};
  &:hover { transform: translateY(-3px); box-shadow: ${({ theme }) => theme.shadows.large}; }
  @media (max-width: 600px) { flex-wrap: wrap; gap: 1rem; padding: 1rem; }
`;

const AssignIcon = styled.div`
  width: 52px; height: 52px; border-radius: 14px;
  background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.primary};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const AssignInfo = styled.div` flex: 1; `;

const AssignTitle = styled.h4`
  font-size: 1rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; margin-bottom: 0.25rem;
`;

const AssignMeta = styled.p`
  font-size: 0.8125rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 600;
`;

const AssignStatus = styled.div`
  text-align: right; flex-shrink: 0;
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.75rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.7rem; font-weight: 800;
  background: ${({ $status, theme }) =>
    $status === 'Graded' ? `${theme.colors.tertiary}15` :
    $status === 'Pending' ? `${theme.colors.secondary}15` :
    $status === 'Late' ? `${theme.colors.primary}15` :
    $status === 'submitted' ? `${theme.colors.tertiary}15` :
    $status === 'overdue' ? `${theme.colors.primary}15` :
    `${theme.colors.secondary}20`};
  color: ${({ $status, theme }) =>
    $status === 'Graded' ? theme.colors.tertiary :
    $status === 'Pending' ? theme.colors.secondary :
    $status === 'Late' ? theme.colors.primary :
    $status === 'submitted' ? theme.colors.tertiary :
    $status === 'overdue' ? theme.colors.primary :
    theme.colors.secondary};
`;

const Countdown = styled.span`
  display: block; margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700;
  color: ${({ $urgent, theme }) => $urgent ? theme.colors.primary : theme.colors.text.muted};
`;

const EmptyState = styled.div`
  text-align: center; padding: 4rem 2rem; color: #55433c;
  p { font-weight: 600; font-size: 1rem; }
`;

const getCountdown = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  if (diff < 0) return { text: 'Overdue', urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}d ${hours}h remaining`, urgent: days <= 2 };
  if (hours > 0) return { text: `${hours}h remaining`, urgent: true };
  return { text: 'Due soon', urgent: true };
};

const StudentDashboard = () => {
  const user = useAuthStore(state => state.user);
  const assignments = useAssignmentStore(state => state.assignments);
  const submissions = useSubmissionStore(state => state.submissions);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('todo');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const studentId = '05210810';

  const studentSubmissions = useMemo(() =>
    submissions.filter(s => s.studentId === studentId),
    [submissions, studentId]
  );

  const submittedIds = useMemo(() =>
    new Set(studentSubmissions.map(s => s.assignmentId)),
    [studentSubmissions]
  );

  const todoAssignments = useMemo(() =>
    assignments.filter(a => !submittedIds.has(a.id) && new Date(a.dueDate) > new Date()),
    [assignments, submittedIds]
  );

  const overdueAssignments = useMemo(() =>
    assignments.filter(a => !submittedIds.has(a.id) && new Date(a.dueDate) <= new Date()),
    [assignments, submittedIds]
  );

  const submittedAssignments = useMemo(() =>
    assignments.filter(a => submittedIds.has(a.id)).map(a => ({
      ...a,
      submission: studentSubmissions.find(s => s.assignmentId === a.id)
    })),
    [assignments, submittedIds, studentSubmissions]
  );

  const notifications = useMemo(() => {
    const notifs = [];
    overdueAssignments.forEach(a => {
      notifs.push({ id: `overdue-${a.id}`, type: 'overdue', title: 'Overdue Assignment', desc: `${a.title} — ${a.courseCode}`, assignmentId: a.id });
    });
    todoAssignments.forEach(a => {
      const due = new Date(a.dueDate);
      const diff = due - new Date();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days <= 2) {
        notifs.push({ id: `deadline-${a.id}`, type: 'deadline', title: 'Upcoming Deadline', desc: `${a.title} — due ${days <= 0 ? 'today' : `in ${days}d`}`, assignmentId: a.id });
      }
    });
    studentSubmissions.filter(s => s.status === 'Graded').slice(0, 3).forEach(s => {
      const a = assignments.find(x => x.id === s.assignmentId);
      if (a) {
        notifs.push({ id: `graded-${s.id}`, type: 'graded', title: 'Assignment Graded', desc: `${a.title} — Score: ${s.score}/${s.maxScore || 100}`, assignmentId: a.id });
      }
    });
    return notifs.sort((a, b) => a.type === 'overdue' ? -1 : b.type === 'overdue' ? 1 : 0);
  }, [overdueAssignments, todoAssignments, studentSubmissions, assignments]);

  const renderAssignments = (list, type) => {
    if (list.length === 0) {
      return (
        <EmptyState>
          <CheckCircle size={48} color="#4a7c59" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No {type} assignments</p>
        </EmptyState>
      );
    }
    return list.map(a => {
      const countdown = a.dueDate && type !== 'submitted' ? getCountdown(a.dueDate) : null;
      const submission = a.submission;
      return (
        <AssignmentCard
          key={a.id}
          $status={type}
          onClick={() => navigate(`/submissions?assignment=${a.id}`)}
        >
          <AssignIcon>
            {type === 'submitted' ? <CheckCircle size={26} /> :
             type === 'overdue' ? <AlertCircle size={26} /> :
             <Clock size={26} />}
          </AssignIcon>
          <AssignInfo>
            <AssignTitle>{a.title}</AssignTitle>
            <AssignMeta>
              {a.courseCode} &middot; {a.lecturerName}
            </AssignMeta>
          </AssignInfo>
          <AssignStatus>
            {submission ? (
              <>
                <StatusBadge $status={submission.status}>{submission.status}</StatusBadge>
                {submission.score && (
                  <div style={{ marginTop: '0.25rem', fontWeight: 800, color: '#4a7c59' }}>
                    {submission.score}/100
                  </div>
                )}
              </>
            ) : (
              <>
                <StatusBadge $status={type}>
                  {type === 'overdue' ? 'Overdue' : type === 'submitted' ? 'Done' : 'Pending'}
                </StatusBadge>
                {countdown && (
                  <Countdown $urgent={countdown.urgent}>{countdown.text}</Countdown>
                )}
              </>
            )}
          </AssignStatus>
          <ChevronRight size={20} color="#b35a38" />
        </AssignmentCard>
      );
    });
  };

  const graded = studentSubmissions.filter(s => s.status === 'Graded').length;
  const pending = studentSubmissions.filter(s => s.status === 'Pending' || s.status === 'Late').length;

  return (
    <>
      <TopBar>
        <NotifWrapper ref={notifRef}>
          <NotifButton onClick={() => setNotifOpen(v => !v)}>
            <Bell size={20} strokeWidth={2.5} />
            {notifications.length > 0 && <NotifBadge>{notifications.length > 9 ? '9+' : notifications.length}</NotifBadge>}
          </NotifButton>
          {notifOpen && (
            <NotifDropdown>
              <NotifHeader>
                <span>Notifications</span>
                <button onClick={() => setNotifOpen(false)} style={{ background: 'none', color: '#55433c' }}><X size={16} /></button>
              </NotifHeader>
              <NotifList>
                {notifications.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#55433c', fontSize: '0.85rem' }}>No notifications</div>
                )}
                {notifications.map(n => (
                  <NotifItem key={n.id} $unread={n.type === 'overdue'} onClick={() => { setNotifOpen(false); navigate(`/submissions?assignment=${n.assignmentId}`); }}>
                    <NotifDot $type={n.type} />
                    <NotifContent>
                      <NotifTitle>{n.title}</NotifTitle>
                      <NotifDesc>{n.desc}</NotifDesc>
                    </NotifContent>
                  </NotifItem>
                ))}
              </NotifList>
            </NotifDropdown>
          )}
        </NotifWrapper>
      </TopBar>

      <GreetingSection>
        <Greeting>Welcome back, {user?.name?.split(' ')[0]}!</Greeting>
        <SubGreeting>Your academic journey is rooted in growth and excellence.</SubGreeting>
      </GreetingSection>

      <StatGrid>
        <StatCard>
          <StatLabel>Total Assignments</StatLabel>
          <StatValue className="data-tabular">{assignments.length}</StatValue>
        </StatCard>
        <StatCard color="#daa520">
          <StatLabel>Submitted</StatLabel>
          <StatValue className="data-tabular">{studentSubmissions.length}</StatValue>
        </StatCard>
        <StatCard color="#4a7c59">
          <StatLabel>Graded</StatLabel>
          <StatValue className="data-tabular">{graded}</StatValue>
        </StatCard>
      </StatGrid>

      <TabsRow>
        <TabBtn $active={activeTab === 'todo'} onClick={() => setActiveTab('todo')}>
          <ListChecks size={18} /> Todo ({todoAssignments.length})
        </TabBtn>
        <TabBtn $active={activeTab === 'submitted'} onClick={() => setActiveTab('submitted')}>
          <Send size={18} /> Submitted ({submittedAssignments.length})
        </TabBtn>
        <TabBtn $active={activeTab === 'overdue'} onClick={() => setActiveTab('overdue')}>
          <AlertCircle size={18} /> Overdue ({overdueAssignments.length})
        </TabBtn>
      </TabsRow>

      {activeTab === 'todo' && renderAssignments(todoAssignments, 'todo')}
      {activeTab === 'submitted' && renderAssignments(submittedAssignments, 'submitted')}
      {activeTab === 'overdue' && renderAssignments(overdueAssignments, 'overdue')}
    </>
  );
};

export default StudentDashboard;
