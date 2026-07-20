import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useCourseStore } from '../../store/courseStore';
import { useToastStore } from '../../store/toastStore';
import { useRubricStore } from '../../store/rubricStore';
import { Plus, RotateCcw, AlertTriangle, ClipboardList, Trash2, Loader } from 'lucide-react';
import {
  Container, PrimaryBtn, AssignForm, FormGrid, FormGroup, Label,
  FormInput, FormTextarea, FormSelect, CheckboxGroup, CheckboxLabel,
  CreateBtn, AssignCard, SecondaryBtn
} from './lecturerStyles';
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

const LecturerAssignments = () => {
  const user = useAuthStore(s => s.user);
  const assignments = useAssignmentStore(s => s.assignments);
  const createAssignment = useAssignmentStore(s => s.createAssignment);
  const courses = useCourseStore(s => s.courses);
  const rubrics = useRubricStore(s => s.rubrics);
  const createRubric = useRubricStore(s => s.createRubric);
  const deleteRubric = useRubricStore(s => s.deleteRubric);
  const addToast = useToastStore(s => s.addToast);

  const [showRubricFor, setShowRubricFor] = useState(null);
  const [rCriteria, setRCriteria] = useState([{ name: '', description: '', maxScore: 25 }]);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingRubric, setIsSavingRubric] = useState(false);

  const [showCreator, setShowCreator] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aCourse, setACourse] = useState('IT 401');
  const [aDue, setADue] = useState('');
  const [aMaxSize, setAMaxSize] = useState('10');
  const [aExt, setAExt] = useState('.pdf');
  const [aDoc, setADoc] = useState(true);
  const [aVideo, setAVideo] = useState(false);
  const [aProject, setAProject] = useState(false);
  const [aLatePenalty, setALatePenalty] = useState('5');
  const [aAllowResub, setAAllowResub] = useState(true);
  const [aMaxResub, setAMaxResub] = useState('3');

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!aTitle || !aDesc || !aDue) return;
    setIsCreating(true);
    createAssignment({
      courseCode: aCourse,
      title: aTitle,
      description: aDesc,
      dueDate: new Date(aDue).toISOString(),
      submissionTypes: { document: aDoc, video: aVideo, project: aProject },
      maxSize: Number(aMaxSize),
      allowedExtensions: aExt.split(',').map(e => e.trim()),
      lecturerName: user?.name || 'Lecturer',
    });
    setIsCreating(false);
    addToast('Assignment created', 'success');
    setShowCreator(false);
    setATitle(''); setADesc(''); setADue(''); setAMaxSize('10'); setAExt('.pdf');
    setADoc(true); setAVideo(false); setAProject(false);
    setALatePenalty('5'); setAAllowResub(true); setAMaxResub('3');
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
                <FormTextarea placeholder="Describe the assignment..." value={aDesc} onChange={e => setADesc(e.target.value)} required />
              </FormGroup>
              <FormGroup>
                <Label>Course</Label>
                <FormSelect value={aCourse} onChange={e => setACourse(e.target.value)}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{a.title}</h4>
              <p style={{ fontSize: '0.8125rem', color: '#55433c', fontWeight: 600 }}>
                {a.courseCode} &middot; Due: {new Date(a.dueDate).toLocaleDateString('en-GB', { dateStyle: 'long' })} &middot; {a.maxSize}MB &middot; {a.allowedExtensions?.join(', ')}
                {a.latePenalty > 0 && <span style={{ marginLeft: '0.75rem', color: '#b35a38' }}><AlertTriangle size={12} /> {a.latePenalty}%/day late penalty</span>}
                {a.allowResubmission && <span style={{ marginLeft: '0.75rem', color: '#4a7c59' }}><RotateCcw size={12} /> Resubmission allowed (max {a.maxResubmissions})</span>}
              </p>
            </div>
            <SecondaryBtn onClick={() => loadRubric(a.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
              <ClipboardList size={14} /> {rubrics.find(r => r.assignmentId === a.id) ? 'Edit' : 'Add'} Rubric
            </SecondaryBtn>
          </div>

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
        </AssignCard>
      ))}
    </Container>
  );
};

export default LecturerAssignments;
