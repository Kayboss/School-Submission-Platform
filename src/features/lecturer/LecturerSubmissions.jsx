import React, { useState, useMemo } from 'react';
import { useSubmissionStore } from '../../store/submissionStore';
import { useCourseStore } from '../../store/courseStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useToastStore } from '../../store/toastStore';
import { useRubricStore } from '../../store/rubricStore';
import { exportGradesCsv } from '../../utils/exportCsv';
import { supabase } from '../../lib/supabase';
import {
  FileText, CheckCircle, Clock, AlertCircle, Download, Eye,
  Search, BarChart2, Package, Video, DownloadCloud, RotateCcw, ClipboardList, Award, Loader
} from 'lucide-react';
import {
  Container, StatsRow, StatCard, StatIconWrap, StatLabel, StatValue,
  Controls, SearchWrapper, SearchInput, FilterSelect,
  TableContainer, Table, Th, Td, Tr, StatusBadge,
  ActionBtn, ActionGroup, Overlay, Modal, ModalTitle, ModalSub,
  ScoreInput, FeedbackTextarea, ModalActions, PrimaryBtn, SecondaryBtn,
  ViewerOverlay, ViewerModal, ViewerContent, ZipAnimation, Spinner, EmptyState
} from './lecturerStyles';
import styled from 'styled-components';

const CsvBtn = styled(ActionBtn)`
  background: ${({ theme }) => theme.colors.tertiary}15;
  color: ${({ theme }) => theme.colors.tertiary};
  width: auto; padding: 0 1rem; gap: 0.5rem; font-weight: 700; font-size: 0.8rem;
`;

const RubricToggle = styled.button`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '10' : 'white'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.muted};
  font-weight: 700; font-size: 0.8rem; margin-bottom: 1rem; cursor: pointer; width: 100%; justify-content: center;
`;

const RubricRow = styled.div`
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;
  padding: 0.75rem; background: ${({ theme }) => theme.colors.background.alt}50;
  border-radius: 8px;
`;

const RubricCriterion = styled.div` flex: 1; `;
const RubricName = styled.div` font-weight: 800; font-size: 0.85rem; color: ${({ theme }) => theme.colors.text.main}; `;
const RubricDesc = styled.div` font-size: 0.75rem; color: #55433c; font-weight: 600; margin-top: 2px; `;
const RubricScoreInput = styled.input`
  width: 70px; padding: 0.4rem 0.6rem; text-align: center; font-weight: 800;
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: 8px; font-size: 1rem;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
const RubricMax = styled.span` font-size: 0.75rem; color: #55433c; font-weight: 700; `;

const RubricTotal = styled.div`
  text-align: right; padding: 0.75rem; font-size: 1.25rem; font-weight: 900;
  color: ${({ theme }) => theme.colors.primary}; border-top: 2px solid ${({ theme }) => theme.colors.border}30;
  margin-top: 0.5rem;
`;

const LateBadge = styled.span`
  font-size: 0.7rem; font-weight: 800; color: #b35a38;
  background: #b35a3815; padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem;
`;

const VersionBadge = styled.button`
  font-size: 0.7rem; font-weight: 700; color: ${({ $active, theme }) => $active ? 'white' : theme.colors.primary};
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.primary + '15'};
  border: none; padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer;
  &:hover { opacity: 0.8; }
`;

const timeColor = (timestamp, isLate) => {
  if (isLate) return '#b35a38';
  const diff = new Date() - new Date(timestamp);
  return diff < 24 * 60 * 60 * 1000 ? '#4a7c59' : '#1c1c19';
};

