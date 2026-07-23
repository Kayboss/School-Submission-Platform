import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import {
  Users, BookOpen, FileText, CheckCircle, Clock, AlertCircle,
  Download, BarChart2, Activity, Shield, Calendar, TrendingUp,
  ArrowUpRight, Loader
} from 'lucide-react';

const Container = styled.div` padding: 1rem; `;
const Header = styled.div` margin-bottom: 2rem; `;
const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;
const Subtitle = styled.p` color: ${({ theme }) => theme.colors.text.muted}; font-size: 1.125rem; font-weight: 500; `;

const Tabs = styled.div`
  display: flex; gap: 0.5rem; margin-bottom: 2rem;
  background: white; padding: 0.5rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small}; overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border}20;
`;
const Tab = styled.button`
  padding: 0.75rem 1.25rem; border-radius: 8px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#55433c'};
  font-weight: 800; font-size: 0.8rem; white-space: nowrap;
  display: flex; align-items: center; gap: 0.5rem;
  &:hover { background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.background.alt}; }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;
const StatCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem; box-shadow: ${({ theme }) => theme.shadows.medium};
  border-bottom: 4px solid ${({ $accent }) => $accent};
  display: flex; flex-direction: column; gap: 0.25rem;
`;
const StatLabel = styled.p` font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${({ theme }) => theme.colors.text.muted}; `;
const StatValue = styled.p` font-size: 2.25rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main}; letter-spacing: -2px; line-height: 1; `;

const ChartCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem; box-shadow: ${({ theme }) => theme.shadows.medium}; margin-bottom: 1.5rem;
`;
const ChartTitle = styled.h3` font-size: 1.125rem; font-weight: 800; margin-bottom: 1.25rem; color: ${({ theme }) => theme.colors.text.main}; `;

const BarRow = styled.div` display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; `;
const BarLabel = styled.div` width: 50px; font-size: 0.75rem; font-weight: 800; color: #55433c; text-align: right; `;
const BarTrack = styled.div` flex: 1; height: 24px; background: ${({ theme }) => theme.colors.background.alt}; border-radius: 6px; overflow: hidden; `;
const BarFill = styled.div` height: 100%; border-radius: 6px; background: ${({ $color }) => $color}; width: ${({ $pct }) => $pct}%; transition: width 0.8s ease; `;
const BarCount = styled.div` width: 30px; font-size: 0.8rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main}; `;

const TableContainer = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}20;
  @media (max-width: 768px) { overflow-x: auto; }
`;
const Table = styled.table` width: 100%; border-collapse: collapse; text-align: left; min-width: 600px; `;
const Th = styled.th`
  padding: 1rem 1.25rem; background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border}20;
`;
const Td = styled.td`
  padding: 1rem 1.25rem; font-size: 0.875rem; color: ${({ theme }) => theme.colors.text.main};
  font-weight: 600; border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt};
`;
const Tr = styled.tr` transition: background 0.2s; &:hover { background: ${({ theme }) => theme.colors.background.alt}50; } `;

const ActionBtn = styled.button`
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-radius: 8px;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  color: white; font-weight: 700; font-size: 0.8rem;
  &:hover { transform: translateY(-2px); }
`;

const RoleBadge = styled.span`
  padding: 0.25rem 0.625rem; border-radius: 6px;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
  background: ${({ $role }) =>
    $role === 'admin' ? '#6d28d915' :
    $role === 'lecturer' ? '#daa52015' : '#4a7c5915'};
  color: ${({ $role }) =>
    $role === 'admin' ? '#6d28d9' :
    $role === 'lecturer' ? '#daa520' : '#4a7c59'};
