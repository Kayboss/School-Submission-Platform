import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useCourseStore } from '../../store/courseStore';
import { useToastStore } from '../../store/toastStore';
import { useRubricStore } from '../../store/rubricStore';
import { useUploadStore } from '../../store/uploadStore';
import { Plus, RotateCcw, AlertTriangle, ClipboardList, Trash2, Loader, Pencil, X, Check, Paperclip, FileText, Upload, Download } from 'lucide-react';
import {
  Container, PrimaryBtn, AssignForm, FormGrid, FormGroup, Label,
  FormInput, FormTextarea, FormSelect, CheckboxGroup, CheckboxLabel,
  CreateBtn, AssignCard, SecondaryBtn
} from './lecturerStyles';
import MarkdownEditor from '../../components/common/MarkdownEditor';
import { supabase } from '../../lib/supabase';
import styled from 'styled-components';

const LatePenaltyRow = styled.div`
  display: flex; align-items: center; gap: 0.75rem;
  color: ${({ theme }) => theme.colors.primary}; font-weight: 700; font-size: 0.85rem;
`;

const RubricSection = styled.div`
  margin-top: 1rem; padding-top: 1rem; border-top: 1px solid ${({ theme }) => theme.colors.border}30;
`;

const RubricCriterionRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 80px; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem;
`;

const RubricInput = styled(FormInput)` font-size: 0.8rem; padding: 0.5rem 0.75rem; `;
const RubricSmallInput = styled(FormInput)` width: 60px; font-size: 0.8rem; padding: 0.5rem; text-align: center; `;

const ActionBtn = styled.button`
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.4rem 0.75rem; font-size: 0.75rem; font-weight: 700;
  border: none; border-radius: 6px; cursor: pointer; transition: all 0.15s;
  background: ${({ $danger, theme }) => $danger ? '#fee2e2' : theme.colors.background?.alt || '#f0f0f0'};
  color: ${({ $danger }) => $danger ? '#dc2626' : '#555'};
  &:hover { opacity: 0.8; }
`;

const ConfirmOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 999;
`;

const ConfirmBox = styled.div`
  background: white; border-radius: 12px; padding: 1.5rem; max-width: 380px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  h4 { font-weight: 800; margin-bottom: 0.5rem; }
  p { font-size: 0.85rem; color: #666; margin-bottom: 1.25rem; }
`;

const ConfirmActions = styled.div`
  display: flex; justify-content: flex-end; gap: 0.75rem;
`;

const AttachUploadArea = styled.div`
  border: 1.5px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primary}08; }
`;

const AttachList = styled.div`
  margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;
`;

const AttachItem = styled.div`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem;
  background: ${({ theme }) => theme.colors.background?.alt || '#f5f5f5'}; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600;
`;

const AttachRemove = styled.button`
  margin-left: auto; background: none; border: none; color: #b35a38; cursor: pointer; padding: 0.15rem;
  &:hover { opacity: 0.7; }
`;

const CardAttachRow = styled.a`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem;
  background: ${({ theme }) => theme.colors.background?.alt || '#f5f5f5'}; border-radius: 6px;
  text-decoration: none; font-size: 0.8rem; font-weight: 600;
  color: ${({ theme }) => theme.colors.text?.main || '#1c1c19'};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.primary}12; }
`;

const CardAttachName = styled.span`
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
`;

const CardAttachSize = styled.span`
  font-size: 0.7rem; color: ${({ theme }) => theme.colors.text?.muted || '#999'}; flex-shrink: 0;
`;