const LecturerSubmissions = () => {
  const submissions = useSubmissionStore(s => s.submissions);
  const gradeSubmission = useSubmissionStore(s => s.gradeSubmission);
  const courses = useCourseStore(s => s.courses);
  const assignments = useAssignmentStore(s => s.assignments);
  const rubrics = useRubricStore(s => s.rubrics);
  const addToast = useToastStore(s => s.addToast);

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [gradingTarget, setGradingTarget] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [useRubric, setUseRubric] = useState(false);
  const [rubricScores, setRubricScores] = useState({});
  const [viewerTarget, setViewerTarget] = useState(null);
  const [viewVersion, setViewVersion] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const handleDownloadFile = async (storagePath, fileName) => {
    setDownloadingFile(storagePath);
    const { data, error } = await supabase.storage
      .from('submission-files')
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) {
      addToast('Failed to generate download link', 'error');
      setDownloadingFile(null);
      return;
    }
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadingFile(null);
  };

  const handleDownloadAll = async (sub) => {
    const files = sub.files || [];
    for (const f of files) {
      if (f.storagePath) {
        await handleDownloadFile(f.storagePath, f.name);
      }
    }
  };

  const assignment = gradingTarget ? assignments.find(a => a.id === gradingTarget.assignmentId) : null;
  const rubric = assignment ? rubrics.find(r => r.assignmentId === assignment.id) : null;

  const filteredSubs = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch = search === '' ||
        s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        s.id?.toLowerCase().includes(search.toLowerCase());
      const matchCourse = filterCourse === 'all' || s.courseCode === filterCourse;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [submissions, search, filterCourse, filterStatus]);

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    graded: submissions.filter(s => s.status === 'Graded').length,
    late: submissions.filter(s => s.status === 'Late').length,
  }), [submissions]);

  const handleGrade = () => {
    if (!gradingTarget) return;
    setIsGrading(true);
    if (useRubric && rubric) {
      const total = rubric.criteria.reduce((sum, c) => sum + (Number(rubricScores[c.name] || 0)), 0);
      const maxTotal = rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0);
      const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
      gradeSubmission(gradingTarget.id, pct, gradeFeedback, rubricScores);
      addToast(`Graded ${gradingTarget.studentName} via rubric — ${pct}/100`, 'success');
    } else {
      if (!gradeScore) return;
      gradeSubmission(gradingTarget.id, gradeScore, gradeFeedback);
      addToast(`Graded ${gradingTarget.studentName} — ${gradeScore}/100`, 'success');
    }
    setIsGrading(false);
    setGradingTarget(null);
    setGradeScore('');
    setGradeFeedback('');
    setUseRubric(false);
    setRubricScores({});
  };

  const openGrading = (sub) => {
    setGradingTarget(sub);
    setGradeScore(sub.score?.toString() || '');
    setGradeFeedback(sub.feedback || '');
    setRubricScores(sub.rubricScores || {});
    const ass = assignments.find(a => a.id === sub.assignmentId);
    const rub = ass ? rubrics.find(r => r.assignmentId === ass.id) : null;
    setUseRubric(!!rub);
  };

  const handleBulkDownload = () => {
    setBulkLoading(true);
    exportGradesCsv(submissions, filterCourse !== 'all' ? filterCourse : null);
    setTimeout(() => {
      setBulkLoading(false);
      addToast('All grades exported as CSV', 'success');
    }, 1000);
  };

  const handleCsvExport = () => {
    setIsExporting(true);
    exportGradesCsv(submissions, filterCourse !== 'all' ? filterCourse : null);
    addToast('Grade sheet exported as CSV', 'success');
    setTimeout(() => setIsExporting(false), 600);
  };

  const displayVersions = (sub) => {
    if (!sub.versions || sub.versions.length <= 1) return null;
    return sub.versions.map((v, i) => (
      <VersionBadge key={i} $active={i === viewVersion} onClick={() => setViewVersion(i)}>
        v{i + 1}
      </VersionBadge>
    ));
  };

  const currentViewVersion = viewerTarget && viewerTarget.versions
    ? viewerTarget.versions[viewVersion] || viewerTarget.versions[viewerTarget.versions.length - 1]
    : null;

  return (
    <Container>
      <StatsRow>
        <StatCard $accent="#b35a38">
          <StatIconWrap $accent="#b35a38"><FileText size={18} /></StatIconWrap>
          <StatLabel>Total</StatLabel>
          <StatValue>{stats.total}</StatValue>
        </StatCard>
        <StatCard $accent="#daa520">
          <StatIconWrap $accent="#daa520"><Clock size={18} /></StatIconWrap>
          <StatLabel>Pending</StatLabel>
          <StatValue>{stats.pending}</StatValue>
        </StatCard>
        <StatCard $accent="#4a7c59">
          <StatIconWrap $accent="#4a7c59"><CheckCircle size={18} /></StatIconWrap>
          <StatLabel>Graded</StatLabel>
          <StatValue>{stats.graded}</StatValue>
        </StatCard>
        <StatCard $accent="#6F240A">
          <StatIconWrap $accent="#6F240A"><AlertCircle size={18} /></StatIconWrap>
          <StatLabel>Late</StatLabel>
          <StatValue>{stats.late}</StatValue>
        </StatCard>
      </StatsRow>

      <Controls>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput placeholder="Search by name or receipt..." value={search} onChange={e => setSearch(e.target.value)} />
        </SearchWrapper>
        <FilterSelect value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
        </FilterSelect>
        <FilterSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Graded">Graded</option>
          <option value="Late">Late</option>
        </FilterSelect>
        <ActionBtn $variant="primary" onClick={handleBulkDownload} disabled={bulkLoading} title="Bulk ZIP download">
          {bulkLoading ? <Loader className="spin" size={18} /> : <Package size={18} />}
        </ActionBtn>
        <CsvBtn onClick={handleCsvExport} disabled={isExporting} title="Export as CSV">
          {isExporting ? <Loader className="spin" size={14} /> : <DownloadCloud size={16} />} CSV
        </CsvBtn>
      </Controls>

      {bulkLoading && (
        <ZipAnimation>
          <Spinner /> Packaging submissions into ZIP archive...
        </ZipAnimation>
      )}

      <TableContainer>
        <Table $minWidth="900px">
          <thead>
            <tr>
              <Th>Student</Th>
              <Th>Receipt ID</Th>
              <Th>Course</Th>
              <Th>Assignment</Th>
              <Th>Submitted</Th>
              <Th>Score</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map(sub => (
              <Tr key={sub.id}>
                <Td>
                  <div style={{ fontWeight: 800 }}>{sub.studentName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#55433c' }}>{sub.studentId}</div>
                </Td>
                <Td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#b35a38' }}>{sub.id}</Td>
                <Td>{sub.courseCode}</Td>
                <Td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.assignmentTitle}</Td>
                <Td>
                  <div style={{ color: timeColor(sub.timestamp, sub.isLate), fontWeight: 700 }}>
                    {new Date(sub.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#55433c' }}>
                    {sub.timeDiscrepancy}
                    {sub.versions?.length > 1 && <LateBadge>{sub.versions.length} versions</LateBadge>}
                  </div>
                </Td>
                <Td>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: sub.score >= 70 ? '#4a7c59' : sub.score >= 50 ? '#daa520' : '#b35a38' }}>
                    {sub.score ?? '-'}
                  </span>
                  {sub.score && <span style={{ fontSize: '0.7rem', color: '#55433c' }}>/100</span>}
                </Td>
                <Td>
                  <StatusBadge $status={sub.status}>
                    {sub.status === 'Graded' && <CheckCircle size={12} />}
                    {sub.status === 'Pending' && <Clock size={12} />}
                    {sub.status === 'Late' && <AlertCircle size={12} />}
                    {sub.status}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionGroup>
                    <ActionBtn title="View file" onClick={() => { setViewerTarget(sub); setViewVersion(0); }}>
                      <Eye size={16} />
                    </ActionBtn>
                    <ActionBtn title="Download" onClick={() => handleDownloadAll(sub)} disabled={downloadingFile !== null}>
                      {downloadingFile ? <Loader className="spin" size={16} /> : <Download size={16} />}
                    </ActionBtn>
                    <ActionBtn $variant="primary" title="Grade" onClick={() => openGrading(sub)}>
                      <BarChart2 size={16} />
                    </ActionBtn>
                  </ActionGroup>
                </Td>
              </Tr>
            ))}
            {filteredSubs.length === 0 && (
              <tr><Td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#55433c' }}>No submissions match your filters.</Td></tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {gradingTarget && (
        <Overlay onClick={() => setGradingTarget(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>Grade Submission</ModalTitle>
            <ModalSub>{gradingTarget.studentName} &middot; {gradingTarget.courseCode} &middot; {gradingTarget.assignmentTitle}</ModalSub>

            {assignment?.latePenalty > 0 && gradingTarget.isLate && (
              <div style={{ background: '#b35a3815', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 700, fontSize: '0.85rem', color: '#b35a38', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> Late — {assignment.latePenalty}% penalty per day applies
              </div>
            )}

            {rubric ? (
              <>
                <RubricToggle $active={useRubric} onClick={() => setUseRubric(!useRubric)} type="button">
                  <ClipboardList size={16} /> {useRubric ? 'Switch to Simple Score' : 'Grade with Rubric'}
                </RubricToggle>

                {useRubric ? (
                  <>
                    {rubric.criteria.map(c => (
                      <RubricRow key={c.name}>
                        <RubricCriterion>
                          <RubricName>{c.name}</RubricName>
                          <RubricDesc>{c.description}</RubricDesc>
                        </RubricCriterion>
                        <RubricScoreInput
                          type="number" min="0" max={c.maxScore}
                          placeholder="0"
                          value={rubricScores[c.name] || ''}
                          onChange={e => setRubricScores({ ...rubricScores, [c.name]: e.target.value })}
                        />
                        <RubricMax>/ {c.maxScore}</RubricMax>
                      </RubricRow>
                    ))}
                    <RubricTotal>
                      Total: {rubric.criteria.reduce((sum, c) => sum + (Number(rubricScores[c.name] || 0)), 0)} / {rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0)} ({Math.round((rubric.criteria.reduce((sum, c) => sum + (Number(rubricScores[c.name] || 0)), 0) / rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0)) * 100) || 0}%)
                    </RubricTotal>
                  </>
                ) : (
                  <>
                    <ScoreInput type="number" min="0" max="100" placeholder="Score / 100" value={gradeScore} onChange={e => setGradeScore(e.target.value)} />
                  </>
                )}
              </>
            ) : (
              <ScoreInput type="number" min="0" max="100" placeholder="Score / 100" value={gradeScore} onChange={e => setGradeScore(e.target.value)} />
            )}

            <FeedbackTextarea placeholder="Write feedback..." value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} />
            <ModalActions>
              <SecondaryBtn onClick={() => setGradingTarget(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn onClick={handleGrade} disabled={(!useRubric && !gradeScore) || isGrading}>
                {isGrading ? <Loader className="spin" size={16} /> : <Award size={16} />} Submit Grade
              </PrimaryBtn>
            </ModalActions>
          </Modal>
        </Overlay>
      )}

      {viewerTarget && (
        <ViewerOverlay onClick={() => setViewerTarget(null)}>
          <ViewerModal onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <ModalTitle>File Preview</ModalTitle>
              <SecondaryBtn onClick={() => setViewerTarget(null)}>Close</SecondaryBtn>
            </div>
            <ModalSub>
              {viewerTarget.studentName} &middot; {viewerTarget.courseCode}
              {viewerTarget.versions?.length > 1 && (
                <span style={{ marginLeft: '1rem', display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                  <RotateCcw size={12} /> {displayVersions(viewerTarget)}
                </span>
              )}
            </ModalSub>
            <ViewerContent>
              {viewerTarget.videoLink ? (
                <>
                  <Video size={48} color="#b35a38" />
                  <p style={{ fontWeight: 700 }}>Video Submission {currentViewVersion ? `(v${currentViewVersion.version})` : ''}</p>
                  <iframe
                    src={viewerTarget.videoLink.replace('watch?v=', 'embed/').split('&')[0]}
                    title="Video"
                    style={{ width: '100%', height: '280px', border: 'none', borderRadius: '8px' }}
                    allowFullScreen
                  />
                </>
              ) : (
                <>
                  <FileText size={48} color="#b35a38" />
                  <p style={{ fontWeight: 700 }}>
                    {(currentViewVersion?.files?.[0]?.name || viewerTarget.files?.[0]?.name || 'Document')}
                    {currentViewVersion && <span style={{ color: '#b35a38', marginLeft: '0.5rem' }}>(v{currentViewVersion.version})</span>}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#55433c' }}>
                    {currentViewVersion
                      ? `Uploaded ${new Date(currentViewVersion.timestamp).toLocaleString('en-GB')} — ${(currentViewVersion.files?.[0]?.size || 0).toFixed(1)} MB`
                      : `Submitted — ${(viewerTarget.files?.[0]?.size || 0).toFixed(1)} MB`}
                  </p>
                  <div style={{ background: 'white', width: '100%', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem', color: '#55433c', textAlign: 'left' }}>
                    <strong style={{ color: '#1c1c19' }}>Submitted Files</strong>
                    {(currentViewVersion?.files || viewerTarget.files || []).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{f.name}</span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#55433c' }}>{f.size} MB &middot; {f.type}</span>
                        </div>
                        {f.storagePath && (
                          <ActionBtn
                            onClick={() => handleDownloadFile(f.storagePath, f.name)}
                            disabled={downloadingFile === f.storagePath}
                            title="Download file"
                          >
                            {downloadingFile === f.storagePath ? <Loader className="spin" size={14} /> : <Download size={14} />}
                          </ActionBtn>
                        )}
                      </div>
                    ))}
                    <p style={{ marginTop: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#b35a38' }}>
                      SHA-256: {(viewerTarget.files?.[0]?.hash || '').substring(0, 20)}...
                    </p>
                  </div>
                </>
              )}
              {viewerTarget.versions?.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {viewerTarget.versions.map((v, i) => (
                    <VersionBadge key={i} $active={i === viewVersion} onClick={() => setViewVersion(i)}>
                      Version {i + 1} — {new Date(v.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </VersionBadge>
                  ))}
                </div>
              )}
            </ViewerContent>
          </ViewerModal>
        </ViewerOverlay>
      )}
    </Container>
  );
};

export default LecturerSubmissions;
