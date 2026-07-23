import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  BookOpen, 
  User, 
  Calendar, 
  ArrowRight,
  Edit2,
  Trash2,
  Plus,
  X,
  Layers,
  Clock,
  Image as ImageIcon,
  Camera,
  Check, Loader,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useToastStore } from '../../store/toastStore';

const Container = styled.div`
  padding: 1rem;
`;

const FlexHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3.5rem;
  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; gap: 1rem; }
`;

const HeaderInfo = styled.div``;

const Title = styled.h2`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.75rem;
  letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1.125rem;
  font-weight: 500;
`;

const AddCourseBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 16px rgba(179, 90, 56, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(179, 90, 56, 0.3);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${({ theme }) => theme.colors.border}20;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-color: ${({ theme }) => theme.colors.primary}30;
  }
`;

const CardImage = styled.div`
  height: 160px;
  background: ${({ theme, $image, accent }) =>
    $image ? `url(${$image}) center/cover no-repeat` : (accent || theme.colors.primary)};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $image }) => $image
      ? 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%)'};
    z-index: 1;
  }

  svg {
    color: white;
    opacity: ${({ $image }) => $image ? '0.7' : '0.9'};
    z-index: 2;
  }
`;

const ImageUploadBtn = styled.button`
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0,0,0,0.45);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.2);

  &:hover {
    background: rgba(0,0,0,0.65);
    transform: scale(1.1);
  }
`;

const CardContent = styled.div`
  padding: 2rem;
  flex: 1;
`;

const Badge = styled.span`
  background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.375rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
`;

const CourseTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const Instructor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1.5px solid ${({ theme }) => theme.colors.background.alt};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
  font-weight: 600;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const AssignLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.25rem 0;
  margin-top: 0.75rem;

  &:hover {
    text-decoration: underline;
  }
`;

const CardFooter = styled.div`
  padding: 1.25rem 2rem;
  background: ${({ theme }) => theme.colors.background.alt}40;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const AcceptBtn = styled.button`
  background: ${({ $accepted, disabled, theme }) => disabled ? theme.colors.border : $accepted ? theme.colors.tertiary : 'transparent'};
  color: ${({ $accepted, disabled, theme }) => disabled ? 'white' : $accepted ? 'white' : theme.colors.primary};
  font-weight: 800;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${({ $accepted, disabled }) => disabled || $accepted ? '0.5rem 1rem' : '0'};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    text-decoration: ${({ $accepted, disabled }) => disabled ? 'none' : $accepted ? 'none' : 'underline'};
  }
`;

const IconBtn = styled.button`
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.background.alt};
  color: ${({ theme, disabled }) => disabled ? '#999' : theme.colors.text.muted};
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${({ theme, disabled }) => disabled ? theme.colors.border : `${theme.colors.primary}15`};
    color: ${({ theme, disabled }) => disabled ? '#999' : theme.colors.primary};
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-1px)'};
  }
`;

// ─── Modal Styles ────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(30, 20, 15, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2.5rem;
  width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
  @media (max-width: 600px) { width: 90vw; padding: 1.5rem; }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: ${({ theme }) => theme.colors.text.muted};
  background: transparent;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.main};
`;

const ModalSub = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 600;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem;
  font-weight: 600;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem;
  font-weight: 600;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ColorPalette = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const ColorBubble = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $active }) => $active ? '#1c1c19' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const PrimaryBtn = styled.button`
  flex: 1;
  padding: 0.875rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  font-size: 0.9375rem;
  box-shadow: 0 6px 16px ${({ theme }) => theme.colors.primary}30;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SecondaryBtn = styled.button`
  padding: 0.875rem 1.5rem;
  background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.text.main};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  font-size: 0.9375rem;
  transition: all 0.2s;
`;

const ImageUploadArea = styled.div`
  position: relative;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ImagePreview = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

const ImageUploadInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
  z-index: 1;
  pointer-events: none;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const RemoveImageBtn = styled.button`
  z-index: 1;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.error || '#b35a38'};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255,255,255,0.9);
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
`;

const AssignList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
  max-height: 400px;
  overflow-y: auto;
`;

const AssignCard = styled.div`
  background: ${({ theme }) => theme.colors.background.alt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.25rem;
`;

const AssignTitle = styled.h4`
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.4rem;
`;

const AssignDesc = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.5;
  margin-bottom: 0.75rem;
`;

const AssignMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const EmptyAssign = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  padding: 2rem 0;
`;

