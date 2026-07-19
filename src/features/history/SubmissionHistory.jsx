import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  History, Search, Filter, Download, ExternalLink,
  CheckCircle, Clock, AlertCircle, Users, Archive, FileSpreadsheet, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useCourseStore } from '../../store/courseStore';
import { useToastStore } from '../../store/toastStore';

const Container = styled.div` padding: 1rem; `;

const Header = styled.div` margin-bottom: 2.5rem; `;

const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted}; font-size: 1.125rem; font-weight: 500;
`;

const Controls = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem; gap: 1.5rem; flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative; flex: 1; max-width: 400px;
  svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.text.muted}80; }
  @media (max-width: 600px) { max-width: 100%; }
`;

const SearchInput = styled.input`
  width: 100%; padding: 0.75rem 1rem 0.75rem 3rem;
  background: white; border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem; box-shadow: ${({ theme }) => theme.shadows.small};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ActionButtons = styled.div` display: flex; gap: 1rem; flex-wrap: wrap; @media (max-width: 600px) { width: 100%; } `;

const IconButton = styled.button`
  background: white; border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  padding: 0.75rem 1.25rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex; align-items: center; gap: 0.75rem;
  font-weight: 700; font-size: 0.875rem; color: ${({ theme }) => theme.colors.text.main};
  box-shadow: ${({ theme }) => theme.shadows.small};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; transform: translateY(-2px); }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1.25rem; background: white;
  border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.875rem; font-weight: 700; color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer; box-shadow: ${({ theme }) => theme.shadows.small};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TableContainer = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border}20;
  @media (max-width: 768px) { overflow-x: auto; }
`;

const Table = styled.table` width: 100%; border-collapse: collapse; text-align: left; min-width: ${({ $minWidth }) => $minWidth || 'auto'}; `;

const Th = styled.th`
  padding: 1.25rem 1.5rem; background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border}20;
`;

const Td = styled.td`
  padding: 1.25rem 1.5rem; font-size: 0.9375rem; color: ${({ theme }) => theme.colors.text.main};
  font-weight: 600; border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt};
`;

const Tr = styled.tr`
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.background.alt}40; }
  &:last-child td { border-bottom: none; }
`;

const StatusBadge = styled.span`
  padding: 0.5rem 0.875rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.75rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.5rem;
  background: ${({ $status, theme }) =>
    $status === 'Graded' ? `${theme.colors.tertiary}15` :
    $status === 'Pending' ? `${theme.colors.secondary}15` :
    `${theme.colors.primary}15`};
  color: ${({ $status, theme }) =>
    $status === 'Graded' ? theme.colors.tertiary :
    $status === 'Pending' ? theme.colors.secondary :
    theme.colors.primary};
`;

const ActionLink = styled.button`
  background: transparent; color: ${({ theme }) => theme.colors.primary};
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.875rem; font-weight: 700;
  &:hover { text-decoration: underline; }
`;

const BatchHeader = styled.div`
  padding: 1rem 1.5rem; background: ${({ theme }) => theme.colors.background.alt}80;
  font-weight: 800; font-size: 1rem; color: ${({ theme }) => theme.colors.text.main};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border}20;
  display: flex; align-items: center; gap: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center; padding: 3rem; color: #55433c; font-weight: 600;
`;

const ScoreCell = styled.span`
  font-weight: 800; color: ${({ $score }) => $score >= 70 ? '#4a7c59' : $score >= 50 ? '#daa520' : '#b35a38'};
`;

// ─── Mobile Card Styles ──────────────────────────────────────────────────────

const MobileCards = styled.div`
  display: none;
  @media (max-width: 768px) { display: flex; flex-direction: column; gap: 0.75rem; }
`;

const MobileBatchHeader = styled.div`
  font-weight: 800; font-size: 0.95rem; padding: 0.75rem 0;
  display: flex; align-items: center; gap: 0.5rem; color: ${({ theme }) => theme.colors.text.main};
`;

const MobileCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border}20;
  padding: 1rem;
  border-left: 4px solid ${({ $status, theme }) =>
    $status === 'Graded' ? theme.colors.tertiary :
    $status === 'Late' ? theme.colors.primary :
    theme.colors.secondary};
`;

const MobileCardRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.85rem; padding: 0.25rem 0;
  color: ${({ theme }) => theme.colors.text.main};
`;

const MobileLabel = styled.span` font-weight: 600; color: #55433c; font-size: 0.75rem; `;

const DesktopTable = styled.div`
  @media (max-width: 768px) { display: none; }
`;