const LecturerAssignments = () => {
  const user = useAuthStore(s => s.user);
  const assignments = useAssignmentStore(s => s.assignments);
  const createAssignment = useAssignmentStore(s => s.createAssignment);
  const updateAssignment = useAssignmentStore(s => s.updateAssignment);
  const deleteAssignment = useAssignmentStore(s => s.deleteAssignment);
  const courses = useCourseStore(s => s.courses);
  const rubrics = useRubricStore(s => s.rubrics);
  const createRubric = useRubricStore(s => s.createRubric);
  const deleteRubric = useRubricStore(s => s.deleteRubric);
  const addToast = useToastStore(s => s.addToast);
  const startUpload = useUploadStore(s => s.startUpload);
  const updateProgress = useUploadStore(s => s.updateProgress);
  const completeUpload = useUploadStore(s => s.completeUpload);
  const failUpload = useUploadStore(s => s.failUpload);
  const clearUploads = useUploadStore(s => s.clearUploads);

  const [showRubricFor, setShowRubricFor] = useState(null);
  const [rCriteria, setRCriteria] = useState([{ name: '', description: '', maxScore: 25 }]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingRubric, setIsSavingRubric] = useState(false);

  const [showCreator, setShowCreator] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aCourse, setACourse] = useState('');
  const [aDue, setADue] = useState('');
  const [aMaxSize, setAMaxSize] = useState('10');
  const [aExt, setAExt] = useState('.pdf');
  const [aDoc, setADoc] = useState(true);
  const [aVideo, setAVideo] = useState(false);
  const [aProject, setAProject] = useState(false);
  const [aLatePenalty, setALatePenalty] = useState('5');
  const [aAllowResub, setAAllowResub] = useState(true);
  const [aMaxResub, setAMaxResub] = useState('3');
  const [attachFiles, setAttachFiles] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadingAttach, setDownloadingAttach] = useState(null);

  const handleDownloadAttach = async (storagePath, fileName) => {
    setDownloadingAttach(storagePath);
    const { data, error } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) {
      addToast('Failed to generate download link', 'error');
      setDownloadingAttach(null);
      return;
    }
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadingAttach(null);
  };

  const resetForm = () => {
    setATitle(''); setADesc(''); setACourse(''); setADue('');
    setAMaxSize('10'); setAExt('.pdf'); setADoc(true); setAVideo(false);
    setAProject(false); setALatePenalty('5'); setAAllowResub(true); setAMaxResub('3');
    setAttachFiles([]);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!aTitle || !aDesc || !aDue || !aCourse) return;
    const selectedCourse = courses.find(c => c.code === aCourse);
    if (!selectedCourse) {
      addToast('Please select a valid course', 'error');
      return;
    }
    setIsCreating(true);
    clearUploads();
    try {
      const attachments = [];
      for (const f of attachFiles) {
        const uploadId = `create-${Date.now()}-${f.file.name}`;
        startUpload(uploadId, f.file.name, f.file.size);

        const storagePath = `${user?.id}/${Date.now()}_${f.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const progressInterval = setInterval(() => {
          const current = useUploadStore.getState().uploads.find(u => u.id === uploadId);
          if (current && current.progress < 90) {
            updateProgress(uploadId, current.progress + Math.random() * 15 + 5);
          }
        }, 300);

        const { error: uploadError } = await supabase.storage
          .from('assignment-files')
          .upload(storagePath, f.file, { upsert: false });

        clearInterval(progressInterval);

        if (uploadError) {
          failUpload(uploadId, uploadError.message);
          addToast(`Failed to upload ${f.file.name}: ${uploadError.message}`, 'error');
          setIsCreating(false);
          return;
        }

        completeUpload(uploadId);
        attachments.push({
          name: f.file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
          size: +(f.file.size / 1024 / 1024).toFixed(2),
          type: f.file.type,
          storagePath,
        });
      }

      await createAssignment({
        course_code: aCourse,
        title: aTitle,
        description: aDesc,
        due_date: new Date(aDue).toISOString(),
        submission_types: { document: aDoc, video: aVideo, project: aProject },
        max_size: Number(aMaxSize),
        allowed_extensions: aExt.split(',').map(e => e.trim()),
        lecturer_name: user?.name || 'Lecturer',
        user_id: user?.id || null,
        attachments,
      });
      addToast('Assignment created', 'success');
      setShowCreator(false);
      resetForm();
    } catch (err) {
      console.error('Create assignment error:', err);
      addToast('Failed to create assignment. Please try again.', 'error');
    }
    setIsCreating(false);
  };

  const handleEditAssignment = (a) => {
    setEditingId(a.id);
    setATitle(a.title);
    setADesc(a.description || '');
    setACourse(a.courseCode || a.course_code || '');
    setADue(a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : '');
    setAMaxSize(String(a.maxSize || 10));
    setAExt((a.allowedExtensions || []).join(', '));
    setADoc(a.submissionTypes?.document ?? true);
    setAVideo(a.submissionTypes?.video ?? false);
    setAProject(a.submissionTypes?.project ?? false);
    setALatePenalty(String(a.latePenalty || 0));
    setAAllowResub(a.allowResubmission ?? false);
    setAMaxResub(String(a.maxResubmissions || 3));
    setAttachFiles((a.attachments || []).map(att => ({ existing: att })));
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!aTitle || !aDesc || !aDue || !aCourse) return;
    setIsUpdating(true);
    clearUploads();
    try {
      const existingAttachments = attachFiles.filter(f => f.existing).map(f => f.existing);
      const newFiles = attachFiles.filter(f => !f.existing);

      const uploadedNew = [];
      for (const f of newFiles) {
        const uploadId = `update-${Date.now()}-${f.file.name}`;
        startUpload(uploadId, f.file.name, f.file.size);

        const storagePath = `${user?.id}/${Date.now()}_${f.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const progressInterval = setInterval(() => {
          const current = useUploadStore.getState().uploads.find(u => u.id === uploadId);
          if (current && current.progress < 90) {
            updateProgress(uploadId, current.progress + Math.random() * 15 + 5);
          }
        }, 300);

        const { error: uploadError } = await supabase.storage
          .from('assignment-files')
          .upload(storagePath, f.file, { upsert: false });

        clearInterval(progressInterval);

        if (uploadError) {
          failUpload(uploadId, uploadError.message);
          addToast(`Failed to upload ${f.file.name}: ${uploadError.message}`, 'error');
          setIsUpdating(false);
          return;
        }

        completeUpload(uploadId);
        uploadedNew.push({
          name: f.file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
          size: +(f.file.size / 1024 / 1024).toFixed(2),
          type: f.file.type,
          storagePath,
        });
      }

      await updateAssignment(editingId, {
        title: aTitle,
        description: aDesc,
        course_code: aCourse,
        due_date: new Date(aDue).toISOString(),
        submission_types: { document: aDoc, video: aVideo, project: aProject },
        max_size: Number(aMaxSize),
        allowed_extensions: aExt.split(',').map(e => e.trim()),
        late_penalty: Number(aLatePenalty),
        allow_resubmission: aAllowResub,
        max_resubmissions: Number(aMaxResub),
        attachments: [...existingAttachments, ...uploadedNew],
      });
      addToast('Assignment updated', 'success');
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error('Update assignment error:', err);
      addToast('Failed to update assignment', 'error');
    }
    setIsUpdating(false);
  };

  const handleDeleteAssignment = async () => {
    if (!deletingId) return;
    try {
      await deleteAssignment(deletingId);
      addToast('Assignment deleted', 'success');
    } catch (err) {
      console.error('Delete assignment error:', err);
      addToast('Failed to delete assignment', 'error');
    }
    setDeletingId(null);
  };

  const handleAddCriterion = () => {
    setRCriteria([...rCriteria, { name: '', description: '', maxScore: 25 }]);
  };

  const handleRemoveCriterion = (idx) => {
    setRCriteria(rCriteria.filter((_, i) => i !== idx));
  };

  const handleCriterionChange = (idx, field, value) => {
    const updated = rCriteria.map((c, i) => i === idx ? { ...c, [field]: value } : c);
    setRCriteria(updated);
  };

  const handleSaveRubric = (assignmentId) => {
    const validCriteria = rCriteria.filter(c => c.name.trim() && c.maxScore > 0);
    if (validCriteria.length === 0) {
      addToast('Add at least one criterion with a name and max score', 'error');
      return;
    }
    setIsSavingRubric(true);
    const existing = rubrics.find(r => r.assignmentId === assignmentId);
    if (existing) {
      deleteRubric(existing.id);
    }
    createRubric({ assignmentId, criteria: validCriteria });
    setIsSavingRubric(false);
    addToast('Rubric saved successfully', 'success');
    setShowRubricFor(null);
    setRCriteria([{ name: '', description: '', maxScore: 25 }]);
  };

  const loadRubric = (assignmentId) => {
    const rub = rubrics.find(r => r.assignmentId === assignmentId);
    if (rub) {
      setRCriteria(rub.criteria.map(c => ({ name: c.name, description: c.description, maxScore: c.maxScore })));
    } else {
      setRCriteria([{ name: '', description: '', maxScore: 25 }]);
    }
    setShowRubricFor(assignmentId);
  };

  return (
    <Container>
      <PrimaryBtn onClick={() => setShowCreator(!showCreator)} style={{ marginBottom: '1.5rem', maxWidth: '280px' }}>
        <Plus size={20} /> {showCreator ? 'Cancel' : 'Create New Assignment'}
      </PrimaryBtn>

      {showCreator && (
        <AssignForm>
          <h4 style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.125rem' }}>Assignment Creator Tool</h4>
          <form onSubmit={handleCreateAssignment}>
            <FormGrid>
              <FormGroup $full>
                <Label>Title</Label>
                <FormInput placeholder="e.g. Final Project Submission" value={aTitle} onChange={e => setATitle(e.target.value)} required />
              </FormGroup>
              <FormGroup $full>
                <Label>Description</Label>
                <MarkdownEditor value={aDesc} onChange={setADesc} placeholder="Describe the assignment..." />
              </FormGroup>
              <FormGroup>
                <Label>Course</Label>
                <FormSelect value={aCourse} onChange={e => setACourse(e.target.value)} required>
                  <option value="">Select a course</option>
                  {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.name}</option>)}
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <Label>Due Date</Label>
                <FormInput type="datetime-local" value={aDue} onChange={e => setADue(e.target.value)} required />
              </FormGroup>
              <FormGroup>
                <Label>Max File Size (MB)</Label>
                <FormInput type="number" value={aMaxSize} onChange={e => setAMaxSize(e.target.value)} min="1" max="100" />
              </FormGroup>
              <FormGroup>
                <Label>Allowed Extensions</Label>
                <FormInput value={aExt} onChange={e => setAExt(e.target.value)} placeholder=".pdf, .zip, .docx" />
              </FormGroup>
              <FormGroup $full>
                <Label>Submission Types</Label>
                <CheckboxGroup>
                  <CheckboxLabel><input type="checkbox" checked={aDoc} onChange={e => setADoc(e.target.checked)} /> Documents</CheckboxLabel>
                  <CheckboxLabel><input type="checkbox" checked={aVideo} onChange={e => setAVideo(e.target.checked)} /> Video Links</CheckboxLabel>
                  <CheckboxLabel><input type="checkbox" checked={aProject} onChange={e => setAProject(e.target.checked)} /> Multi-file Project</CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>
              <FormGroup $full>
                <Label><Paperclip size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} /> Attachments (instructions, rubrics, references)</Label>
                <AttachUploadArea onClick={() => document.getElementById('attach-input-create')?.click()}>
                  <Upload size={18} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload or drag files</span>
                  <input
                    id="attach-input-create"
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.jpg,.jpeg,.png,.gif"
                    onChange={e => {
                      const newFiles = Array.from(e.target.files || []).map(f => ({ file: f, id: Date.now() + Math.random() }));
                      setAttachFiles(prev => [...prev, ...newFiles]);
                      e.target.value = '';
                    }}
                  />
                </AttachUploadArea>
                {attachFiles.length > 0 && (
                  <AttachList>
                    {attachFiles.map((f, i) => (
                      <AttachItem key={i}>
                        <FileText size={14} style={{ color: '#b35a38', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.existing?.name || f.file?.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#999', flexShrink: 0 }}>
                          {f.existing ? `${f.existing.size} MB` : `${(f.file.size / 1024 / 1024).toFixed(2)} MB`}
                        </span>
                        <AttachRemove onClick={() => setAttachFiles(prev => prev.filter((_, j) => j !== i))}>
                          <X size={13} />
                        </AttachRemove>
                      </AttachItem>
                    ))}
                  </AttachList>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Late Penalty (%/day)</Label>
                <LatePenaltyRow>
                  <FormInput type="number" value={aLatePenalty} onChange={e => setALatePenalty(e.target.value)} min="0" max="50" style={{ width: '80px' }} />
                  <span>% deducted per day late</span>
                </LatePenaltyRow>
              </FormGroup>
              <FormGroup>
                <Label>Resubmission</Label>
                <CheckboxGroup>
                  <CheckboxLabel><input type="checkbox" checked={aAllowResub} onChange={e => setAAllowResub(e.target.checked)} /> <RotateCcw size={14} /> Allow Resubmission</CheckboxLabel>
                  {aAllowResub && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      Max: <FormInput type="number" value={aMaxResub} onChange={e => setAMaxResub(e.target.value)} min="1" max="10" style={{ width: '60px', padding: '0.4rem' }} />
                    </span>
                  )}
                </CheckboxGroup>
              </FormGroup>
            </FormGrid>
            <CreateBtn type="submit" disabled={isCreating}>
              {isCreating ? <><Loader className="spin" size={18} /> Creating...</> : 'Create Assignment'}
            </CreateBtn>
          </form>
        </AssignForm>
      )}

      {assignments.map(a => (
        <AssignCard key={a.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          {editingId === a.id ? (
            <form onSubmit={handleUpdateAssignment}>
              <FormGrid>
                <FormGroup $full>
                  <Label>Title</Label>
                  <FormInput value={aTitle} onChange={e => setATitle(e.target.value)} required />
                </FormGroup>
                <FormGroup $full>
                  <Label>Description</Label>
                  <MarkdownEditor value={aDesc} onChange={setADesc} />
                </FormGroup>
                <FormGroup>
                  <Label>Course</Label>
                  <FormSelect value={aCourse} onChange={e => setACourse(e.target.value)} required>
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.code}>{c.code} - {c.name}</option>)}
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <Label>Due Date</Label>
                  <FormInput type="datetime-local" value={aDue} onChange={e => setADue(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                  <Label>Max Size (MB)</Label>
                  <FormInput type="number" value={aMaxSize} onChange={e => setAMaxSize(e.target.value)} min="1" max="100" />
                </FormGroup>
                <FormGroup>
                  <Label>Extensions</Label>
                  <FormInput value={aExt} onChange={e => setAExt(e.target.value)} placeholder=".pdf, .zip" />
                </FormGroup>
                <FormGroup $full>
                  <Label>Submission Types</Label>
                  <CheckboxGroup>
                    <CheckboxLabel><input type="checkbox" checked={aDoc} onChange={e => setADoc(e.target.checked)} /> Documents</CheckboxLabel>
                    <CheckboxLabel><input type="checkbox" checked={aVideo} onChange={e => setAVideo(e.target.checked)} /> Video Links</CheckboxLabel>
                    <CheckboxLabel><input type="checkbox" checked={aProject} onChange={e => setAProject(e.target.checked)} /> Project</CheckboxLabel>
                  </CheckboxGroup>
                </FormGroup>
                <FormGroup $full>
                  <Label><Paperclip size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} /> Attachments</Label>
                  <AttachUploadArea onClick={() => document.getElementById('attach-input-edit')?.click()}>
                    <Upload size={18} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload or drag files</span>
                    <input
                      id="attach-input-edit"
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.jpg,.jpeg,.png,.gif"
                      onChange={e => {
                        const newFiles = Array.from(e.target.files || []).map(f => ({ file: f, id: Date.now() + Math.random() }));
                        setAttachFiles(prev => [...prev, ...newFiles]);
                        e.target.value = '';
                      }}
                    />
                  </AttachUploadArea>
                  {attachFiles.length > 0 && (
                    <AttachList>
                      {attachFiles.map((f, i) => (
                        <AttachItem key={i}>
                          <FileText size={14} style={{ color: '#b35a38', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.existing?.name || f.file?.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#999', flexShrink: 0 }}>
                            {f.existing ? `${f.existing.size} MB` : `${(f.file.size / 1024 / 1024).toFixed(2)} MB`}
                          </span>
                          <AttachRemove onClick={() => setAttachFiles(prev => prev.filter((_, j) => j !== i))}>
                            <X size={13} />
                          </AttachRemove>
                        </AttachItem>
                      ))}
                    </AttachList>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label>Late Penalty (%/day)</Label>
                  <FormInput type="number" value={aLatePenalty} onChange={e => setALatePenalty(e.target.value)} min="0" max="50" style={{ width: '80px' }} />
                </FormGroup>
                <FormGroup>
                  <Label>Resubmission</Label>
                  <CheckboxGroup>
                    <CheckboxLabel><input type="checkbox" checked={aAllowResub} onChange={e => setAAllowResub(e.target.checked)} /> Allow Resubmission</CheckboxLabel>
                    {aAllowResub && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        Max: <FormInput type="number" value={aMaxResub} onChange={e => setAMaxResub(e.target.value)} min="1" max="10" style={{ width: '60px', padding: '0.4rem' }} />
                      </span>
                    )}
                  </CheckboxGroup>
                </FormGroup>
              </FormGrid>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <PrimaryBtn type="submit" disabled={isUpdating} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  {isUpdating ? <><Loader className="spin" size={14} /> Saving...</> : <><Check size={14} /> Save</>}
                </PrimaryBtn>
                <SecondaryBtn type="button" onClick={() => { setEditingId(null); resetForm(); }} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  <X size={14} /> Cancel
                </SecondaryBtn>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{a.title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#55433c', fontWeight: 600 }}>
                    {a.courseCode} &middot; Due: {new Date(a.dueDate).toLocaleDateString('en-GB', { dateStyle: 'long' })} &middot; {a.maxSize}MB &middot; {a.allowedExtensions?.join(', ')}
                    {a.latePenalty > 0 && <span style={{ marginLeft: '0.75rem', color: '#b35a38' }}><AlertTriangle size={12} /> {a.latePenalty}%/day late penalty</span>}
                    {a.allowResubmission && <span style={{ marginLeft: '0.75rem', color: '#4a7c59' }}><RotateCcw size={12} /> Resubmission allowed (max {a.maxResubmissions})</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <ActionBtn onClick={() => handleEditAssignment(a)} title="Edit assignment">
                    <Pencil size={13} /> Edit
                  </ActionBtn>
                  <ActionBtn $danger onClick={() => setDeletingId(a.id)} title="Delete assignment">
                    <Trash2 size={13} /> Delete
                  </ActionBtn>
                  <SecondaryBtn onClick={() => loadRubric(a.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                    <ClipboardList size={14} /> {rubrics.find(r => r.assignmentId === a.id) ? 'Edit' : 'Add'} Rubric
                  </SecondaryBtn>
                </div>
              </div>

              {a.attachments?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
                  {a.attachments.map((att, i) => (
                    <CardAttachRow
                      key={i}
                      href="#"
                      onClick={e => { e.preventDefault(); handleDownloadAttach(att.storagePath, att.name); }}
                    >
                      <Paperclip size={13} style={{ color: '#b35a38', flexShrink: 0 }} />
                      <CardAttachName>{att.name}</CardAttachName>
                      <CardAttachSize>{att.size} MB</CardAttachSize>
                      {downloadingAttach === att.storagePath ? (
                        <Loader size={12} className="spin" style={{ flexShrink: 0 }} />
                      ) : (
                        <Download size={12} style={{ color: '#b35a38', flexShrink: 0 }} />
                      )}
                    </CardAttachRow>
                  ))}
                </div>
              )}

              {showRubricFor === a.id && (
                <RubricSection>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <Label style={{ fontSize: '0.85rem' }}>Rubric Criteria</Label>
                    <SecondaryBtn onClick={handleAddCriterion} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                      <Plus size={12} /> Add Criterion
                    </SecondaryBtn>
                  </div>
                  {rCriteria.map((c, idx) => (
                    <RubricCriterionRow key={idx}>
                      <RubricInput placeholder="Criterion name" value={c.name} onChange={e => handleCriterionChange(idx, 'name', e.target.value)} />
                      <RubricInput placeholder="Description (optional)" value={c.description} onChange={e => handleCriterionChange(idx, 'description', e.target.value)} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RubricSmallInput type="number" min="1" max="100" value={c.maxScore} onChange={e => handleCriterionChange(idx, 'maxScore', e.target.value)} />
                        {rCriteria.length > 1 && (
                          <button onClick={() => handleRemoveCriterion(idx)} style={{ background: 'none', border: 'none', color: '#b35a38', cursor: 'pointer', padding: '0.25rem' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </RubricCriterionRow>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <SecondaryBtn onClick={() => setShowRubricFor(null)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Cancel</SecondaryBtn>
                    <PrimaryBtn onClick={() => handleSaveRubric(a.id)} disabled={isSavingRubric} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                      {isSavingRubric ? <><Loader className="spin" size={14} /> Saving...</> : 'Save Rubric'}
                    </PrimaryBtn>
                  </div>
                </RubricSection>
              )}

              {rubrics.find(r => r.assignmentId === a.id) && showRubricFor !== a.id && (
                <RubricSection>
                  <div style={{ fontSize: '0.8rem', color: '#4a7c59', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ClipboardList size={14} /> Rubric set — {rubrics.find(r => r.assignmentId === a.id).criteria.length} criteria
                  </div>
                </RubricSection>
              )}
            </>
          )}
        </AssignCard>
      ))}

      {deletingId && (
        <ConfirmOverlay onClick={() => setDeletingId(null)}>
          <ConfirmBox onClick={e => e.stopPropagation()}>
            <h4>Delete Assignment?</h4>
            <p>This will permanently remove the assignment and cannot be undone.</p>
            <ConfirmActions>
              <SecondaryBtn onClick={() => setDeletingId(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</SecondaryBtn>
              <PrimaryBtn onClick={handleDeleteAssignment} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#dc2626' }}>
                <Trash2 size={14} /> Delete
              </PrimaryBtn>
            </ConfirmActions>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </Container>
  );
};

export default LecturerAssignments;
