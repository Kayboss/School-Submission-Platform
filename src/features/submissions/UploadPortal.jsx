import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import {
  Upload, CheckCircle, AlertCircle, X, FileText, ShieldCheck,
  Send, HelpCircle, Link, Video, FolderOpen, Hash, Download, RotateCcw, Clock, Loader
} from 'lucide-react';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useSubmissionStore } from '../../store/submissionStore';
import { useCourseStore } from '../../store/courseStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

const Container = styled.div` padding: 1rem; `;

const Header = styled.div` margin-bottom: 2.5rem; `;

const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.muted}; font-size: 1rem; font-weight: 500; max-width: 700px;
`;

const AssignSelector = styled.select`
  width: 100%; padding: 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: white; font-size: 1rem; font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main}; margin-bottom: 2rem;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: 1.3fr 1fr; gap: 3rem; align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 1.5rem; }
`;

const FormSection = styled.div``;

const SectionLabel = styled.h4`
  font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted}; margin-bottom: 1rem;
`;

const UploadZone = styled.div`
  background: white; padding: 3rem 2rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 2px dashed ${({ theme, $isDragActive }) => $isDragActive ? theme.colors.primary : theme.colors.border};
  text-align: center; cursor: pointer; transition: all 0.3s;
  box-shadow: ${({ theme }) => theme.shadows.small};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.background.alt}50; }
`;

const IconWrapper = styled.div`
  width: 64px; height: 64px; background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.primary}; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;
`;

const ErrorText = styled.p` font-size: 0.8125rem; color: #b35a38; font-weight: 700; margin-top: 0.5rem; `;

const FileList = styled.div` margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; `;

const FileItem = styled.div`
  display: flex; align-items: center; gap: 1rem; padding: 1rem;
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1.5px solid ${({ theme }) => theme.colors.border}20;
`;

const FileIcon = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const FileDetails = styled.div` flex: 1; min-width: 0; `;

const FileName = styled.p` font-size: 0.85rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;

const ProgressBar = styled.div`
  width: 100%; height: 4px; background: ${({ theme }) => theme.colors.background.alt};
  border-radius: 2px; margin-top: 0.5rem; overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%; background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px; transition: width 0.3s ease;
  width: ${({ $progress }) => $progress}%;
`;

const FileSize = styled.span` font-size: 0.75rem; color: #55433c; font-weight: 600; `;

const VideoLinkInput = styled.input`
  width: 100%; padding: 0.875rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem; font-weight: 600;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const EmbedPreview = styled.div`
  margin-top: 1rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden; iframe { width: 100%; height: 240px; border: none; }
`;

const SubmitButton = styled.button`
  width: 100%; padding: 1.125rem;
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.primary};
  color: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800; font-size: 1rem;
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  margin-top: 1.5rem; cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${({ theme, disabled }) => disabled ? 'none' : `0 6px 20px ${theme.colors.primary}40`};
  &:hover { transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'}; }
`;

const RemoveBtn = styled.button`
  background: ${({ theme }) => theme.colors.background.alt}; border-radius: 8px;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted}; flex-shrink: 0;
  &:hover { background: ${({ theme }) => theme.colors.primary}15; color: ${({ theme }) => theme.colors.primary}; }
`;

// Receipt Styles
const Receipt = styled.div`
  background: white; padding: 3rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.border}40; position: relative; overflow: hidden;
  &::before {
    content: 'SUCCESSFUL'; position: absolute; top: 25px; right: -35px;
    background: ${({ theme }) => theme.colors.tertiary}; color: white;
    padding: 0.5rem 4rem; transform: rotate(45deg);
    font-size: 0.8125rem; font-weight: 900; letter-spacing: 1px;
  }
`;

const ReceiptHeader = styled.div`
  display: flex; align-items: center; gap: 1.25rem;
  margin-bottom: 2.5rem; padding-bottom: 1.5rem;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border}80;
`;

const ReceiptBody = styled.div` display: flex; flex-direction: column; gap: 1rem; `;

const ReceiptRow = styled.div`
  display: flex; justify-content: space-between; font-size: 0.9375rem;
`;

const ReceiptLabel = styled.span` color: ${({ theme }) => theme.colors.text.muted}; font-weight: 700; `;
const ReceiptValue = styled.span` font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; `;

const InfoBox = styled.div`
  padding: 2rem; background: ${({ theme }) => theme.colors.background.alt}50;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border}40;
`;

const GuidelineTitle = styled.h4`
  margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;
  font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