const SubmissionHistory = () => {
  const user = useAuthStore(state => state.user);
  const submissions = useSubmissionStore(state => state.submissions);
  const addToast = useToastStore(state => state.addToast);
  const isLecturer = user?.role === 'lecturer';
  const studentId = user?.studentId || '05210810';

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');

  const semesters = useMemo(() => {
    const s = new Set(submissions.map(sub => sub.semester).filter(Boolean));
    return Array.from(s);
  }, [submissions]);

  const studentNames = useMemo(() => {
    const map = new Map();
    submissions.forEach(sub => {
      if (sub.studentName && sub.studentId) {
        map.set(sub.studentId, sub.studentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [submissions]);

  const filtered = useMemo(() => {
    let list = isLecturer ? submissions : submissions.filter(s => s.studentId === studentId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.id?.toLowerCase().includes(q) ||
        s.courseCode?.toLowerCase().includes(q) ||
        s.assignmentTitle?.toLowerCase().includes(q) ||
        s.studentName?.toLowerCase().includes(q)
      );
    }
    if (semesterFilter !== 'all') {
      list = list.filter(s => s.semester === semesterFilter);
    }
    if (isLecturer && studentFilter !== 'all') {
      list = list.filter(s => s.studentId === studentFilter);
    }
    return list;
  }, [submissions, search, semesterFilter, studentFilter, studentId, isLecturer]);

  const groupedBySemester = useMemo(() => {
    const groups = {};
    filtered.forEach(s => {
      const sem = s.semester || 'Unknown Semester';
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(s);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleExport = (type) => {
    addToast(`Exporting ${type} — simulated download ready`, 'success');
  };

  return (
    <Container>
      <Header>
        <Title>{isLecturer ? 'Institutional Archive' : 'Submission Archive'}</Title>
        <Subtitle>
          {isLecturer
            ? 'A comprehensive archive of all student submissions across semesters and courses.'
            : 'Your digital audit trail of academic contributions.'}
        </Subtitle>
      </Header>

      <Controls>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput
            placeholder={isLecturer ? 'Search receipts, courses, students...' : 'Search receipts, courses, or files...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchWrapper>
        <ActionButtons>
          {semesters.length > 0 && (
            <FilterSelect value={semesterFilter} onChange={e => setSemesterFilter(e.target.value)}>
              <option value="all">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
          )}
          {isLecturer && studentNames.length > 0 && (
            <FilterSelect value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
              <option value="all">All Students</option>
              {studentNames.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </FilterSelect>
          )}
          {isLecturer && (
            <>
              <IconButton onClick={() => handleExport('CSV')}>
                <FileSpreadsheet size={18} /> CSV
              </IconButton>
              <IconButton onClick={() => handleExport('Excel')}>
                <Download size={18} /> Export
              </IconButton>
            </>
          )}
          {!isLecturer && (
            <IconButton onClick={() => handleExport('PDF')}>
              <Download size={18} /> Export All
            </IconButton>
          )}
        </ActionButtons>
      </Controls>

      {filtered.length === 0 ? (
        <EmptyState>No submissions match your current filters.</EmptyState>
      ) : isLecturer ? (
        groupedBySemester.map(([semester, subs]) => (
          <div key={semester} style={{ marginBottom: '2rem' }}>
            <BatchHeader>
              <Archive size={20} /> {semester}
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#55433c', marginLeft: 'auto' }}>
                {subs.length} submission{subs.length !== 1 ? 's' : ''}
              </span>
            </BatchHeader>
            <DesktopTable>
              <TableContainer>
                <Table $minWidth="700px">
                  <thead>
                    <tr>
                      <Th>Student</Th>
                      <Th>Receipt ID</Th>
                      <Th>Course</Th>
                      <Th>Assignment</Th>
                      <Th>Date</Th>
                      <Th>Score</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(sub => (
                      <Tr key={sub.id}>
                        <Td>
                          <div style={{ fontWeight: 800 }}>{sub.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#55433c' }}>{sub.studentId}</div>
                        </Td>
                        <Td style={{ fontFamily: 'monospace', color: '#b35a38', fontSize: '0.85rem' }}>{sub.id}</Td>
                        <Td>{sub.courseCode}</Td>
                        <Td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.assignmentTitle}
                          {sub.versions?.length > 1 && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#4a7c59', background: '#4a7c5915', padding: '0.15rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              <RotateCcw size={10} style={{ verticalAlign: 'middle', marginRight: '2px' }} />{sub.versions.length}v
                            </span>
                          )}
                        </Td>
                        <Td>
                          <div>{new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.75rem', color: '#55433c' }}>{sub.timeDiscrepancy}</div>
                        </Td>
                        <Td>
                          {sub.score != null ? (
                            <ScoreCell $score={sub.score}>{sub.score}/100</ScoreCell>
                          ) : (
                            <span style={{ color: '#55433c' }}>—</span>
                          )}
                        </Td>
                        <Td>
                          <StatusBadge $status={sub.status}>
                            {sub.status === 'Graded' && <CheckCircle size={14} />}
                            {sub.status === 'Pending' && <Clock size={14} />}
                            {sub.status === 'Late' && <AlertCircle size={14} />}
                            {sub.status}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <ActionLink>
                            View <ExternalLink size={14} />
                          </ActionLink>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            </DesktopTable>
            <MobileCards>
              {subs.map(sub => (
                <MobileCard key={sub.id} $status={sub.status}>
                  <MobileCardRow>
                    <span style={{ fontWeight: 800 }}>{sub.studentName}</span>
                    <StatusBadge $status={sub.status}>
                      {sub.status === 'Graded' && <CheckCircle size={12} />}
                      {sub.status === 'Pending' && <Clock size={12} />}
                      {sub.status === 'Late' && <AlertCircle size={12} />}
                      {sub.status}
                    </StatusBadge>
                  </MobileCardRow>
                  <MobileCardRow>
                    <MobileLabel>Receipt</MobileLabel>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#b35a38' }}>{sub.id}</span>
                  </MobileCardRow>
                  <MobileCardRow>
                    <MobileLabel>Course</MobileLabel>
                    <span>
                      {sub.courseCode} — {sub.assignmentTitle}
                      {sub.versions?.length > 1 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#4a7c59' }}>
                          <RotateCcw size={10} style={{ verticalAlign: 'middle' }} /> {sub.versions.length}v
                        </span>
                      )}
                    </span>
                  </MobileCardRow>
                  <MobileCardRow>
                    <MobileLabel>Date</MobileLabel>
                    <span>{new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {sub.timeDiscrepancy}</span>
                  </MobileCardRow>
                  <MobileCardRow>
                    <MobileLabel>Score</MobileLabel>
                    {sub.score != null ? (
                      <ScoreCell $score={sub.score}>{sub.score}/100</ScoreCell>
                    ) : (
                      <span style={{ color: '#55433c' }}>—</span>
                    )}
                  </MobileCardRow>
                  <MobileCardRow>
                    <MobileLabel>Student</MobileLabel>
                    <span>{sub.studentId}</span>
                  </MobileCardRow>
                </MobileCard>
              ))}
            </MobileCards>
          </div>
        ))
      ) : (
        <>
          <DesktopTable>
            <TableContainer>
              <Table $minWidth="700px">
                <thead>
                  <tr>
                    <Th>Receipt ID</Th>
                    <Th>Course & Assignment</Th>
                    <Th>Timestamp</Th>
                    <Th>Score</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sub => (
                    <Tr key={sub.id}>
                      <Td style={{ fontFamily: 'monospace', color: '#b35a38' }}>{sub.id}</Td>
                      <Td>
                        <div style={{ fontWeight: 800 }}>{sub.courseCode}</div>
                        <div style={{ fontSize: '0.75rem', color: '#55433c', marginTop: '4px' }}>
                          {sub.assignmentTitle}
                          {sub.versions?.length > 1 && (
                            <span style={{ marginLeft: '0.35rem', fontWeight: 700, color: '#4a7c59' }}>
                              <RotateCcw size={10} style={{ verticalAlign: 'middle' }} /> {sub.versions.length}v
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div>{new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div style={{ fontSize: '0.75rem', color: '#55433c', marginTop: '4px' }}>{sub.timeDiscrepancy}</div>
                      </Td>
                      <Td>
                        {sub.score != null ? (
                          <ScoreCell $score={sub.score}>{sub.score}/100</ScoreCell>
                        ) : (
                          <span style={{ color: '#55433c' }}>—</span>
                        )}
                      </Td>
                      <Td>
                        <StatusBadge $status={sub.status}>
                          {sub.status === 'Graded' && <CheckCircle size={14} />}
                          {sub.status === 'Pending' && <Clock size={14} />}
                          {sub.status === 'Late' && <AlertCircle size={14} />}
                          {sub.status}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <ActionLink>
                          View Receipt <ExternalLink size={14} />
                        </ActionLink>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </DesktopTable>
          <MobileCards>
            {filtered.map(sub => (
              <MobileCard key={sub.id} $status={sub.status}>
                <MobileCardRow>
                  <span style={{ fontWeight: 800 }}>{sub.courseCode}</span>
                  <StatusBadge $status={sub.status}>
                    {sub.status === 'Graded' && <CheckCircle size={12} />}
                    {sub.status === 'Pending' && <Clock size={12} />}
                    {sub.status === 'Late' && <AlertCircle size={12} />}
                    {sub.status}
                  </StatusBadge>
                </MobileCardRow>
                <MobileCardRow>
                  <MobileLabel>Receipt</MobileLabel>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#b35a38' }}>{sub.id}</span>
                </MobileCardRow>
                <MobileCardRow>
                  <MobileLabel>Assignment</MobileLabel>
                  <span>
                    {sub.assignmentTitle}
                    {sub.versions?.length > 1 && (
                      <span style={{ marginLeft: '0.35rem', fontWeight: 700, color: '#4a7c59', fontSize: '0.75rem' }}>
                        <RotateCcw size={10} style={{ verticalAlign: 'middle' }} /> {sub.versions.length}v
                      </span>
                    )}
                  </span>
                </MobileCardRow>
                <MobileCardRow>
                  <MobileLabel>Date</MobileLabel>
                  <span>{new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {sub.timeDiscrepancy}</span>
                </MobileCardRow>
                <MobileCardRow>
                  <MobileLabel>Score</MobileLabel>
                  {sub.score != null ? (
                    <ScoreCell $score={sub.score}>{sub.score}/100</ScoreCell>
                  ) : (
                    <span style={{ color: '#55433c' }}>—</span>
                  )}
                </MobileCardRow>
              </MobileCard>
            ))}
          </MobileCards>
        </>
      )}
    </Container>
  );
};

export default SubmissionHistory;