`;

const SectionRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const AdminDashboard = () => {
  const user = useAuthStore(s => s.user);
  const addToast = useToastStore(s => s.addToast);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, a, s, sub, ass, cor] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('user_sessions').select('*').order('login_at', { ascending: false }).limit(500),
        supabase.from('submissions').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('courses').select('*'),
      ]);
      setProfiles(p.data || []);
      setActivityLogs(a.data || []);
      setSessions(s.data || []);
      setSubmissions(sub.data || []);
      setAssignments(ass.data || []);
      setCourses(cor.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => ({
    totalUsers: profiles.length,
    students: profiles.filter(p => p.role === 'student').length,
    lecturers: profiles.filter(p => p.role === 'lecturer').length,
    admins: profiles.filter(p => p.role === 'admin').length,
    totalSubmissions: submissions.length,
    graded: submissions.filter(s => s.status === 'Graded').length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    late: submissions.filter(s => s.status === 'Late').length,
    totalAssignments: assignments.length,
    totalCourses: courses.length,
    totalSessions: sessions.length,
    avgScore: submissions.filter(s => s.score != null).length > 0
      ? Math.round(submissions.filter(s => s.score != null).reduce((a, s) => a + s.score, 0) / submissions.filter(s => s.score != null).length)
      : 0
  }), [profiles, submissions, assignments, courses, sessions]);

  const actionBreakdown = useMemo(() => {
    const counts = {};
    activityLogs.forEach(l => { counts[l.action] = (counts[l.action] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [activityLogs]);

  const maxActionCount = Math.max(...actionBreakdown.map(([, c]) => c), 1);

  const scoreDist = useMemo(() => {
    const graded = submissions.filter(s => s.score != null);
    return {
      'A (90-100)': graded.filter(s => s.score >= 90).length,
      'B+ (80-89)': graded.filter(s => s.score >= 80 && s.score < 90).length,
      'B (70-79)': graded.filter(s => s.score >= 70 && s.score < 80).length,
      'C+ (60-69)': graded.filter(s => s.score >= 60 && s.score < 70).length,
      'C (50-59)': graded.filter(s => s.score >= 50 && s.score < 60).length,
      'D (40-49)': graded.filter(s => s.score >= 40 && s.score < 50).length,
      'F (0-39)': graded.filter(s => s.score < 40).length,
    };
  }, [submissions]);

  const maxScoreCount = Math.max(...Object.values(scoreDist), 1);

  const courseStats = useMemo(() => {
    return courses.map(c => {
      const cs = submissions.filter(s => s.course_code === c.code);
      return {
        code: c.code,
        name: c.name,
        total: cs.length,
        graded: cs.filter(s => s.status === 'Graded').length,
        avg: cs.filter(s => s.score != null).length > 0
          ? Math.round(cs.filter(s => s.score != null).reduce((a, s) => a + s.score, 0) / cs.filter(s => s.score != null).length)
          : 0
      };
    });
  }, [courses, submissions]);

  const dailyActivity = useMemo(() => {
    const days = {};
    activityLogs.forEach(l => {
      const day = new Date(l.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).slice(-14);
  }, [activityLogs]);

  const maxDailyActivity = Math.max(...dailyActivity.map(([, c]) => c), 1);

  const userMap = useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.id] = p.name || p.email || p.id?.slice(0, 8) + '...'; });
    return map;
  }, [profiles]);

  const getUserName = (userId) => userMap[userId] || userId?.slice(0, 8) + '...';

  const deviceBreakdown = useMemo(() => {
    const devices = {};
    const browsers = {};
    const locations = {};
    sessions.forEach(s => {
      const m = s.metadata || {};
      if (m.device) devices[m.device] = (devices[m.device] || 0) + 1;
      if (m.browser) browsers[m.browser] = (browsers[m.browser] || 0) + 1;
      if (m.city) locations[m.city] = (locations[m.city] || 0) + 1;
    });
    return { devices, browsers, locations };
  }, [sessions]);

  const maxDeviceCount = Math.max(...Object.values(deviceBreakdown.devices), 1);
  const maxBrowserCount = Math.max(...Object.values(deviceBreakdown.browsers), 1);

  const exportCsv = (data, filename) => {
    if (!data.length) { addToast('No data to export', 'error'); return; }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    addToast(`${filename} downloaded`, 'success');
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '5rem', color: '#55433c' }}>
          <Loader className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700 }}>Loading admin data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Analytics</Title>
        <Subtitle>Platform usage analytics and data export for research analysis.</Subtitle>
      </Header>

      <Tabs>
        <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <BarChart2 size={14} /> Overview
        </Tab>
        <Tab $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <Users size={14} /> Users
        </Tab>
        <Tab $active={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')}>
          <FileText size={14} /> Submissions
        </Tab>
        <Tab $active={activeTab === 'grading'} onClick={() => setActiveTab('grading')}>
          <CheckCircle size={14} /> Grading
        </Tab>
        <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
          <Activity size={14} /> Activity Log
        </Tab>
        <Tab $active={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>
          <Shield size={14} /> Devices
        </Tab>
        <Tab $active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
          <Download size={14} /> Export
        </Tab>
      </Tabs>

      {activeTab === 'overview' && (
        <>
          <StatsGrid>
            <StatCard $accent="#b35a38"><StatLabel>Total Users</StatLabel><StatValue>{stats.totalUsers}</StatValue></StatCard>
            <StatCard $accent="#daa520"><StatLabel>Submissions</StatLabel><StatValue>{stats.totalSubmissions}</StatValue></StatCard>
            <StatCard $accent="#4a7c59"><StatLabel>Avg Score</StatLabel><StatValue>{stats.avgScore}%</StatValue></StatCard>
            <StatCard $accent="#6F240A"><StatLabel>Sessions</StatLabel><StatValue>{stats.totalSessions}</StatValue></StatCard>
          </StatsGrid>

          <SectionRow>
            <ChartCard>
              <ChartTitle>Daily Activity (Last 14 Days)</ChartTitle>
              {dailyActivity.map(([day, count]) => (
                <BarRow key={day}>
                  <BarLabel>{day}</BarLabel>
                  <BarTrack><BarFill $color="#b35a38" $pct={(count / maxDailyActivity) * 100} /></BarTrack>
                  <BarCount>{count}</BarCount>
                </BarRow>
              ))}
            </ChartCard>

            <ChartCard>
              <ChartTitle>Platform Actions</ChartTitle>
              {actionBreakdown.map(([action, count]) => (
                <BarRow key={action}>
                  <BarLabel style={{ width: '100px', fontSize: '0.7rem' }}>{action.replace(/_/g, ' ')}</BarLabel>
                  <BarTrack><BarFill $color="#4a7c59" $pct={(count / maxActionCount) * 100} /></BarTrack>
                  <BarCount>{count}</BarCount>
                </BarRow>
              ))}
            </ChartCard>
          </SectionRow>

          <ChartCard>
            <ChartTitle>Submissions by Course</ChartTitle>
            {courseStats.map(c => (
              <BarRow key={c.code}>
                <BarLabel style={{ width: '70px' }}>{c.code}</BarLabel>
                <BarTrack><BarFill $color="#daa520" $pct={stats.totalSubmissions > 0 ? (c.total / stats.totalSubmissions) * 100 : 0} /></BarTrack>
                <BarCount>{c.total}</BarCount>
              </BarRow>
            ))}
          </ChartCard>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <StatsGrid>
            <StatCard $accent="#4a7c59"><StatLabel>Students</StatLabel><StatValue>{stats.students}</StatValue></StatCard>
            <StatCard $accent="#daa520"><StatLabel>Lecturers</StatLabel><StatValue>{stats.lecturers}</StatValue></StatCard>
            <StatCard $accent="#6d28d9"><StatLabel>Admins</StatLabel><StatValue>{stats.admins}</StatValue></StatCard>
            <StatCard $accent="#b35a38"><StatLabel>Login Sessions</StatLabel><StatValue>{stats.totalSessions}</StatValue></StatCard>
          </StatsGrid>

          <TableContainer>
            <Table>
              <thead><tr><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th></tr></thead>
              <tbody>
                {profiles.map(p => (
                  <Tr key={p.id}>
                    <Td style={{ fontWeight: 800 }}>{p.name}</Td>
                    <Td>{p.email}</Td>
                    <Td><RoleBadge $role={p.role}>{p.role}</RoleBadge></Td>
                    <Td>{new Date(p.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</Td>
                  </Tr>
                ))}
                {profiles.length === 0 && <tr><Td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#55433c' }}>No users found.</Td></tr>}
              </tbody>
            </Table>
          </TableContainer>

          <ChartCard style={{ marginTop: '1.5rem' }}>
            <ChartTitle>Recent Sessions</ChartTitle>
            <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
              <Table $minWidth="800px">
                <thead><tr><Th>User</Th><Th>Login</Th><Th>Logout</Th><Th>Duration</Th><Th>Device</Th><Th>Browser</Th><Th>Location</Th></tr></thead>
                <tbody>
                  {sessions.slice(0, 20).map(s => {
                    const m = s.metadata || {};
                    return (
                      <Tr key={s.id}>
                        <Td style={{ fontWeight: 800 }}>{getUserName(s.user_id)}</Td>
                        <Td style={{ fontSize: '0.8rem' }}>{new Date(s.login_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Td>
                        <Td style={{ fontSize: '0.8rem' }}>{s.logout_at ? new Date(s.logout_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</Td>
                        <Td>{s.duration_seconds != null ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : '—'}</Td>
                        <Td>{m.device || '—'}</Td>
                        <Td>{m.browser || '—'}</Td>
                        <Td style={{ fontSize: '0.8rem' }}>{m.city ? `${m.city}, ${m.country}` : '—'}</Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
          </ChartCard>
        </>
      )}

      {activeTab === 'submissions' && (
        <>
          <StatsGrid>
            <StatCard $accent="#4a7c59"><StatLabel>Graded</StatLabel><StatValue>{stats.graded}</StatValue></StatCard>
            <StatCard $accent="#daa520"><StatLabel>Pending</StatLabel><StatValue>{stats.pending}</StatValue></StatCard>
            <StatCard $accent="#b35a38"><StatLabel>Late</StatLabel><StatValue>{stats.late}</StatValue></StatCard>
            <StatCard $accent="#6F240A"><StatLabel>Avg Score</StatLabel><StatValue>{stats.avgScore}%</StatValue></StatCard>
          </StatsGrid>

          <ChartCard>
            <ChartTitle>Score Distribution</ChartTitle>
            {Object.entries(scoreDist).map(([grade, count]) => (
              <BarRow key={grade}>
                <BarLabel>{grade}</BarLabel>
                <BarTrack><BarFill $color="#b35a38" $pct={(count / maxScoreCount) * 100} /></BarTrack>
                <BarCount>{count}</BarCount>
              </BarRow>
            ))}
          </ChartCard>

          <ChartCard>
            <ChartTitle>Submissions by Course</ChartTitle>
            {courseStats.map(c => (
              <BarRow key={c.code}>
                <BarLabel style={{ width: '70px' }}>{c.code}</BarLabel>
                <BarTrack><BarFill $color="#daa520" $pct={stats.totalSubmissions > 0 ? (c.total / stats.totalSubmissions) * 100 : 0} /></BarTrack>
                <BarCount>{c.total} <span style={{ fontSize: '0.65rem', color: '#55433c' }}>({c.avg}%)</span></BarCount>
              </BarRow>
            ))}
          </ChartCard>
        </>
      )}

      {activeTab === 'grading' && (
        <>
          <ChartCard>
            <ChartTitle>Score Distribution</ChartTitle>
            {Object.entries(scoreDist).map(([grade, count]) => (
              <BarRow key={grade}>
                <BarLabel>{grade}</BarLabel>
                <BarTrack><BarFill $color="#4a7c59" $pct={(count / maxScoreCount) * 100} /></BarTrack>
                <BarCount>{count}</BarCount>
              </BarRow>
            ))}
          </ChartCard>

          <TableContainer>
            <Table>
              <thead><tr><Th>Course</Th><Th>Total Subs</Th><Th>Graded</Th><Th>Avg Score</Th></tr></thead>
              <tbody>
                {courseStats.map(c => (
                  <Tr key={c.code}>
                    <Td style={{ fontWeight: 800 }}>{c.code} — {c.name}</Td>
                    <Td>{c.total}</Td>
                    <Td>{c.graded}</Td>
                    <Td><span style={{ fontWeight: 900, color: c.avg >= 70 ? '#4a7c59' : c.avg >= 50 ? '#daa520' : '#b35a38' }}>{c.avg}%</span></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 'activity' && (
        <TableContainer>
          <Table $minWidth="900px">
            <thead><tr><Th>Time</Th><Th>User</Th><Th>Action</Th><Th>Device</Th><Th>Browser</Th><Th>Location</Th></tr></thead>
            <tbody>
              {activityLogs.slice(0, 100).map(l => {
                const m = l.metadata || {};
                return (
                  <Tr key={l.id}>
                    <Td style={{ fontSize: '0.8rem' }}>{new Date(l.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Td>
                    <Td style={{ fontWeight: 800 }}>{getUserName(l.user_id)}</Td>
                    <Td><span style={{ fontWeight: 800, color: '#b35a38' }}>{l.action?.replace(/_/g, ' ')}</span></Td>
                    <Td>{m.device || '—'}</Td>
                    <Td>{m.browser || '—'}</Td>
                    <Td style={{ fontSize: '0.8rem' }}>{m.city ? `${m.city}, ${m.country}` : '—'}</Td>
                  </Tr>
                );
              })}
              {activityLogs.length === 0 && <tr><Td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#55433c' }}>No activity recorded yet.</Td></tr>}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 'devices' && (
        <>
          <StatsGrid>
            <StatCard $accent="#b35a38"><StatLabel>Desktop</StatLabel><StatValue>{deviceBreakdown.devices.Desktop || 0}</StatValue></StatCard>
            <StatCard $accent="#daa520"><StatLabel>Mobile</StatLabel><StatValue>{deviceBreakdown.devices.Mobile || 0}</StatValue></StatCard>
            <StatCard $accent="#4a7c59"><StatLabel>Tablet</StatLabel><StatValue>{deviceBreakdown.devices.Tablet || 0}</StatValue></StatCard>
            <StatCard $accent="#6F240A"><StatLabel>Total Sessions</StatLabel><StatValue>{sessions.length}</StatValue></StatCard>
          </StatsGrid>

          <SectionRow>
            <ChartCard>
              <ChartTitle>Device Types</ChartTitle>
              {Object.entries(deviceBreakdown.devices).map(([device, count]) => (
                <BarRow key={device}>
                  <BarLabel>{device}</BarLabel>
                  <BarTrack><BarFill $color="#b35a38" $pct={(count / maxDeviceCount) * 100} /></BarTrack>
                  <BarCount>{count}</BarCount>
                </BarRow>
              ))}
              {Object.keys(deviceBreakdown.devices).length === 0 && <p style={{ color: '#55433c', fontWeight: 600 }}>No device data yet.</p>}
            </ChartCard>

            <ChartCard>
              <ChartTitle>Browsers</ChartTitle>
              {Object.entries(deviceBreakdown.browsers).map(([browser, count]) => (
                <BarRow key={browser}>
                  <BarLabel>{browser}</BarLabel>
                  <BarTrack><BarFill $color="#4a7c59" $pct={(count / maxBrowserCount) * 100} /></BarTrack>
                  <BarCount>{count}</BarCount>
                </BarRow>
              ))}
              {Object.keys(deviceBreakdown.browsers).length === 0 && <p style={{ color: '#55433c', fontWeight: 600 }}>No browser data yet.</p>}
            </ChartCard>
          </SectionRow>

          <ChartCard>
            <ChartTitle>Locations</ChartTitle>
            {Object.entries(deviceBreakdown.locations).map(([loc, count]) => (
              <BarRow key={loc}>
                <BarLabel style={{ width: '120px' }}>{loc}</BarLabel>
                <BarTrack><BarFill $color="#daa520" $pct={(count / sessions.length) * 100} /></BarTrack>
                <BarCount>{count}</BarCount>
              </BarRow>
            ))}
            {Object.keys(deviceBreakdown.locations).length === 0 && <p style={{ color: '#55433c', fontWeight: 600 }}>No location data yet.</p>}
          </ChartCard>

          <TableContainer>
            <Table $minWidth="900px">
              <thead><tr><Th>User</Th><Th>Login</Th><Th>Duration</Th><Th>Device</Th><Th>Browser</Th><Th>OS</Th><Th>Location</Th></tr></thead>
              <tbody>
                {sessions.map(s => {
                  const m = s.metadata || {};
                  return (
                    <Tr key={s.id}>
                      <Td style={{ fontWeight: 800 }}>{getUserName(s.user_id)}</Td>
                      <Td style={{ fontSize: '0.8rem' }}>{new Date(s.login_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Td>
                      <Td>{s.duration_seconds != null ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : '—'}</Td>
                      <Td>{m.device || '—'}</Td>
                      <Td>{m.browser || '—'}</Td>
                      <Td>{m.os || '—'}</Td>
                      <Td style={{ fontSize: '0.8rem' }}>{m.city ? `${m.city}, ${m.region}, ${m.country}` : '—'}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 'export' && (
        <>
          <StatsGrid>
            <StatCard $accent="#b35a38">
              <StatLabel>Users</StatLabel>
              <StatValue>{profiles.length}</StatValue>
              <ActionBtn $color="#b35a38" onClick={() => exportCsv(profiles.map(p => ({ id: p.id, name: p.name, email: p.email, role: p.role, institution: p.institution, created_at: p.created_at })), 'users.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Users
              </ActionBtn>
            </StatCard>
            <StatCard $accent="#daa520">
              <StatLabel>Submissions</StatLabel>
              <StatValue>{submissions.length}</StatValue>
              <ActionBtn $color="#daa520" onClick={() => exportCsv(submissions.map(s => ({ id: s.id, student_name: s.student_name, student_id: s.student_id, course_code: s.course_code, assignment_title: s.assignment_title, score: s.score, status: s.status, is_late: s.is_late, timestamp: s.timestamp, semester: s.semester })), 'submissions.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Submissions
              </ActionBtn>
            </StatCard>
            <StatCard $accent="#4a7c59">
              <StatLabel>Assignments</StatLabel>
              <StatValue>{assignments.length}</StatValue>
              <ActionBtn $color="#4a7c59" onClick={() => exportCsv(assignments.map(a => ({ id: a.id, title: a.title, course_code: a.course_code, lecturer_name: a.lecturer_name, due_date: a.due_date, late_penalty: a.late_penalty })), 'assignments.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Assignments
              </ActionBtn>
            </StatCard>
            <StatCard $accent="#6F240A">
              <StatLabel>Activity Logs</StatLabel>
              <StatValue>{activityLogs.length}</StatValue>
              <ActionBtn $color="#6F240A" onClick={() => exportCsv(activityLogs.map(l => ({ user: getUserName(l.user_id), action: l.action, entity_type: l.entity_type, entity_id: l.entity_id, device: (l.metadata || {}).device, browser: (l.metadata || {}).browser, location: (l.metadata || {}).city ? `${(l.metadata || {}).city}, ${(l.metadata || {}).country}` : '', created_at: l.created_at })), 'activity_log.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Activity
              </ActionBtn>
            </StatCard>
          </StatsGrid>

          <StatsGrid style={{ gridTemplateColumns: '1fr 1fr' }}>
            <StatCard $accent="#6d28d9">
              <StatLabel>Sessions</StatLabel>
              <StatValue>{sessions.length}</StatValue>
              <ActionBtn $color="#6d28d9" onClick={() => exportCsv(sessions.map(s => ({ id: s.id, user: getUserName(s.user_id), device: (s.metadata || {}).device, browser: (s.metadata || {}).browser, os: (s.metadata || {}).os, city: (s.metadata || {}).city, country: (s.metadata || {}).country, login_at: s.login_at, logout_at: s.logout_at, duration_seconds: s.duration_seconds })), 'sessions.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Sessions
              </ActionBtn>
            </StatCard>
            <StatCard $accent="#1e40af">
              <StatLabel>Courses</StatLabel>
              <StatValue>{courses.length}</StatValue>
              <ActionBtn $color="#1e40af" onClick={() => exportCsv(courses.map(c => ({ id: c.id, code: c.code, name: c.name, instructor: c.instructor })), 'courses.csv')} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Courses
              </ActionBtn>
            </StatCard>
          </StatsGrid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
