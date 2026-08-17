import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, CheckCircle, AlertCircle, FileText, Paperclip, Download, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useCourseStore } from '../../store/courseStore';
import { supabase } from '../../lib/supabase';

const Page = styled.div` padding: 0 0 4rem; `;

const PageHeader = styled.div` margin-bottom: 2.5rem; `;

const Title = styled.h1`
  font-size: 1.75rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  font-size: 0.875rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 600;
`;

const FilterBar = styled.div`
  display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  padding: 0.5rem 1rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border + '40'};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '10' : 'white'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.muted};
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Grid = styled.div`
  display: grid; gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
`;

const Card = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border}30;
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: ${({ theme }) => theme.shadows.medium}; transform: translateY(-2px); }
`;

const CourseTag = styled.span`
  display: inline-block; padding: 0.25rem 0.65rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primary}12; color: ${({ theme }) => theme.colors.primary};
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.03em;
`;

const CardTitle = styled.h3`
  font-size: 1rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
`;

const CardDesc = styled.p`
  font-size: 0.8125rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 500;
  line-height: 1.5;
  ${({ $expanded }) => $expanded
    ? ''
    : 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;'}
`;

const ShowMoreBtn = styled.button`
  font-size: 0.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.primary};
  background: none; border: none; cursor: pointer; padding: 0; margin-top: -0.25rem;
  &:hover { text-decoration: underline; }
`;

const AttachSection = styled.div`
  display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.25rem;
`;

const AttachRow = styled.a`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.65rem;
  background: ${({ theme }) => theme.colors.background?.alt || '#f5f5f5'};
  border-radius: 6px; text-decoration: none; transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.primary}12; }
`;

const AttachName = styled.span`
  font-size: 0.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.text.main};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
`;

const AttachSize = styled.span`
  font-size: 0.65rem; color: ${({ theme }) => theme.colors.text.muted}; font-weight: 600; flex-shrink: 0;
`;

const Meta = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border}20;
`;

const MetaLeft = styled.div` display: flex; flex-direction: column; gap: 0.25rem; `;

const DueText = styled.span`
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; font-weight: 700;
  color: ${({ $urgent, theme }) => $urgent ? theme.colors.primary : theme.colors.text.muted};
`;

const StatusBadge = styled.span`
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.3rem 0.7rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.7rem; font-weight: 800;
  background: ${({ $status, theme }) =>
    $status === 'graded' ? `${theme.colors.tertiary}15` :
    $status === 'submitted' ? `${theme.colors.info}15` :
    $status === 'overdue' ? `${theme.colors.primary}15` :
    $status === 'late' ? `${theme.colors.secondary}15` :
    `${theme.colors.border}20`};
  color: ${({ $status, theme }) =>
    $status === 'graded' ? theme.colors.tertiary :
    $status === 'submitted' ? theme.colors.info :
    $status === 'overdue' ? theme.colors.primary :
    $status === 'late' ? theme.colors.secondary :
    theme.colors.text.muted};