`;

const GuidelineList = styled.ul`
  font-size: 0.875rem; color: #55433c; padding-left: 1.25rem; line-height: 2; font-weight: 600;
  li::marker { color: ${({ theme }) => theme.colors.primary}; }
`;

const ToggleRow = styled.label`
  display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem;
  font-size: 0.875rem; font-weight: 700; color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer;
`;

const ToggleSwitch = styled.div`
  width: 40px; height: 22px; background: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.border};
  border-radius: 11px; position: relative; transition: background 0.3s;
  &::after {
    content: ''; width: 18px; height: 18px; border-radius: 50%;
    background: white; position: absolute; top: 2px;
    left: ${({ $on }) => $on ? '20px' : '2px'}; transition: left 0.3s;
  }
`;

const CheckboxRow = styled.label`
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.85rem; font-weight: 700; color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer; padding: 0.75rem 0;
`;

const StyledCheckbox = styled.input`
  width: 20px; height: 20px; accent-color: ${({ theme }) => theme.colors.primary};
`;

const getEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdriveMatch) return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  return null;
};

const generateHash = async (text) => {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const UploadPortal = () => {
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('assignment');
  const assignments = useAssignmentStore(s => s.assignments);
  const addSubmission = useSubmissionStore(s => s.addSubmission);
  const courses = useCourseStore(s => s.courses);
  const user = useAuthStore(s => s.user);
  const acceptedCourses = useAuthStore(s => s.acceptedCourses);
  const addToast = useToastStore(s => s.addToast);

  const acceptedCourseCodes = courses
    .filter(c => acceptedCourses.includes(c.id))
    .map(c => c.code);

  const filteredAssignments = assignments.filter(a => acceptedCourseCodes.includes(a.courseCode));

  const [selectedAssignId, setSelectedAssignId] = useState(preselected || '');
  const [files, setFiles] = useState([]);
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errors, setErrors] = useState({});
  const [zipToggle, setZipToggle] = useState(false);
  const [progress, setProgress] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (preselected) setSelectedAssignId(preselected);
  }, [preselected]);

  const selectedAssign = assignments.find(a => a.id === selectedAssignId);

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (selectedAssign) {
      if (selectedAssign.allowedExtensions && !selectedAssign.allowedExtensions.map(e => e.toLowerCase()).includes(ext)) {
        return `Invalid file type "${ext}". Allowed: ${selectedAssign.allowedExtensions.join(', ')}`;
      }
      if (selectedAssign.maxSize && file.size > selectedAssign.maxSize * 1024 * 1024) {
        return `File exceeds ${selectedAssign.maxSize}MB limit`;
      }
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || e.dataTransfer?.files || []);
    const newErrors = {};
    const validFiles = [];

    selectedFiles.forEach(file => {
      const err = validateFile(file);
      if (err) {
        newErrors[file.name] = err;
      } else {
        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        validFiles.push({ file, sanitizedName: sanitized, id: Date.now() + Math.random() });
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      validFiles.forEach(f => simulateProgress(f.id));
    }
  };

  const simulateProgress = (id) => {
    setProgress(prev => ({ ...prev, [id]: 0 }));
    const interval = setInterval(() => {
      setProgress(prev => {
        const current = prev[id] || 0;
        if (current >= 100) { clearInterval(interval); return prev; }
        const increment = Math.random() * 30 + 5;
        return { ...prev, [id]: Math.min(100, current + increment) };
      });
    }, 200);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setProgress(prev => { const { [id]: _, ...rest } = prev; return rest; });
  };

  const handleSubmit = async () => {
    if (!selectedAssignId || (files.length === 0 && !videoLink)) return;
    setIsSubmitting(true);

    const now = new Date();
    const dueDate = new Date(selectedAssign.dueDate);
    const isLate = now > dueDate;
    const diffMs = dueDate - now;
    const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    const diffMins = Math.abs(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
    const timeDiscrepancy = isLate
      ? `${diffHours}h ${diffMins}m late`
      : `${diffHours}h ${diffMins}m early`;

    const hashInput = `${user?.name}-${selectedAssignId}-${now.toISOString()}`;
    const fileHash = await generateHash(hashInput);

    const submissionData = {
      assignmentId: selectedAssignId,
      courseCode: selectedAssign.courseCode,
      assignmentTitle: selectedAssign.title,
      studentName: user?.name || 'Student',
      studentId: user?.studentId || user?.id,
      isLate,
      timeDiscrepancy,
      files: files.map(f => ({
        name: f.sanitizedName,
        size: +(f.file.size / 1024 / 1024).toFixed(2),
        type: f.file.type,
        hash: fileHash
      })),
      videoLink: videoLink || undefined,
      status: isLate ? 'Late' : 'Pending',
      semester: '2025/2026 Semester 2'
    };

    addSubmission(submissionData);

    const receiptId = `TaTU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setReceipt({
      id: receiptId,
      timestamp: now.toLocaleString('en-GB'),
      student: `${user?.name || 'Student'} (${user?.studentId || user?.id})`,
      course: selectedAssign.courseCode,
      assignment: selectedAssign.title,
      files: files.map(f => f.sanitizedName),
      videoLink,
      hash: fileHash,
      isLate
    });

    addToast('Submission uploaded successfully!', 'success');
    setIsSubmitting(false);
  };

  if (receipt) {
    return (
      <Container>
        <Header>
          <Title>Submission Secured</Title>
          <Description>Your academic contribution has been safely stored in the institutional archives.</Description>
        </Header>
        <Receipt>
          <ReceiptHeader>
            <div style={{ width: '52px', height: '52px', background: '#4a7c59', color: 'white', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Digital Submission Receipt</h3>
              <p style={{ fontSize: '0.85rem', color: '#55433c', margin: '4px 0 0', fontWeight: 600 }}>Tamale Technical University</p>
            </div>
          </ReceiptHeader>
          <ReceiptBody>
            <ReceiptRow><ReceiptLabel>Receipt ID</ReceiptLabel><ReceiptValue className="data-tabular">{receipt.id}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Timestamp</ReceiptLabel><ReceiptValue>{receipt.timestamp}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Student</ReceiptLabel><ReceiptValue>{receipt.student}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Course</ReceiptLabel><ReceiptValue>{receipt.course}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Assignment</ReceiptLabel><ReceiptValue>{receipt.assignment}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Files</ReceiptLabel><ReceiptValue>{receipt.files.join(', ') || 'N/A'}</ReceiptValue></ReceiptRow>
            {receipt.videoLink && <ReceiptRow><ReceiptLabel>Video Link</ReceiptLabel><ReceiptValue style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.videoLink}</ReceiptValue></ReceiptRow>}
            <ReceiptRow><ReceiptLabel>SHA-256 Hash</ReceiptLabel><ReceiptValue style={{ fontSize: '0.65rem', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{receipt.hash}</ReceiptValue></ReceiptRow>
            <ReceiptRow><ReceiptLabel>Status</ReceiptLabel><ReceiptValue style={{ color: receipt.isLate ? '#b35a38' : '#4a7c59' }}>{receipt.isLate ? 'Late' : 'On Time'}</ReceiptValue></ReceiptRow>
          </ReceiptBody>
          <SubmitButton onClick={() => { setReceipt(null); setFiles([]); setVideoLink(''); setProgress({}); }}>
            <Download size={18} /> Download Receipt
          </SubmitButton>
          <SubmitButton onClick={() => { setReceipt(null); setFiles([]); setVideoLink(''); setProgress({}); setSelectedAssignId(''); }}>
            Submit Another
          </SubmitButton>
        </Receipt>
      </Container>
    );
  }

  const activeAssign = selectedAssign;
  const allowDocument = activeAssign?.submissionTypes?.document;
  const allowVideo = activeAssign?.submissionTypes?.video;
  const allowProject = activeAssign?.submissionTypes?.project;
  const canSubmit = selectedAssignId && (files.length > 0 || videoLink) && !isSubmitting;

  return (
    <Container>
      <Header>
        <Title>Submission Hub</Title>
        <Description>Upload your projects and assignments directly to our institutional cloud.</Description>
      </Header>

      <SectionLabel>Select Assignment</SectionLabel>
      <AssignSelector value={selectedAssignId} onChange={e => { setSelectedAssignId(e.target.value); setFiles([]); setVideoLink(''); setErrors({}); }}>
        <option value="">-- Choose an assignment --</option>
        {filteredAssignments.map(a => (
          <option key={a.id} value={a.id}>{a.courseCode} - {a.title}</option>
        ))}
        {filteredAssignments.length === 0 && (
          <option value="" disabled>Accept a course first to see assignments</option>
        )}
      </AssignSelector>

      {activeAssign && (
        <div style={{ background: '#f0ede9', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong style={{ fontSize: '0.9375rem' }}>{activeAssign.title}</strong>
              <p style={{ fontSize: '0.8125rem', color: '#55433c', marginTop: '4px' }}>
                Due: {new Date(activeAssign.dueDate).toLocaleDateString('en-GB', { dateStyle: 'long' })} &middot;
                Max: {activeAssign.maxSize}MB &middot;
                Formats: {activeAssign.allowedExtensions?.join(', ')}
              </p>
            </div>
          </div>
          {new Date() > new Date(activeAssign.dueDate) && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b35a38', background: '#b35a3815', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={12} /> Overdue
              </span>
              {activeAssign.latePenalty > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b35a38', background: '#b35a3815', padding: '0.3rem 0.6rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={12} /> {activeAssign.latePenalty}%/day penalty
                </span>
              )}
            </div>
          )}
          {activeAssign.allowResubmission && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#4a7c59', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={14} /> Resubmission allowed (max {activeAssign.maxResubmissions} versions)
            </div>
          )}
        </div>
      )}

      <Grid>
        <FormSection>
          {allowDocument && (
            <>
              <SectionLabel><FileText size={16} style={{ marginRight: '0.5rem' }} />Document Upload</SectionLabel>
              <UploadZone
                $isDragActive={isDragActive}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={() => setIsDragActive(true)}
                onDragLeave={() => setIsDragActive(false)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setIsDragActive(false); handleFileSelect({ dataTransfer: e.dataTransfer }); }}
              >
                <IconWrapper><Upload size={28} strokeWidth={2.5} /></IconWrapper>
                <p style={{ fontWeight: 800, fontSize: '1rem' }}>Drop your files or browse</p>
                <p style={{ fontSize: '0.8125rem', color: '#55433c', marginTop: '0.5rem', fontWeight: 600 }}>
                  {activeAssign ? `Accepted: ${activeAssign.allowedExtensions?.join(', ')} (Max ${activeAssign.maxSize}MB)` : 'Select an assignment first'}
                </p>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} multiple={allowProject} onChange={handleFileSelect} accept={activeAssign?.allowedExtensions?.join(',')} />
              </UploadZone>
              {Object.entries(errors).map(([name, msg]) => (
                <ErrorText key={name}><AlertCircle size={14} style={{ marginRight: '0.25rem' }} />{msg}</ErrorText>
              ))}
            </>
          )}

          {allowProject && (
            <>
              <ToggleRow onClick={() => setZipToggle(!zipToggle)}>
                <ToggleSwitch $on={zipToggle} />
                ZIP-on-the-fly (bundle all files into archive)
              </ToggleRow>
            </>
          )}

          {allowVideo && (
            <>
              <SectionLabel style={{ marginTop: '2rem' }}><Video size={16} style={{ marginRight: '0.5rem' }} />Video Link Submission</SectionLabel>
              <VideoLinkInput
                placeholder="Paste YouTube, Vimeo, or Google Drive link..."
                value={videoLink}
                onChange={e => setVideoLink(e.target.value)}
              />
              {videoLink && getEmbedUrl(videoLink) && (
                <EmbedPreview>
                  <iframe src={getEmbedUrl(videoLink)} title="Video preview" allowFullScreen />
                </EmbedPreview>
              )}
            </>
          )}

          {files.length > 0 && (
            <FileList>
              <SectionLabel>Selected Files ({files.length})</SectionLabel>
              {files.map(f => (
                <FileItem key={f.id}>
                  <FileIcon><FileText size={20} /></FileIcon>
                  <FileDetails>
                    <FileName>{f.sanitizedName}</FileName>
                    <FileSize>{(f.file.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                    <ProgressBar><ProgressFill $progress={progress[f.id] || 0} /></ProgressBar>
                  </FileDetails>
                  <RemoveBtn onClick={() => removeFile(f.id)}><X size={16} /></RemoveBtn>
                </FileItem>
              ))}
            </FileList>
          )}

          <SubmitButton disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? <><Loader className="spin" size={20} /> Securing Submission...</> : 'Execute Submission'}
            {!isSubmitting && <Send size={20} strokeWidth={2.5} />}
          </SubmitButton>
        </FormSection>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <InfoBox>
            <GuidelineTitle><AlertCircle size={22} color="#b35a38" /> Institutional Guidelines</GuidelineTitle>
            <GuidelineList>
              <li>Maintain standard naming conventions.</li>
              <li>Ensure files meet the required format and size.</li>
              <li>Verify the correct assignment before submission.</li>
              <li>Save your Digital Receipt as proof of submission.</li>
              <li>Resubmissions create new versions — all previous versions are preserved.</li>
            </GuidelineList>
          </InfoBox>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#55433c', padding: '0 1rem' }}>
            <HelpCircle size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Contact support@tatu.edu.gh for assistance.</span>
          </div>
        </div>
      </Grid>
    </Container>
  );
};

export default UploadPortal;