const PRESET_COLORS = [
  '#b35a38', // Terracotta
  '#daa520', // Savanna Gold
  '#4a7c59', // Forest Green
  '#6F240A', // Deep Auburn
  '#1e40af', // Academic Blue
  '#6d28d9'  // Royal Purple
];

const CourseList = () => {
  const user = useAuthStore(state => state.user);
  const acceptedCourses = useAuthStore(state => state.acceptedCourses);
  const acceptCourse = useAuthStore(state => state.acceptCourse);
  const isLecturer = user?.role === 'lecturer';
  const isAdmin = user?.role === 'admin';
  const canManageCourses = isLecturer || isAdmin;

  const { courses, addCourse, updateCourse, deleteCourse, updateCourseImage } = useCourseStore();
  const assignments = useAssignmentStore(state => state.assignments);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [assignModalCourse, setAssignModalCourse] = useState(null);
  const [acceptingCourseId, setAcceptingCourseId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState('3.0');
  const [schedule, setSchedule] = useState('');
  const [accent, setAccent] = useState(PRESET_COLORS[0]);
  const [imagePreview, setImagePreview] = useState(null);

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    // Prefill instructor name if the lecturer is adding the course
    setInstructor(canManageCourses ? user.name : '');
    setCredits('3.0');
    setSchedule('');
    setAccent(PRESET_COLORS[0]);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setCode(course.code);
    setName(course.name);
    setInstructor(course.instructor);
    setCredits(course.credits);
    setSchedule(course.schedule);
    setAccent(course.accent);
    setImagePreview(course.image || null);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || !name || !instructor || !schedule) return;

    const courseData = {
      code,
      name,
      instructor,
      credits,
      schedule,
      accent,
      image: imagePreview || undefined,
      user_id: user?.id || null,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, courseData);
    } else {
      addCourse(courseData);
    }

    setModalOpen(false);
  };

  return (
    <Container>
      <FlexHeader>
        <HeaderInfo>
          <Title>Academic Courses</Title>
          <Subtitle>Your personalized curriculum for the Semester.</Subtitle>
        </HeaderInfo>
        {canManageCourses && (
          <AddCourseBtn onClick={handleOpenAddModal}>
            <Plus size={20} /> Add Course
          </AddCourseBtn>
        )}
      </FlexHeader>

      <Grid>
        {courses.map(course => (
          <CourseCard key={course.id}>
            <CardImage accent={course.accent} $image={course.image}>
              <BookOpen size={64} strokeWidth={1.5} />
              {canManageCourses && (
                <ImageUploadBtn
                  onClick={(e) => { e.stopPropagation(); document.getElementById(`img-upload-${course.id}`).click(); }}
                  title="Change featured image"
                >
                  <Camera size={16} />
                </ImageUploadBtn>
              )}
              <input
                id={`img-upload-${course.id}`}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      updateCourseImage(course.id, ev.target.result);
                      useToastStore.getState().addToast('Course image updated', 'success');
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
            </CardImage>
            <CardContent>
              <Badge>{course.code}</Badge>
              <CourseTitle>{course.name}</CourseTitle>
              <Instructor>
                <User size={16} /> {course.instructor}
              </Instructor>
              
              <MetaGrid>
                <MetaItem>
                  <Layers size={16} /> {course.credits} Credits
                </MetaItem>
                <MetaItem>
                  <Clock size={16} /> {course.schedule}
                </MetaItem>
              </MetaGrid>
              <AssignLink onClick={() => setAssignModalCourse(course)}>
                <ClipboardList size={15} />
                {assignments.filter(a => a.courseCode === course.code).length} Assignment{assignments.filter(a => a.courseCode === course.code).length !== 1 ? 's' : ''}
              </AssignLink>
            </CardContent>
            <CardFooter>
              {!canManageCourses && (
                <AcceptBtn
                  $accepted={acceptedCourses.includes(course.id)}
                  onClick={() => { setAcceptingCourseId(course.id); acceptCourse(course.id); setTimeout(() => setAcceptingCourseId(null), 600); }}
                  disabled={acceptingCourseId === course.id}
                >
                  {acceptingCourseId === course.id ? (
                    <><Loader className="spin" size={16} /> Accepting...</>
                  ) : acceptedCourses.includes(course.id) ? (
                    <><Check size={16} /> Accepted</>
                  ) : (
                    <>Accept Course <ArrowRight size={16} /></>
                  )}
                </AcceptBtn>
              )}
              {canManageCourses && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <IconBtn onClick={() => handleOpenEditModal(course)} title="Edit Course">
                    <Edit2 size={16} />
                  </IconBtn>
                  <IconBtn onClick={async () => { setDeletingCourseId(course.id); await deleteCourse(course.id); setDeletingCourseId(null); }} title="Delete Course" disabled={deletingCourseId === course.id} style={{ color: deletingCourseId === course.id ? '#999' : '#b35a38' }}>
                    {deletingCourseId === course.id ? <Loader className="spin" size={16} /> : <Trash2 size={16} />}
                  </IconBtn>
                </div>
              )}
            </CardFooter>
          </CourseCard>
        ))}
      </Grid>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Overlay onClick={() => setModalOpen(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalClose onClick={() => setModalOpen(false)}>
              <X size={24} />
            </ModalClose>
            <ModalTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</ModalTitle>
            <ModalSub>
              {editingCourse ? 'Update details for this course card.' : 'Fill out the form to launch a new course.'}
            </ModalSub>

            <form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>Course Code</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. IT 401" 
                  value={code} 
                  onChange={e => setCode(e.target.value)} 
                  required 
                />
              </InputGroup>

              <InputGroup>
                <Label>Course Title</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Advanced Software Engineering" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </InputGroup>

              <InputGroup>
                <Label>Instructor</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Dr. John Mensah" 
                  value={instructor} 
                  onChange={e => setInstructor(e.target.value)} 
                  required 
                />
              </InputGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputGroup>
                  <Label>Credits</Label>
                  <Select value={credits} onChange={e => setCredits(e.target.value)}>
                    <option value="1.0">1.0 Credit</option>
                    <option value="2.0">2.0 Credits</option>
                    <option value="3.0">3.0 Credits</option>
                    <option value="4.0">4.0 Credits</option>
                    <option value="5.0">5.0 Credits</option>
                  </Select>
                </InputGroup>

                <InputGroup>
                  <Label>Schedule</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. Mon, Wed 10:00 AM" 
                    value={schedule} 
                    onChange={e => setSchedule(e.target.value)} 
                    required 
                  />
                </InputGroup>
              </div>

              <InputGroup>
                <Label>Featured Image</Label>
                <ImageUploadArea>
                  {imagePreview && <ImagePreview src={imagePreview} alt="" />}
                  <ImageUploadInput>
                    <ImageIcon size={24} />
                    <span>{imagePreview ? 'Change Image' : 'Upload Image (optional)'}</span>
                  </ImageUploadInput>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagePreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {imagePreview && (
                    <RemoveImageBtn type="button" onClick={() => setImagePreview(null)}>
                      <X size={16} /> Remove
                    </RemoveImageBtn>
                  )}
                </ImageUploadArea>
              </InputGroup>

              <InputGroup>
                <Label>Accent Color Theme</Label>
                <ColorPalette>
                  {PRESET_COLORS.map(color => (
                    <ColorBubble 
                      key={color} 
                      type="button" 
                      $color={color} 
                      $active={accent === color} 
                      onClick={() => setAccent(color)} 
                    />
                  ))}
                </ColorPalette>
              </InputGroup>

              <ModalActions>
                <SecondaryBtn type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit">
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </PrimaryBtn>
              </ModalActions>
            </form>
          </Modal>
        </Overlay>
      )}

      {/* Assignments Modal */}
      {assignModalCourse && (
        <Overlay onClick={() => setAssignModalCourse(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalClose onClick={() => setAssignModalCourse(null)}>
              <X size={24} />
            </ModalClose>
            <ModalTitle>{assignModalCourse.code} — Assignments</ModalTitle>
            <ModalSub>
              {assignModalCourse.name}
            </ModalSub>

            <AssignList>
              {assignments.filter(a => a.courseCode === assignModalCourse.code).length === 0 && (
                <EmptyAssign>No assignments yet for this course.</EmptyAssign>
              )}
              {assignments
                .filter(a => a.courseCode === assignModalCourse.code)
                .map(assignment => (
                  <AssignCard key={assignment.id}>
                    <AssignTitle>{assignment.title}</AssignTitle>
                    <AssignDesc>{assignment.description}</AssignDesc>
                    <AssignMeta>
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{assignment.lecturerName}</span>
                    </AssignMeta>
                  </AssignCard>
                ))}
            </AssignList>

            <ModalActions>
              <SecondaryBtn type="button" onClick={() => setAssignModalCourse(null)}>Close</SecondaryBtn>
            </ModalActions>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
};

export default CourseList;