`;

const SubmitBtn = styled.button`
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem; border: none; border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primary}; color: white;
  font-size: 0.75rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.primary}dd; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const EmptyState = styled.div`
  text-align: center; padding: 5rem 2rem; color: ${({ theme }) => theme.colors.text.muted};
  svg { margin-bottom: 1rem; opacity: 0.4; }
  p { font-weight: 600; font-size: 0.95rem; }
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

const getDueStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  return due < now ? 'overdue' : 'upcoming';
};

const StudentAssignments = () => {
  const user = useAuthStore(state => state.user);
  const acceptedCourses = useAuthStore(state => state.acceptedCourses);
  const assignments = useAssignmentStore(state => state.assignments);
  const submissions = useSubmissionStore(state => state.submissions);
  const courses = useCourseStore(state => state.courses);
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState('all');
  const [expandedDescs, setExpandedDescs] = useState({});
  const [downloading, setDownloading] = useState(null);

  const handleDownloadAttach = async (storagePath, fileName) => {
    setDownloading(storagePath);
    const { data, error } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) {
      setDownloading(null);
      return;
    }
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloading(null);
  };

  const studentId = user?.student_id || user?.id;

  const enrolledCourseCodes = useMemo(() => {
    return courses
      .filter(c => acceptedCourses.includes(c.id))
      .map(c => c.code);
  }, [courses, acceptedCourses]);

  const enrichedAssignments = useMemo(() => {
    return assignments
      .filter(a => enrolledCourseCodes.includes(a.courseCode))
      .map(a => {
        const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === studentId);
        const isOverdue = getDueStatus(a.dueDate) === 'overdue';
        let status = 'pending';
        if (sub?.score != null && sub?.score !== undefined) status = 'graded';
        else if (sub) status = 'submitted';
        else if (isOverdue) status = 'overdue';
        return { ...a, submission: sub, status, isOverdue };
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [assignments, submissions, studentId, enrolledCourseCodes]);

  const filtered = useMemo(() => {
    if (filter === 'all') return enrichedAssignments;
    return enrichedAssignments.filter(a => a.status === filter);
  }, [enrichedAssignments, filter]);

  const counts = useMemo(() => ({
    all: enrichedAssignments.length,
    pending: enrichedAssignments.filter(a => a.status === 'pending').length,
    submitted: enrichedAssignments.filter(a => a.status === 'submitted').length,
    graded: enrichedAssignments.filter(a => a.status === 'graded').length,
    overdue: enrichedAssignments.filter(a => a.status === 'overdue').length,
  }), [enrichedAssignments]);

  return (
    <Page>
      <PageHeader>
        <Title>Assignments</Title>
        <Subtitle>View and submit your course assignments</Subtitle>
      </PageHeader>

      <FilterBar>
        {['all', 'pending', 'submitted', 'graded', 'overdue'].map(f => (
          <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {counts[f] > 0 ? `(${counts[f]})` : ''}
          </FilterBtn>
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState>
          <FileText size={48} />
          <p>No assignments found</p>
        </EmptyState>
      ) : (
        <Grid>
          {filtered.map(a => {
            const countdown = getCountdown(a.dueDate);
            return (
              <Card key={a.id}>
                <CourseTag>{a.courseCode}</CourseTag>
                <CardTitle>{a.title}</CardTitle>
                {a.description && (
                  <>
                    <CardDesc $expanded={expandedDescs[a.id]}>{a.description}</CardDesc>
                    {a.description.length > 100 && (
                      <ShowMoreBtn onClick={() => setExpandedDescs(prev => ({ ...prev, [a.id]: !prev[a.id] }))}>
                        {expandedDescs[a.id] ? 'Show less' : 'Show more'}
                      </ShowMoreBtn>
                    )}
                  </>
                )}
                {a.attachments?.length > 0 && (
                  <AttachSection>
                    {a.attachments.map((att, i) => (
                      <AttachRow
                        key={i}
                        href="#"
                        onClick={e => { e.preventDefault(); handleDownloadAttach(att.storagePath, att.name); }}
                      >
                        <Paperclip size={13} style={{ color: '#b35a38', flexShrink: 0 }} />
                        <AttachName>{att.name}</AttachName>
                        <AttachSize>{att.size} MB</AttachSize>
                        {downloading === att.storagePath ? (
                          <Loader size={12} className="spin" style={{ flexShrink: 0 }} />
                        ) : (
                          <Download size={12} style={{ color: '#b35a38', flexShrink: 0 }} />
                        )}
                      </AttachRow>
                    ))}
                  </AttachSection>
                )}
                <Meta>
                  <MetaLeft>
                    <DueText $urgent={countdown.urgent}>
                      <Clock size={13} /> {countdown.text}
                    </DueText>
                    <StatusBadge $status={a.status}>
                      {a.status === 'graded' && <><CheckCircle size={11} /> Graded — {a.submission?.score}%</>}
                      {a.status === 'submitted' && <><Send size={11} /> Submitted</>}
                      {a.status === 'overdue' && <><AlertCircle size={11} /> Overdue</>}
                      {a.status === 'pending' && <><Clock size={11} /> Pending</>}
                    </StatusBadge>
                  </MetaLeft>
                  <SubmitBtn onClick={() => navigate('/submissions', { state: { assignmentId: a.id, courseCode: a.courseCode } })}>
                    <Send size={13} /> Submit
                  </SubmitBtn>
                </Meta>
              </Card>
            );
          })}
        </Grid>
      )}
    </Page>
  );
};

export default StudentAssignments;
