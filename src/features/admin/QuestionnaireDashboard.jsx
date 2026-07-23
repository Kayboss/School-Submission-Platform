import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import { Download, Filter, ChevronDown, Users, ClipboardList, TrendingUp, AlertTriangle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToastStore } from '../../store/toastStore';

const COLORS = {
  primary: '#b35a38',
  secondary: '#daa520',
  tertiary: '#4a7c59',
  purple: '#6d28d9',
  blue: '#1e40af',
  deepRed: '#6F240A',
};

const PIE_COLORS = ['#b35a38', '#daa520', '#4a7c59', '#6d28d9', '#1e40af', '#6F240A', '#e0944a', '#7ab88a'];

const LIKERT_LABELS = ['SA', 'A', 'N', 'D', 'SD'];
const LIKERT_STATEMENTS = [
  'Flash drives are my main storage device.',
  'I frequently worry about losing my files.',
  'Managing multiple assignment files is difficult.',
  'Retrieving previously submitted assignments is difficult.',
  'Buying flash drives increases my academic expenses.',
  'CD submission is no longer practical.',
  'There is no centralized repository for students\' work.',
  'Existing submission methods are inefficient.',
  'I would prefer an online submission system.',
  'A centralized online repository would improve academic work management.',
];

const LIKERT_COLORS = { SA: '#4a7c59', A: '#7ab88a', N: '#daa520', D: '#e0944a', SD: '#b35a38' };

const Container = styled.div``;
const SubTabs = styled.div`
  display: flex; gap: 0.4rem; margin-bottom: 2rem; flex-wrap: wrap;
  background: white; padding: 0.4rem; border-radius: 12px;
  box-shadow: 0 2px 4px rgba(179, 90, 56, 0.05); border: 1px solid #dbc1b820;
`;
const SubTab = styled.button`
  padding: 0.6rem 1rem; border-radius: 8px;
  background: ${({ $active }) => $active ? '#b35a38' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#55433c'};
  font-weight: 700; font-size: 0.75rem; white-space: nowrap;
  &:hover { background: ${({ $active }) => $active ? '#b35a38' : '#f0ede9'}; }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;
const StatCard = styled.div`
  background: white; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(179, 90, 56, 0.08);
  border-bottom: 4px solid ${({ $accent }) => $accent};
  display: flex; flex-direction: column; gap: 0.25rem;
`;
const StatLabel = styled.p` font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #55433c; `;
const StatValue = styled.p` font-size: 2.25rem; font-weight: 900; color: #1c1c19; letter-spacing: -2px; line-height: 1; `;

const ChartCard = styled.div`
  background: white; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(179, 90, 56, 0.08); margin-bottom: 1.5rem;
`;
const ChartTitle = styled.h3` font-size: 1.125rem; font-weight: 800; margin-bottom: 1.25rem; color: #1c1c19; `;

const SectionRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const SectionRow3 = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;
  @media (max-width: 1100px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const TableContainer = styled.div`
  background: white; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(179, 90, 56, 0.08); overflow: hidden; border: 1px solid #dbc1b820;
`;
const Table = styled.table` width: 100%; border-collapse: collapse; text-align: left; `;
const Th = styled.th`
  padding: 0.85rem 1rem; background: #f0ede9;
  color: #55433c; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 2px solid #dbc1b820; white-space: nowrap;
`;
const Td = styled.td`
  padding: 0.75rem 1rem; font-size: 0.8rem; color: #1c1c19;
  font-weight: 600; border-bottom: 1px solid #f0ede9;
`;
const Tr = styled.tr` transition: background 0.2s; &:hover { background: #f0ede950; } `;

const ActionBtn = styled.button`
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.25rem; border-radius: 8px;
  background: ${({ $color }) => $color || '#b35a38'};
  color: white; font-weight: 700; font-size: 0.8rem;
  &:hover { transform: translateY(-2px); transition: transform 0.2s; }
`;

const FilterRow = styled.div`
  display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;
`;
const Select = styled.select`
  padding: 0.55rem 0.85rem; border-radius: 8px; border: 1.5px solid #dbc1b8;
  background: white; font-weight: 600; font-size: 0.8rem; color: #1c1c19;
  &:focus { outline: none; border-color: #b35a38; }
`;

const BarRow = styled.div` display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; `;
const BarLabel = styled.div` width: 50px; font-size: 0.75rem; font-weight: 800; color: #55433c; text-align: right; `;
const BarTrack = styled.div` flex: 1; height: 24px; background: #f0ede9; border-radius: 6px; overflow: hidden; `;
const BarFill = styled.div` height: 100%; border-radius: 6px; background: ${({ $color }) => $color}; width: ${({ $pct }) => $pct}%; transition: width 0.8s ease; `;
const BarCount = styled.div` width: 30px; font-size: 0.8rem; font-weight: 900; color: #1c1c19; `;

const LikertBarRow = styled.div` margin-bottom: 1rem; `;
const LikertBarLabel = styled.p` font-size: 0.75rem; font-weight: 700; color: #55433c; margin-bottom: 0.4rem; `;
const LikertBarOuter = styled.div` display: flex; height: 28px; border-radius: 6px; overflow: hidden; `;
const LikertBarSegment = styled.div`
  height: 100%; transition: width 0.6s ease;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 800; color: white; min-width: ${({ $show }) => $show ? '24px' : '0'};
`;

const QuestionnaireDashboard = () => {
  const addToast = useToastStore(s => s.addToast);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [postInterviewResponses, setPostInterviewResponses] = useState([]);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [rr, p, pir] = await Promise.all([
        supabase.from('research_responses').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('post_interview_responses').select('*').order('created_at', { ascending: false }),
      ]);
      setResponses(rr.data || []);
      setProfiles(p.data || []);
      setPostInterviewResponses(pir.data || []);
      setLoading(false);
    }
    load();
  }, []);

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
  const [subTab, setSubTab] = useState('overview');
  const [filterSection, setFilterSection] = useState('all');
  const [filterKey, setFilterKey] = useState('all');
  const [filterAnswer, setFilterAnswer] = useState('all');
  const [crossDemo, setCrossDemo] = useState('age');

  const students = useMemo(() => profiles.filter(p => p.role === 'student'), [profiles]);

  const pivoted = useMemo(() => {
    const map = {};
    responses.forEach(r => {
      if (!map[r.user_id]) map[r.user_id] = { user_id: r.user_id, created_at: r.created_at };
      map[r.user_id][r.question_key] = r.answer;
      if (!map[r.user_id]._firstResponse || new Date(r.created_at) < new Date(map[r.user_id]._firstResponse)) {
        map[r.user_id]._firstResponse = r.created_at;
      }
      if (!map[r.user_id]._lastResponse || new Date(r.created_at) > new Date(map[r.user_id]._lastResponse)) {
        map[r.user_id]._lastResponse = r.created_at;
      }
    });
    return Object.values(map);
  }, [responses]);

  const profileMap = useMemo(() => {
    const m = {};
    profiles.forEach(p => { m[p.id] = p; });
    return m;
  }, [profiles]);

  const totalStudents = students.length;
  const completedOnboard = students.filter(s => s.onboarding_completed).length;
  const completionRate = totalStudents > 0 ? Math.round((completedOnboard / totalStudents) * 100) : 0;

  const completionsOverTime = useMemo(() => {
    const days = {};
    pivoted.forEach(r => {
      if (r.created_at) {
        const day = new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
        days[day] = (days[day] || 0) + 1;
      }
    });
    const uniquePerDay = {};
    responses.forEach(r => {
      const day = new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
      if (!uniquePerDay[day]) uniquePerDay[day] = new Set();
      uniquePerDay[day].add(r.user_id);
    });
    return Object.entries(uniquePerDay).map(([day, users]) => ({ day, count: users.size }));
  }, [responses, pivoted]);

  const genderData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.gender) counts[r.gender] = (counts[r.gender] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pivoted]);

  const ageData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.age) counts[r.age] = (counts[r.age] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pivoted]);

  const levelData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.level) counts[r.level] = (counts[r.level] || 0) + 1; });
    const order = ['Level 100', 'Level 200', 'Level 300', 'Level 400'];
    return order.filter(l => counts[l]).map(name => ({ name, value: counts[name] }));
  }, [pivoted]);

  const frequencyData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.submissionFrequency) counts[r.submissionFrequency] = (counts[r.submissionFrequency] || 0) + 1; });
    const order = ['Weekly', 'Bi-weekly', 'Monthly', 'Occasionally'];
    return order.filter(l => counts[l]).map(name => ({ name, value: counts[name] }));
  }, [pivoted]);

  const storageData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.storageMethod) counts[r.storageMethod] = (counts[r.storageMethod] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pivoted]);

  const submissionMethodData = useMemo(() => {
    const counts = {};
    pivoted.forEach(r => { if (r.submissionMethod) counts[r.submissionMethod] = (counts[r.submissionMethod] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pivoted]);

  const yesNoData = useMemo(() => {
    const fields = [
      { key: 'lostAssignment', label: 'Lost an assignment', icon: 'lost' },
      { key: 'corruptedFlash', label: 'Corrupted flash drive', icon: 'corrupt' },
      { key: 'unableRetrieve', label: 'Unable to retrieve old work', icon: 'retrieve' },
    ];
    return fields.map(f => {
      const yes = pivoted.filter(r => r[f.key] === 'Yes').length;
      const no = pivoted.filter(r => r[f.key] === 'No').length;
      const total = yes + no;
      return { ...f, yes, no, total, yesPct: total > 0 ? Math.round((yes / total) * 100) : 0 };
    });
  }, [pivoted]);

  const likertData = useMemo(() => {
    return LIKERT_STATEMENTS.map((stmt, i) => {
      const key = `likert_${i}`;
      const counts = { SA: 0, A: 0, N: 0, D: 0, SD: 0 };
      pivoted.forEach(r => { if (r[key]) counts[r[key]] = (counts[r[key]] || 0) + 1; });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const avg = total > 0
        ? ((counts.SA * 5 + counts.A * 4 + counts.N * 3 + counts.D * 2 + counts.SD * 1) / total).toFixed(2)
        : 0;
      return { statement: stmt, shortLabel: `Q${i + 1}`, ...counts, total, avg: parseFloat(avg) };
    });
  }, [pivoted]);

  const likertRadarData = useMemo(() => {
    return likertData.map(d => ({
      subject: d.shortLabel,
      score: d.avg,
      fullMark: 5,
    }));
  }, [likertData]);

  const crossTabData = useMemo(() => {
    const demoKey = crossDemo;
    const demoOptions = [];
    if (demoKey === 'gender') demoOptions.push(...genderData.map(d => d.name));
    else if (demoKey === 'age') demoOptions.push(...ageData.map(d => d.name));
    else if (demoKey === 'level') demoOptions.push(...levelData.map(d => d.name));
    else if (demoKey === 'submissionFrequency') demoOptions.push(...frequencyData.map(d => d.name));

    return storageData.map(storage => {
      const row = { name: storage.name };
      demoOptions.forEach(opt => {
        row[opt] = pivoted.filter(r => r[demoKey] === opt && r.storageMethod === storage.name).length;
      });
      return row;
    });
  }, [pivoted, crossDemo, storageData, genderData, ageData, levelData, frequencyData]);

  const crossTabDemoOptions = useMemo(() => {
    if (crossDemo === 'gender') return genderData.map(d => d.name);
    if (crossDemo === 'age') return ageData.map(d => d.name);
    if (crossDemo === 'level') return levelData.map(d => d.name);
    if (crossDemo === 'submissionFrequency') return frequencyData.map(d => d.name);
    return [];
  }, [crossDemo, genderData, ageData, levelData, frequencyData]);

  const filteredResponses = useMemo(() => {
    let data = pivoted;
    if (filterSection !== 'all') {
      const sectionKeys = {
        A: ['gender', 'age', 'level', 'submissionFrequency'],
        B: ['storageMethod', 'submissionMethod', 'lostAssignment', 'corruptedFlash', 'unableRetrieve'],
        C: Array.from({ length: 10 }, (_, i) => `likert_${i}`),
      };
      data = data.filter(r => (sectionKeys[filterSection] || []).some(k => r[k]));
    }
    if (filterKey !== 'all') {
      data = data.filter(r => r[filterKey]);
    }
    if (filterAnswer !== 'all') {
      data = data.filter(r => {
        const val = r[filterKey] || '';
        return val === filterAnswer;
      });
    }
    return data;
  }, [pivoted, filterSection, filterKey, filterAnswer]);

  const allQuestionKeys = useMemo(() => {
    return [
      { key: 'gender', label: 'Gender', section: 'A' },
      { key: 'age', label: 'Age', section: 'A' },
      { key: 'level', label: 'Level', section: 'A' },
      { key: 'submissionFrequency', label: 'Submission Frequency', section: 'A' },
      { key: 'storageMethod', label: 'Storage Method', section: 'B' },
      { key: 'submissionMethod', label: 'Submission Method', section: 'B' },
      { key: 'lostAssignment', label: 'Lost Assignment', section: 'B' },
      { key: 'corruptedFlash', label: 'Corrupted Flash', section: 'B' },
      { key: 'unableRetrieve', label: 'Unable to Retrieve', section: 'B' },
      ...LIKERT_STATEMENTS.map((s, i) => ({ key: `likert_${i}`, label: `Q${i + 1}: ${s.slice(0, 40)}...`, section: 'C' })),
    ];
  }, []);

  const filteredKeys = useMemo(() => {
    if (filterSection === 'all') return allQuestionKeys;
    return allQuestionKeys.filter(k => k.section === filterSection);
  }, [filterSection, allQuestionKeys]);

  const exportQuestionnaireData = (data, filename) => {
    exportCsv(data, filename);
  };

  const subTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'storage', label: 'Storage Practices' },
    { id: 'likert', label: 'Likert Scale' },
    { id: 'crosstab', label: 'Cross-Tabulation' },
    { id: 'responses', label: 'Responses' },
    { id: 'post_interview', label: 'Post-Interview' },
    { id: 'export', label: 'Export' },
  ];

  const postPivoted = useMemo(() => {
    const map = {};
    postInterviewResponses.forEach(r => {
      if (!map[r.user_id]) map[r.user_id] = { user_id: r.user_id, role: r.role, created_at: r.created_at };
      map[r.user_id][r.question_key] = r.answer;
    });
    return Object.values(map);
  }, [postInterviewResponses]);

  const postStudentResponses = useMemo(() => postPivoted.filter(r => r.role === 'student'), [postPivoted]);
  const postLecturerResponses = useMemo(() => postPivoted.filter(r => r.role === 'lecturer'), [postPivoted]);

  const POST_LIKERT_LABELS = ['SA', 'A', 'N', 'D', 'SD'];
  const POST_LIKERT_COLORS = { SA: '#4a7c59', A: '#7ab88a', N: '#daa520', D: '#e0944a', SD: '#b35a38' };

  const STUDENT_POST_LIKERT = {
    A: ['The system was easy to learn.', 'The interface was user-friendly.', 'Uploading files was easy.', 'Retrieving files was easy.', 'Navigation between pages was simple.', 'The system responded quickly.'],
    B: ['The system reduced my dependence on flash drives.', 'The system improved assignment submission.', 'My files are easier to locate.', 'The system provides secure storage for assignments.', 'The system improved my organization of academic files.', 'I would continue using this system.'],
    C: ['The system solved the storage problems I previously experienced.', 'The system made retrieval of assignments easier.', 'The system is more convenient than flash drives.', 'The system should replace existing submission methods.', 'Overall, the system improved the management of academic files.'],
  };

  const LECTURER_POST_LIKERT = [
    'The system simplified assignment collection.', 'Organizing student submissions became easier.', 'Retrieving submitted assignments was efficient.',
    'The system reduced administrative workload.', 'The dashboard was easy to use.', 'Student submissions were well organized.',
    'The system is suitable for departmental use.', 'The system improved the management of students\' academic files.', 'I would recommend continued use of the system.',
  ];

  const postStudentLikertData = useMemo(() => {
    const result = {};
    Object.entries(STUDENT_POST_LIKERT).forEach(([section, stmts]) => {
      result[section] = stmts.map((stmt, i) => {
        const prefix = `sa_${i}`;
        const key = section === 'A' ? `sa_${i}` : section === 'B' ? `sb_${i}` : `sc_${i}`;
        const counts = { SA: 0, A: 0, N: 0, D: 0, SD: 0 };
        postStudentResponses.forEach(r => { if (r[key]) counts[r[key]] = (counts[r[key]] || 0) + 1; });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const avg = total > 0 ? ((counts.SA * 5 + counts.A * 4 + counts.N * 3 + counts.D * 2 + counts.SD * 1) / total).toFixed(2) : 0;
        return { statement: stmt, shortLabel: `Q${i + 1}`, ...counts, total, avg: parseFloat(avg) };
      });
    });
    return result;
  }, [postStudentResponses]);

  const postLecturerLikertData = useMemo(() => {
    return LECTURER_POST_LIKERT.map((stmt, i) => {
      const key = `sb_${i}`;
      const counts = { SA: 0, A: 0, N: 0, D: 0, SD: 0 };
      postLecturerResponses.forEach(r => { if (r[key]) counts[r[key]] = (counts[r[key]] || 0) + 1; });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const avg = total > 0 ? ((counts.SA * 5 + counts.A * 4 + counts.N * 3 + counts.D * 2 + counts.SD * 1) / total).toFixed(2) : 0;
      return { statement: stmt, shortLabel: `Q${i + 1}`, ...counts, total, avg: parseFloat(avg) };
    });
  }, [postLecturerResponses]);

  const postSatisfactionData = useMemo(() => {
    const counts = {};
    postStudentResponses.forEach(r => { if (r.satisfaction) counts[r.satisfaction] = (counts[r.satisfaction] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [postStudentResponses]);

  const postRecommendData = useMemo(() => {
    const counts = { Yes: 0, No: 0 };
    postStudentResponses.forEach(r => { if (r.recommend) counts[r.recommend] = (counts[r.recommend] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [postStudentResponses]);

  return (
    <Container>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#55433c' }}>
          <Loader className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700 }}>Loading questionnaire data...</p>
        </div>
      ) : (
      <>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1c1c19', margin: '0 0 0.5rem', letterSpacing: '-1px' }}>
          Questionnaire Analytics
        </h2>
        <p style={{ color: '#55433c', fontSize: '1.125rem', fontWeight: 500 }}>
          Analyze onboarding questionnaire responses from {pivoted.length} students.
        </p>
      </div>
      <SubTabs>
        {subTabs.map(t => (
          <SubTab key={t.id} $active={subTab === t.id} onClick={() => setSubTab(t.id)}>
            {t.label}
          </SubTab>
        ))}
      </SubTabs>

      {subTab === 'overview' && (
        <>
          <StatsGrid>
            <StatCard $accent="#b35a38">
              <StatLabel>Total Respondents</StatLabel>
              <StatValue>{pivoted.length}</StatValue>
            </StatCard>
            <StatCard $accent="#4a7c59">
              <StatLabel>Completion Rate</StatLabel>
              <StatValue>{completionRate}%</StatValue>
            </StatCard>
            <StatCard $accent="#daa520">
              <StatLabel>Completed Onboarding</StatLabel>
              <StatValue>{completedOnboard}</StatValue>
            </StatCard>
            <StatCard $accent="#6d28d9">
              <StatLabel>Pending</StatLabel>
              <StatValue>{totalStudents - completedOnboard}</StatValue>
            </StatCard>
          </StatsGrid>

          <SectionRow>
            <ChartCard>
              <ChartTitle>Completion Status</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: completedOnboard },
                      { name: 'Pending', value: totalStudents - completedOnboard },
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#4a7c59" />
                    <Cell fill="#dbc1b8" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Completions Over Time</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={completionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#b35a38" strokeWidth={2.5} dot={{ fill: '#b35a38', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionRow>

          <ChartCard>
            <ChartTitle>Section Completion Summary</ChartTitle>
            <BarRow>
              <BarLabel style={{ width: '100px' }}>Section A</BarLabel>
              <BarTrack><BarFill $color="#b35a38" $pct={pivoted.length > 0 ? (pivoted.filter(r => r.gender).length / pivoted.length) * 100 : 0} /></BarTrack>
              <BarCount>{pivoted.filter(r => r.gender).length}</BarCount>
            </BarRow>
            <BarRow>
              <BarLabel style={{ width: '100px' }}>Section B</BarLabel>
              <BarTrack><BarFill $color="#daa520" $pct={pivoted.length > 0 ? (pivoted.filter(r => r.storageMethod).length / pivoted.length) * 100 : 0} /></BarTrack>
              <BarCount>{pivoted.filter(r => r.storageMethod).length}</BarCount>
            </BarRow>
            <BarRow>
              <BarLabel style={{ width: '100px' }}>Section C</BarLabel>
              <BarTrack><BarFill $color="#4a7c59" $pct={pivoted.length > 0 ? (pivoted.filter(r => r.likert_0).length / pivoted.length) * 100 : 0} /></BarTrack>
              <BarCount>{pivoted.filter(r => r.likert_0).length}</BarCount>
            </BarRow>
          </ChartCard>
        </>
      )}

      {subTab === 'demographics' && (
        <>
          <SectionRow3>
            <ChartCard>
              <ChartTitle>Gender Distribution</ChartTitle>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Age Distribution</ChartTitle>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#b35a38" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Level Distribution</ChartTitle>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={levelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4a7c59" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionRow3>

          <ChartCard>
            <ChartTitle>Submission Frequency</ChartTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={frequencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#daa520" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Demographics Summary Table</ChartTitle>
            <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>Question</Th>
                    <Th>Option</Th>
                    <Th>Count</Th>
                    <Th>Percentage</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Gender', data: genderData },
                    { label: 'Age', data: ageData },
                    { label: 'Level', data: levelData },
                    { label: 'Submission Frequency', data: frequencyData },
                  ].map(section => section.data.map((d, i) => (
                    <Tr key={`${section.label}-${d.name}`}>
                      {i === 0 && <Td rowSpan={section.data.length} style={{ fontWeight: 800, verticalAlign: 'top' }}>{section.label}</Td>}
                      <Td>{d.name}</Td>
                      <Td>{d.value}</Td>
                      <Td>{pivoted.length > 0 ? Math.round((d.value / pivoted.length) * 100) : 0}%</Td>
                    </Tr>
                  )))}
                </tbody>
              </Table>
            </TableContainer>
          </ChartCard>
        </>
      )}

      {subTab === 'storage' && (
        <>
          <StatsGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {yesNoData.map(d => (
              <StatCard key={d.key} $accent={d.yesPct > 50 ? '#b35a38' : '#4a7c59'}>
                <StatLabel>{d.label}</StatLabel>
                <StatValue>{d.yesPct}%</StatValue>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#55433c', marginTop: '0.25rem' }}>
                  {d.yes} of {d.total} said Yes
                </p>
              </StatCard>
            ))}
          </StatsGrid>

          <SectionRow>
            <ChartCard>
              <ChartTitle>Storage Methods</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={storageData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {storageData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Submission Methods</ChartTitle>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={submissionMethodData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {submissionMethodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionRow>

          <ChartCard>
            <ChartTitle>Data Loss &amp; Corruption Experience</ChartTitle>
            {yesNoData.map(d => (
              <div key={d.key} style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1c1c19', marginBottom: '0.5rem' }}>{d.label}</p>
                <div style={{ display: 'flex', gap: '4px', height: '32px', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${d.yesPct}%`, background: '#b35a38', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                    {d.yesPct > 10 ? `Yes ${d.yesPct}%` : ''}
                  </div>
                  <div style={{ width: `${100 - d.yesPct}%`, background: '#4a7c59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                    {100 - d.yesPct > 10 ? `No ${100 - d.yesPct}%` : ''}
                  </div>
                </div>
                <p style={{ fontSize: '0.7rem', color: '#55433c', marginTop: '0.3rem', fontWeight: 600 }}>
                  Yes: {d.yes} responses &middot; No: {d.no} responses &middot; Total: {d.total}
                </p>
              </div>
            ))}
          </ChartCard>

          <ChartCard>
            <ChartTitle>Storage Method by Frequency</ChartTitle>
            <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>Storage Method</Th>
                    <Th>Count</Th>
                    <Th>% of Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {storageData.sort((a, b) => b.value - a.value).map(s => (
                    <Tr key={s.name}>
                      <Td style={{ fontWeight: 800 }}>{s.name}</Td>
                      <Td>{s.value}</Td>
                      <Td>{pivoted.length > 0 ? Math.round((s.value / pivoted.length) * 100) : 0}%</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </ChartCard>
        </>
      )}

      {subTab === 'likert' && (
        <>
          <ChartCard>
            <ChartTitle>Agreement Distribution per Statement</ChartTitle>
            {likertData.map((d, i) => {
              const total = d.total || 1;
              return (
                <LikertBarRow key={i}>
                  <LikertBarLabel>Q{i + 1}. {d.statement}</LikertBarLabel>
                  <LikertBarOuter>
                    {LIKERT_LABELS.map(label => {
                      const pct = (d[label] / total) * 100;
                      return (
                        <LikertBarSegment
                          key={label}
                          $color={LIKERT_COLORS[label]}
                          $show={pct > 5}
                          style={{ width: `${pct}%`, background: LIKERT_COLORS[label] }}
                        >
                          {pct > 8 ? `${label} ${d[label]}` : ''}
                        </LikertBarSegment>
                      );
                    })}
                  </LikertBarOuter>
                </LikertBarRow>
              );
            })}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {LIKERT_LABELS.map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: LIKERT_COLORS[l] }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#55433c' }}>
                    {l === 'SA' ? 'Strongly Agree' : l === 'A' ? 'Agree' : l === 'N' ? 'Neutral' : l === 'D' ? 'Disagree' : 'Strongly Disagree'}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          <SectionRow>
            <ChartCard>
              <ChartTitle>Average Agreement Score per Statement</ChartTitle>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={likertData.map(d => ({ name: d.shortLabel, avg: d.avg }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 800 }} width={35} />
                  <Tooltip formatter={(v) => [v.toFixed(2), 'Avg Score']} />
                  <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                    {likertData.map((d, i) => (
                      <Cell key={i} fill={d.avg >= 3.5 ? '#4a7c59' : d.avg >= 2.5 ? '#daa520' : '#b35a38'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Sentiment Profile (Radar)</ChartTitle>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={likertRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar name="Avg Score" dataKey="score" stroke="#b35a38" fill="#b35a38" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(v) => [v.toFixed(2), 'Avg Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionRow>

          <ChartCard>
            <ChartTitle>Likert Response Counts</ChartTitle>
            <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>Statement</Th>
                    {LIKERT_LABELS.map(l => <Th key={l} style={{ textAlign: 'center' }}>{l}</Th>)}
                    <Th style={{ textAlign: 'center' }}>Avg</Th>
                  </tr>
                </thead>
                <tbody>
                  {likertData.map((d, i) => (
                    <Tr key={i}>
                      <Td style={{ maxWidth: '300px' }}>Q{i + 1}. {d.statement}</Td>
                      {LIKERT_LABELS.map(l => (
                        <Td key={l} style={{ textAlign: 'center', fontWeight: 800, color: LIKERT_COLORS[l] }}>{d[l]}</Td>
                      ))}
                      <Td style={{ textAlign: 'center', fontWeight: 900, color: d.avg >= 3.5 ? '#4a7c59' : d.avg >= 2.5 ? '#daa520' : '#b35a38' }}>
                        {d.avg}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </ChartCard>
        </>
      )}

      {subTab === 'crosstab' && (
        <>
          <FilterRow>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#55433c' }}>Compare storage methods by:</span>
            <Select value={crossDemo} onChange={e => setCrossDemo(e.target.value)}>
              <option value="age">Age Group</option>
              <option value="gender">Gender</option>
              <option value="level">Level</option>
              <option value="submissionFrequency">Submission Frequency</option>
            </Select>
          </FilterRow>

          <ChartCard>
            <ChartTitle>Storage Method by {crossDemo === 'submissionFrequency' ? 'Submission Frequency' : crossDemo.charAt(0).toUpperCase() + crossDemo.slice(1)}</ChartTitle>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={crossTabData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip />
                <Legend />
                {crossTabDemoOptions.map((opt, i) => (
                  <Bar key={opt} dataKey={opt} fill={PIE_COLORS[i % PIE_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Cross-Tabulation Table: Storage Method vs {crossDemo.charAt(0).toUpperCase() + crossDemo.slice(1)}</ChartTitle>
            <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>Storage Method</Th>
                    {crossTabDemoOptions.map(opt => <Th key={opt} style={{ textAlign: 'center' }}>{opt}</Th>)}
                    <Th style={{ textAlign: 'center' }}>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {crossTabData.map((row, i) => {
                    const total = crossTabDemoOptions.reduce((sum, opt) => sum + (row[opt] || 0), 0);
                    return (
                      <Tr key={i}>
                        <Td style={{ fontWeight: 800 }}>{row.name}</Td>
                        {crossTabDemoOptions.map(opt => (
                          <Td key={opt} style={{ textAlign: 'center' }}>{row[opt] || 0}</Td>
                        ))}
                        <Td style={{ textAlign: 'center', fontWeight: 900 }}>{total}</Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Likert Average by {crossDemo.charAt(0).toUpperCase() + crossDemo.slice(1)}</ChartTitle>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={crossTabDemoOptions.map(opt => {
                const users = pivoted.filter(r => r[crossDemo] === opt);
                let totalScore = 0, totalAnswered = 0;
                users.forEach(u => {
                  LIKERT_STATEMENTS.forEach((_, i) => {
                    const val = u[`likert_${i}`];
                    if (val) {
                      totalScore += LIKERT_LABELS.indexOf(val) === -1 ? 3 : (5 - LIKERT_LABELS.indexOf(val));
                      totalAnswered++;
                    }
                  });
                });
                return { name: opt, avg: totalAnswered > 0 ? parseFloat((totalScore / totalAnswered).toFixed(2)) : 0 };
              })}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip formatter={(v) => [v.toFixed(2), 'Avg Score']} />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                  {crossTabDemoOptions.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {subTab === 'responses' && (
        <>
          <FilterRow>
            <Filter size={16} style={{ color: '#55433c' }} />
            <Select value={filterSection} onChange={e => { setFilterSection(e.target.value); setFilterKey('all'); setFilterAnswer('all'); }}>
              <option value="all">All Sections</option>
              <option value="A">Section A - Demographics</option>
              <option value="B">Section B - Storage Practices</option>
              <option value="C">Section C - Likert Scale</option>
            </Select>
            <Select value={filterKey} onChange={e => { setFilterKey(e.target.value); setFilterAnswer('all'); }}>
              <option value="all">All Questions</option>
              {filteredKeys.map(k => (
                <option key={k.key} value={k.key}>{k.label}</option>
              ))}
            </Select>
            {filterKey !== 'all' && (
              <Select value={filterAnswer} onChange={e => setFilterAnswer(e.target.value)}>
                <option value="all">All Answers</option>
                {[...new Set(pivoted.map(r => r[filterKey]).filter(Boolean))].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            )}
          </FilterRow>

          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#55433c', marginBottom: '1rem' }}>
            Showing {filteredResponses.length} of {pivoted.length} respondents
          </p>

          <TableContainer>
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Student</Th>
                    <Th>Gender</Th>
                    <Th>Age</Th>
                    <Th>Level</Th>
                    <Th>Frequency</Th>
                    <Th>Storage</Th>
                    <Th>Submission</Th>
                    <Th>Lost</Th>
                    <Th>Corrupted</Th>
                    <Th>Retrieve</Th>
                    {LIKERT_STATEMENTS.map((_, i) => <Th key={i} style={{ textAlign: 'center' }}>Q{i + 1}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((r, i) => {
                    const p = profileMap[r.user_id];
                    return (
                      <Tr key={r.user_id}>
                        <Td>{i + 1}</Td>
                        <Td style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{p?.name || r.user_id?.slice(0, 8)}</Td>
                        <Td>{r.gender || '—'}</Td>
                        <Td>{r.age || '—'}</Td>
                        <Td>{r.level || '—'}</Td>
                        <Td>{r.submissionFrequency || '—'}</Td>
                        <Td>{r.storageMethod || '—'}</Td>
                        <Td>{r.submissionMethod || '—'}</Td>
                        <Td style={{ color: r.lostAssignment === 'Yes' ? '#b35a38' : r.lostAssignment === 'No' ? '#4a7c59' : '#55433c' }}>{r.lostAssignment || '—'}</Td>
                        <Td style={{ color: r.corruptedFlash === 'Yes' ? '#b35a38' : r.corruptedFlash === 'No' ? '#4a7c59' : '#55433c' }}>{r.corruptedFlash || '—'}</Td>
                        <Td style={{ color: r.unableRetrieve === 'Yes' ? '#b35a38' : r.unableRetrieve === 'No' ? '#4a7c59' : '#55433c' }}>{r.unableRetrieve || '—'}</Td>
                        {LIKERT_STATEMENTS.map((_, li) => {
                          const val = r[`likert_${li}`];
                          return (
                            <Td key={li} style={{
                              textAlign: 'center', fontWeight: 800,
                              color: val ? LIKERT_COLORS[val] : '#dbc1b8'
                            }}>
                              {val || '—'}
                            </Td>
                          );
                        })}
                      </Tr>
                    );
                  })}
                  {filteredResponses.length === 0 && (
                    <tr>
                      <Td colSpan={16} style={{ textAlign: 'center', padding: '3rem', color: '#55433c' }}>
                        No responses match the current filters.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </TableContainer>
        </>
      )}

      {subTab === 'export' && (
        <>
          <StatsGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <StatCard $accent="#b35a38">
              <StatLabel>Raw Responses</StatLabel>
              <StatValue>{responses.length}</StatValue>
              <ActionBtn $color="#b35a38" onClick={() => {
                const data = responses.map(r => {
                  const p = profileMap[r.user_id];
                  return { student_name: p?.name || '', student_email: p?.email || '', section: r.section, question_key: r.question_key, answer: r.answer, submitted: r.created_at };
                });
                exportQuestionnaireData(data, 'questionnaire_raw_responses.csv');
              }} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Raw Data
              </ActionBtn>
            </StatCard>

            <StatCard $accent="#daa520">
              <StatLabel>Pivoted Responses</StatLabel>
              <StatValue>{pivoted.length}</StatValue>
              <ActionBtn $color="#daa520" onClick={() => {
                const data = pivoted.map(r => {
                  const p = profileMap[r.user_id];
                  const likertFields = Object.fromEntries(LIKERT_STATEMENTS.map((_, i) => [`likert_${i + 1}`, r[`likert_${i}`] || '']));
                  return { student_name: p?.name || '', student_email: p?.email || '', gender: r.gender || '', age: r.age || '', level: r.level || '', submission_frequency: r.submissionFrequency || '', storage_method: r.storageMethod || '', submission_method: r.submissionMethod || '', lost_assignment: r.lostAssignment || '', corrupted_flash: r.corruptedFlash || '', unable_retrieve: r.unableRetrieve || '', ...likertFields, submitted: r.created_at };
                });
                exportQuestionnaireData(data, 'questionnaire_pivoted.csv');
              }} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Pivoted Data
              </ActionBtn>
            </StatCard>

            <StatCard $accent="#4a7c59">
              <StatLabel>Likert Summary</StatLabel>
              <StatValue>{likertData.length}</StatValue>
              <ActionBtn $color="#4a7c59" onClick={() => {
                const data = likertData.map((d, i) => ({
                  statement: d.statement, strongly_agree: d.SA, agree: d.A, neutral: d.N, disagree: d.D, strongly_disagree: d.SD, total: d.total, avg_score: d.avg,
                }));
                exportQuestionnaireData(data, 'questionnaire_likert_summary.csv');
              }} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Likert Summary
              </ActionBtn>
            </StatCard>
          </StatsGrid>

          <StatsGrid style={{ gridTemplateColumns: '1fr 1fr' }}>
            <StatCard $accent="#6d28d9">
              <StatLabel>Demographics Summary</StatLabel>
              <StatValue>{genderData.length + ageData.length + levelData.length + frequencyData.length}</StatValue>
              <ActionBtn $color="#6d28d9" onClick={() => {
                const data = [
                  ...genderData.map(d => ({ question: 'Gender', option: d.name, count: d.value, percentage: `${pivoted.length > 0 ? Math.round((d.value / pivoted.length) * 100) : 0}%` })),
                  ...ageData.map(d => ({ question: 'Age', option: d.name, count: d.value, percentage: `${pivoted.length > 0 ? Math.round((d.value / pivoted.length) * 100) : 0}%` })),
                  ...levelData.map(d => ({ question: 'Level', option: d.name, count: d.value, percentage: `${pivoted.length > 0 ? Math.round((d.value / pivoted.length) * 100) : 0}%` })),
                  ...frequencyData.map(d => ({ question: 'Submission Frequency', option: d.name, count: d.value, percentage: `${pivoted.length > 0 ? Math.round((d.value / pivoted.length) * 100) : 0}%` })),
                ];
                exportQuestionnaireData(data, 'questionnaire_demographics_summary.csv');
              }} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Demographics
              </ActionBtn>
            </StatCard>

            <StatCard $accent="#1e40af">
              <StatLabel>Cross-Tab: Storage vs {crossDemo}</StatLabel>
              <StatValue>{crossTabData.length}</StatValue>
              <ActionBtn $color="#1e40af" onClick={() => exportQuestionnaireData(crossTabData, `questionnaire_crosstab_storage_by_${crossDemo}.csv`)} style={{ marginTop: '0.75rem' }}>
                <Download size={14} /> Export Cross-Tab
              </ActionBtn>
            </StatCard>
          </StatsGrid>
        </>
      )}

      {subTab === 'post_interview' && (
        <>
          <StatsGrid>
            <StatCard $accent="#b35a38">
              <StatLabel>Total Respondents</StatLabel>
              <StatValue>{postPivoted.length}</StatValue>
            </StatCard>
            <StatCard $accent="#4a7c59">
              <StatLabel>Student Responses</StatLabel>
              <StatValue>{postStudentResponses.length}</StatValue>
            </StatCard>
            <StatCard $accent="#daa520">
              <StatLabel>Lecturer Responses</StatLabel>
              <StatValue>{postLecturerResponses.length}</StatValue>
            </StatCard>
            <StatCard $accent="#6d28d9">
              <StatLabel>Completion Rate</StatLabel>
              <StatValue>{profiles.filter(p => p.post_interview_completed).length}/{profiles.filter(p => p.role === 'student' || p.role === 'lecturer').length}</StatValue>
            </StatCard>
          </StatsGrid>

          {postStudentResponses.length > 0 && (
            <>
              {Object.entries(STUDENT_POST_LIKERT).map(([section, stmts]) => (
                <ChartCard key={section}>
                  <ChartTitle>Student Section {section} — {section === 'A' ? 'System Usability' : section === 'B' ? 'Perceived Usefulness' : 'Effectiveness'}</ChartTitle>
                  {postStudentLikertData[section].map((d, i) => {
                    const total = d.total || 1;
                    return (
                      <LikertBarRow key={i}>
                        <LikertBarLabel>Q{i + 1}. {d.statement}</LikertBarLabel>
                        <LikertBarOuter>
                          {POST_LIKERT_LABELS.map(label => {
                            const pct = (d[label] / total) * 100;
                            return (
                              <LikertBarSegment key={label} $show={pct > 5} style={{ width: `${pct}%`, background: POST_LIKERT_COLORS[label] }}>
                                {pct > 8 ? `${label} ${d[label]}` : ''}
                              </LikertBarSegment>
                            );
                          })}
                        </LikertBarOuter>
                      </LikertBarRow>
                    );
                  })}
                </ChartCard>
              ))}

              <SectionRow>
                <ChartCard>
                  <ChartTitle>Overall Satisfaction</ChartTitle>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={postSatisfactionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {postSatisfactionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard>
                  <ChartTitle>Would Recommend?</ChartTitle>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={postRecommendData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        <Cell fill="#4a7c59" />
                        <Cell fill="#b35a38" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </SectionRow>

              <ChartCard>
                <ChartTitle>Open-Ended Responses</ChartTitle>
                <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
                  <Table>
                    <thead><tr><Th>Student</Th><Th>Liked Most</Th><Th>Improvements</Th></tr></thead>
                    <tbody>
                      {postStudentResponses.filter(r => r.liked_most || r.improvements).map((r, i) => {
                        const p = profileMap[r.user_id];
                        return (
                          <Tr key={i}>
                            <Td style={{ fontWeight: 800 }}>{p?.name || r.user_id?.slice(0, 8)}</Td>
                            <Td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{r.liked_most || '—'}</Td>
                            <Td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{r.improvements || '—'}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            </>
          )}

          {postLecturerResponses.length > 0 && (
            <>
              <ChartCard>
                <ChartTitle>Lecturer System Evaluation</ChartTitle>
                {postLecturerLikertData.map((d, i) => {
                  const total = d.total || 1;
                  return (
                    <LikertBarRow key={i}>
                      <LikertBarLabel>Q{i + 1}. {d.statement}</LikertBarLabel>
                      <LikertBarOuter>
                        {POST_LIKERT_LABELS.map(label => {
                          const pct = (d[label] / total) * 100;
                          return (
                            <LikertBarSegment key={label} $show={pct > 5} style={{ width: `${pct}%`, background: POST_LIKERT_COLORS[label] }}>
                              {pct > 8 ? `${label} ${d[label]}` : ''}
                            </LikertBarSegment>
                          );
                        })}
                      </LikertBarOuter>
                    </LikertBarRow>
                  );
                })}
              </ChartCard>

              <ChartCard>
                <ChartTitle>Lecturer Open-Ended Responses</ChartTitle>
                <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
                  <Table>
                    <thead><tr><Th>Lecturer</Th><Th>Strengths</Th><Th>Improvements</Th></tr></thead>
                    <tbody>
                      {postLecturerResponses.filter(r => r.strengths || r.improvements).map((r, i) => {
                        const p = profileMap[r.user_id];
                        return (
                          <Tr key={i}>
                            <Td style={{ fontWeight: 800 }}>{p?.name || r.user_id?.slice(0, 8)}</Td>
                            <Td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{r.strengths || '—'}</Td>
                            <Td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{r.improvements || '—'}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableContainer>
              </ChartCard>
            </>
          )}

          {postPivoted.length > 0 && (
            <ChartCard>
              <ChartTitle>All Individual Responses</ChartTitle>
              <TableContainer style={{ boxShadow: 'none', border: 'none' }}>
                <div style={{ overflowX: 'auto' }}>
                  <Table>
                    <thead>
                      <tr>
                        <Th>#</Th>
                        <Th>Name</Th>
                        <Th>Role</Th>
                        <Th>Satisfaction</Th>
                        <Th>Recommend</Th>
                        <Th>Liked Most</Th>
                        <Th>Improvements</Th>
                        <Th>Submitted</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {postPivoted.map((r, i) => {
                        const p = profileMap[r.user_id];
                        return (
                          <Tr key={r.user_id}>
                            <Td>{i + 1}</Td>
                            <Td style={{ fontWeight: 800 }}>{p?.name || r.user_id?.slice(0, 8)}</Td>
                            <Td>
                              <span style={{
                                padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                                background: r.role === 'lecturer' ? '#daa52015' : '#4a7c5915',
                                color: r.role === 'lecturer' ? '#daa520' : '#4a7c59',
                              }}>{r.role}</span>
                            </Td>
                            <Td>{r.satisfaction || '—'}</Td>
                            <Td style={{ color: r.recommend === 'Yes' ? '#4a7c59' : r.recommend === 'No' ? '#b35a38' : '#55433c' }}>{r.recommend || '—'}</Td>
                            <Td style={{ maxWidth: '200px', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{r.liked_most || r.strengths || '—'}</Td>
                            <Td style={{ maxWidth: '200px', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{r.improvements || '—'}</Td>
                            <Td style={{ fontSize: '0.75rem' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </TableContainer>
            </ChartCard>
          )}

          {postPivoted.length === 0 && (
            <ChartCard>
              <div style={{ textAlign: 'center', padding: '3rem', color: '#55433c' }}>
                <ClipboardList size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>No post-interview responses yet</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Responses will appear here once students and lecturers complete the post-intervention questionnaire.</p>
              </div>
            </ChartCard>
          )}
        </>
      )}

      </>
      )}
    </Container>
  );
};

export default QuestionnaireDashboard;
