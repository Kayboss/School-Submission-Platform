import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useCourseStore } from '../../store/courseStore';
import { fetchStudents } from '../../lib/supabaseService';
import {
  Users, BookOpen, FileText, CheckCircle, Clock, AlertCircle,
  ArrowRight, TrendingUp, Award, BarChart2, DownloadCloud, Loader
} from 'lucide-react';
import styled from 'styled-components';
import { exportGradesCsv } from '../../utils/exportCsv';
import { useToastStore } from '../../store/toastStore';

const Container = styled.div` padding: 1rem; `;

const Header = styled.div` margin-bottom: 2.5rem; `;

const Greeting = styled.h1`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const SubGreeting = styled.p`
  font-size: 1.125rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2.5rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.75rem; box-shadow: ${({ theme }) => theme.shadows.medium};
  border-bottom: 4px solid ${({ $accent }) => $accent};
  display: flex; flex-direction: column; gap: 0.5rem;
`;

const StatIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px;
  background: ${({ $accent }) => $accent}15; color: ${({ $accent }) => $accent};
  display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const StatValue = styled.p`
  font-size: 2.5rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main};
  letter-spacing: -2px; line-height: 1;
`;

const SectionRow = styled.div`
  display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem; box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem; font-weight: 800; margin-bottom: 1.25rem; color: ${({ theme }) => theme.colors.text.main};
`;

const BarRow = styled.div` display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; `;
const BarLabel = styled.div` width: 40px; font-size: 0.75rem; font-weight: 800; color: #55433c; text-align: right; `;
const BarTrack = styled.div`
  flex: 1; height: 24px; background: ${({ theme }) => theme.colors.background.alt};
  border-radius: 6px; overflow: hidden; position: relative;
`;
const BarFill = styled.div`
  height: 100%; border-radius: 6px;
  background: ${({ $color }) => $color};
  width: ${({ $pct }) => $pct}%;
  transition: width 0.8s ease;
`;
const BarCount = styled.div`
  width: 30px; font-size: 0.8rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main};
`;

const QuickActionRow = styled.div` display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; `;
const ActionChip = styled.button`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem;
  background: ${({ $color, disabled }) => disabled ? '#ccc' : $color}10; color: ${({ $color, disabled }) => disabled ? '#999' : $color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 700; font-size: 0.8rem; border: none;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover { transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'}; }
`;

const Section = styled.div` margin-bottom: 2rem; `;

const SectionHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem;
  color: ${({ theme }) => theme.colors.text.main};
`;

const ViewAll = styled.button`
  font-size: 0.875rem; font-weight: 700; color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  &:hover { text-decoration: underline; }
`;

const ActivityCard = styled.div`
  background: white; padding: 1.25rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; margin-bottom: 0.75rem;
  display: flex; align-items: center; gap: 1rem;
  border-left: 4px solid ${({ $accent }) => $accent};
  cursor: pointer; transition: all 0.2s;
  &:hover { transform: translateX(4px); }
`;

const ActivityIcon = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${({ $accent }) => $accent}15; color: ${({ $accent }) => $accent};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const ActivityInfo = styled.div` flex: 1; `;
const ActivityTitle = styled.p` font-size: 0.9rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; `;
const ActivityMeta = styled.p` font-size: 0.75rem; color: #55433c; font-weight: 600; margin-top: 2px; `;

const QuickLinkCard = styled.div`
  background: white; padding: 1.5rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border}20;
  display: flex; align-items: center; gap: 1.25rem;
  margin-bottom: 1rem; cursor: pointer; transition: all 0.3s;
  &:hover { transform: translateY(-3px); box-shadow: ${({ theme }) => theme.shadows.large}; }
`;

const QuickIcon = styled.div`
  width: 48px; height: 48px; border-radius: 14px;
  background: ${({ $accent }) => $accent}15; color: ${({ $accent }) => $accent};
  display: flex; align-items: center; justify-content: center;
`;

const QuickInfo = styled.div` flex: 1; `;
const QuickTitle = styled.h4` font-size: 1rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; `;
const QuickMeta = styled.p` font-size: 0.8125rem; color: #55433c; font-weight: 600; `;

const LecturerDashboard = () => {
  const user = useAuthStore(s => s.user);
  const submissions = useSubmissionStore(s => s.submissions);
  const assignments = useAssignmentStore(s => s.assignments);
  const courses = useCourseStore(s => s.courses);
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetchStudents().then(students => setStudentCount(students.length));
  }, []);

  const gradeDist = useMemo(() => {
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

  const maxGradeCount = Math.max(...Object.values(gradeDist), 1);

  const courseStats = useMemo(() => {
    return courses.map(c => {
      const courseSubs = submissions.filter(s => s.courseCode === c.code);
      return {
        ...c,
        total: courseSubs.length,
        graded: courseSubs.filter(s => s.status === 'Graded').length,
        pending: courseSubs.filter(s => s.status === 'Pending').length,
        avgScore: courseSubs.filter(s => s.score != null).length > 0
          ? Math.round(courseSubs.filter(s => s.score != null).reduce((a, s) => a + s.score, 0) / courseSubs.filter(s => s.score != null).length)
          : 0
      };
    });
  }, [courses, submissions]);

  const [isExporting, setIsExporting] = useState(false);

  const handleCsvExport = () => {
    setIsExporting(true);
    exportGradesCsv(submissions);
    addToast('All grades exported as CSV', 'success');
    setTimeout(() => setIsExporting(false), 600);
  };

  const stats = useMemo(() => ({
    students: studentCount,
    courses: courses.length,
    assignments: assignments.length,
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    graded: submissions.filter(s => s.status === 'Graded').length,
    late: submissions.filter(s => s.status === 'Late').length,
  }), [submissions, courses, assignments]);

  const recentSubs = useMemo(() =>
    [...submissions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5),
    [submissions]
  );

  return (
    <Container>
      <Header>
        <Greeting>Welcome back, {user?.name?.split(' ')[0]}!</Greeting>
        <SubGreeting>Here's an overview of your academic system.</SubGreeting>
      </Header>

      <StatsGrid>
        <StatCard $accent="#b35a38">
          <StatIcon $accent="#b35a38"><Users size={24} /></StatIcon>
          <StatLabel>Enrolled Students</StatLabel>
          <StatValue>{stats.students}</StatValue>
        </StatCard>
        <StatCard $accent="#daa520">
          <StatIcon $accent="#daa520"><BookOpen size={24} /></StatIcon>
          <StatLabel>Active Courses</StatLabel>
          <StatValue>{stats.courses}</StatValue>
        </StatCard>
        <StatCard $accent="#4a7c59">
          <StatIcon $accent="#4a7c59"><FileText size={24} /></StatIcon>
          <StatLabel>Assignments</StatLabel>
          <StatValue>{stats.assignments}</StatValue>
        </StatCard>
        <StatCard $accent="#6F240A">
          <StatIcon $accent="#6F240A"><BarChart2 size={24} /></StatIcon>
          <StatLabel>Total Submissions</StatLabel>
          <StatValue>{stats.total}</StatValue>
        </StatCard>
      </StatsGrid>

      <StatsGrid>
        <StatCard $accent="#4a7c59">
          <StatIcon $accent="#4a7c59"><CheckCircle size={24} /></StatIcon>
          <StatLabel>Graded</StatLabel>
          <StatValue>{stats.graded}</StatValue>
        </StatCard>
        <StatCard $accent="#daa520">
          <StatIcon $accent="#daa520"><Clock size={24} /></StatIcon>
          <StatLabel>Pending Review</StatLabel>
          <StatValue>{stats.pending}</StatValue>
        </StatCard>
        <StatCard $accent="#b35a38">
          <StatIcon $accent="#b35a38"><AlertCircle size={24} /></StatIcon>
          <StatLabel>Late Submissions</StatLabel>
          <StatValue>{stats.late}</StatValue>
        </StatCard>
        <StatCard $accent="#b35a38">
          <StatIcon $accent="#b35a38"><TrendingUp size={24} /></StatIcon>
          <StatLabel>Pass Rate</StatLabel>
          <StatValue>{stats.graded > 0 ? Math.round((stats.graded / (stats.graded + stats.pending)) * 100) : 0}%</StatValue>
        </StatCard>
      </StatsGrid>

      <QuickActionRow>
        <ActionChip $color="#4a7c59" onClick={handleCsvExport} disabled={isExporting}>
          {isExporting ? <Loader className="spin" size={16} /> : <DownloadCloud size={16} />} Export All Grades (CSV)
        </ActionChip>
        <ActionChip $color="#b35a38" onClick={() => navigate('/lecturer/submissions')}>
          <BarChart2 size={16} /> View Submissions
        </ActionChip>
      </QuickActionRow>

      <ChartCard>
        <ChartTitle><BarChart2 size={20} color="#b35a38" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Grade Distribution</ChartTitle>
        {Object.entries(gradeDist).map(([label, count]) => (
          <BarRow key={label}>
            <BarLabel>{label.split(' ')[0]}</BarLabel>
            <BarTrack>
              <BarFill $color={
                label.startsWith('A') ? '#4a7c59' :
                label.startsWith('B+') ? '#5a9c6e' :
                label.startsWith('B') ? '#7ab88e' :
                label.startsWith('C+') ? '#daa520' :
                label.startsWith('C') ? '#e0b840' :
                label.startsWith('D') ? '#b35a38' : '#8b3a1f'
              } $pct={(count / maxGradeCount) * 100} />
            </BarTrack>
            <BarCount>{count}</BarCount>
          </BarRow>
        ))}
        {Object.values(gradeDist).every(v => v === 0) && (
          <p style={{ textAlign: 'center', color: '#55433c', fontWeight: 600, padding: '1rem' }}>No graded submissions yet.</p>
        )}
      </ChartCard>

      <ChartCard>
        <ChartTitle><BookOpen size={20} color="#daa520" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Course Performance</ChartTitle>
        {courseStats.map(c => (
          <div key={c.id} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.code}</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#55433c' }}>
                Avg: <span style={{ color: c.avgScore >= 70 ? '#4a7c59' : c.avgScore >= 50 ? '#daa520' : '#b35a38' }}>{c.avgScore}</span>% &middot; {c.graded}/{c.total} graded
              </span>
            </div>
            <BarTrack style={{ height: '12px' }}>
              <BarFill $color="#4a7c59" $pct={c.total > 0 ? (c.graded / c.total) * 100 : 0} />
            </BarTrack>
          </div>
        ))}
      </ChartCard>

      <SectionRow>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle><Clock size={22} color="#b35a38" /> Recent Submissions</SectionTitle>
              <ViewAll onClick={() => navigate('/lecturer/submissions')}>View All <ArrowRight size={16} /></ViewAll>
            </SectionHeader>
            {recentSubs.map(sub => (
              <ActivityCard key={sub.id} $accent={sub.status === 'Graded' ? '#4a7c59' : sub.status === 'Late' ? '#b35a38' : '#daa520'}>
                <ActivityIcon $accent={sub.status === 'Graded' ? '#4a7c59' : sub.status === 'Late' ? '#b35a38' : '#daa520'}>
                  {sub.status === 'Graded' ? <CheckCircle size={20} /> : sub.status === 'Late' ? <AlertCircle size={20} /> : <Clock size={20} />}
                </ActivityIcon>
                <ActivityInfo>
                  <ActivityTitle>{sub.studentName}</ActivityTitle>
                  <ActivityMeta>{sub.courseCode} &middot; {sub.assignmentTitle} &middot; {new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</ActivityMeta>
                </ActivityInfo>
              </ActivityCard>
            ))}
          </Section>
        </div>

        <div>
          <Section>
            <SectionHeader>
              <SectionTitle><Award size={22} color="#b35a38" /> Quick Actions</SectionTitle>
            </SectionHeader>
            <QuickLinkCard onClick={() => navigate('/lecturer/submissions')}>
              <QuickIcon $accent="#b35a38"><FileText size={24} /></QuickIcon>
              <QuickInfo>
                <QuickTitle>Review Submissions</QuickTitle>
                <QuickMeta>{stats.pending} submissions awaiting your review</QuickMeta>
              </QuickInfo>
              <ArrowRight size={20} color="#b35a38" />
            </QuickLinkCard>
            <QuickLinkCard onClick={() => navigate('/lecturer/assignments')}>
              <QuickIcon $accent="#daa520"><BookOpen size={24} /></QuickIcon>
              <QuickInfo>
                <QuickTitle>Create Assignment</QuickTitle>
                <QuickMeta>Post a new assignment for your courses</QuickMeta>
              </QuickInfo>
              <ArrowRight size={20} color="#b35a38" />
            </QuickLinkCard>
            <QuickLinkCard onClick={() => navigate('/lecturer/students')}>
              <QuickIcon $accent="#4a7c59"><Users size={24} /></QuickIcon>
              <QuickInfo>
                <QuickTitle>Student Directory</QuickTitle>
                <QuickMeta>View profiles and stats for {stats.students} students</QuickMeta>
              </QuickInfo>
              <ArrowRight size={20} color="#b35a38" />
            </QuickLinkCard>
            <QuickLinkCard onClick={() => navigate('/courses')}>
              <QuickIcon $accent="#6F240A"><BookOpen size={24} /></QuickIcon>
              <QuickInfo>
                <QuickTitle>Manage Courses</QuickTitle>
                <QuickMeta>{stats.courses} active courses this semester</QuickMeta>
              </QuickInfo>
              <ArrowRight size={20} color="#b35a38" />
            </QuickLinkCard>
          </Section>
        </div>
      </SectionRow>
    </Container>
  );
};

export default LecturerDashboard;
