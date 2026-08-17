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
  ClipboardList,
  Paperclip,
  Upload,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import { supabase } from '../../lib/supabase';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useToastStore } from '../../store/toastStore';
import { useUploadStore } from '../../store/uploadStore';

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

const CardAttachRow = styled.a`
  display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.55rem;
  background: ${({ theme }) => theme.colors.background?.alt || '#f5f5f5'};
  border-radius: 6px; text-decoration: none; font-size: 0.75rem; font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.primary}12; }
`;

const CardAttachName = styled.span`
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
`;

const CardAttachSize = styled.span`
  font-size: 0.65rem; color: ${({ theme }) => theme.colors.text.muted}; flex-shrink: 0;
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
  max-height: 90vh;
  overflow-y: auto;
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

const DayPicker = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DayChip = styled.button`
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border + '60'};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'white'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.muted};
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TimeRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const TimeInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem;
  font-weight: 600;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TimeSeparator = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SchedulePreview = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
`;

const AttachUploadArea = styled.div`
  border: 1.5px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.25rem; text-align: center; cursor: pointer;
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
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const parseSchedule = (str) => {
    if (!str) return { days: [], start: '', end: '' };
    const days = DAYS.filter(d => str.includes(d));
    const timeMatch = str.match(/(\d{1,2}:\d{2})\s*(?:AM|PM)?(?:\s*-\s*(\d{1,2}:\d{2})\s*(?:AM|PM)?)?/i);
    return { days, start: timeMatch?.[1] || '', end: timeMatch?.[2] || '' };
  };

  const composeSchedule = (days, start, end) => {
    if (days.length === 0) return '';
    const dayStr = days.join(', ');
    if (start && end) return `${dayStr} ${start} - ${end}`;
    if (start) return `${dayStr} ${start}`;
    return dayStr;
  };

  const user = useAuthStore(state => state.user);
  const acceptedCourses = useAuthStore(state => state.acceptedCourses);
  const acceptCourse = useAuthStore(state => state.acceptCourse);
  const isLecturer = user?.role === 'lecturer';
  const isAdmin = user?.role === 'admin';
  const canManageCourses = isLecturer || isAdmin;

  const { courses, addCourse, updateCourse, deleteCourse, uploadCourseImage, deleteCourseImage } = useCourseStore();
  const assignments = useAssignmentStore(state => state.assignments);
  const startUpload = useUploadStore(s => s.startUpload);
  const updateProgress = useUploadStore(s => s.updateProgress);
  const completeUpload = useUploadStore(s => s.completeUpload);
  const failUpload = useUploadStore(s => s.failUpload);
  const clearUploads = useUploadStore(s => s.clearUploads);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [assignModalCourse, setAssignModalCourse] = useState(null);
  const [acceptingCourseId, setAcceptingCourseId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState('3.0');
  const [schedule, setSchedule] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [accent, setAccent] = useState(PRESET_COLORS[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [attachFiles, setAttachFiles] = useState([]);
  const [downloadingAttach, setDownloadingAttach] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleDownloadCourseAttach = async (storagePath, fileName) => {
    setDownloadingAttach(storagePath);
    const { data, error } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) {
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

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setInstructor(canManageCourses ? user.name : '');
    setCredits('3.0');
    setSchedule('');
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
    setAccent(PRESET_COLORS[0]);
    setImagePreview(null);
    setImageFile(null);
    setAttachFiles([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setCode(course.code);
    setName(course.name);
    setInstructor(course.instructor);
    setCredits(course.credits);
    setSchedule(course.schedule);
    const parsed = parseSchedule(course.schedule);
    setSelectedDays(parsed.days);
    setStartTime(parsed.start);
    setEndTime(parsed.end);
    setAccent(course.accent);
    setImagePreview(course.image || null);
    setImageFile(null);
    setAttachFiles((course.attachments || []).map(att => ({ existing: att })));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const composedSchedule = composeSchedule(selectedDays, startTime, endTime);
    if (!code || !name || !instructor || !composedSchedule) return;
    setSaving(true);

    const existingAttachments = attachFiles.filter(f => f.existing).map(f => f.existing);
    const newFiles = attachFiles.filter(f => !f.existing);

    clearUploads();
    const uploadedNew = [];
    for (const f of newFiles) {
      const uploadId = `course-${Date.now()}-${f.file.name}`;
      startUpload(uploadId, f.file.name, f.file.size);

      const storagePath = `${user?.id}/course-${Date.now()}_${f.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

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
        setSaving(false);
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

    const attachments = [...existingAttachments, ...uploadedNew];

    const courseData = {
      code,
      name,
      instructor,
      credits,
      schedule: composedSchedule,
      accent,
      user_id: user?.id || null,
      attachments,
    };

    if (editingCourse) {
      await updateCourse(editingCourse.id, courseData);
      if (imageFile) await uploadCourseImage(editingCourse.id, imageFile);
    } else {
      const newCourse = await addCourse(courseData);
      if (newCourse && imageFile) await uploadCourseImage(newCourse.id, imageFile);
    }

    setModalOpen(false);
    setImageFile(null);
    setAttachFiles([]);
    setSaving(false);
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
                    uploadCourseImage(course.id, file).then(() => {
                      useToastStore.getState().addToast('Course image updated', 'success');
                    });
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
              {course.attachments?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                  {course.attachments.map((att, i) => (
                    <CardAttachRow
                      key={i}
                      href="#"
                      onClick={e => { e.preventDefault(); handleDownloadCourseAttach(att.storagePath, att.name); }}
                    >
                      <Paperclip size={12} style={{ color: '#b35a38', flexShrink: 0 }} />
                      <CardAttachName>{att.name}</CardAttachName>
                      <CardAttachSize>{att.size} MB</CardAttachSize>
                    </CardAttachRow>
                  ))}
                </div>
              )}
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
                  <IconBtn onClick={() => setConfirmDeleteId(course.id)} title="Delete Course" disabled={deletingCourseId === course.id} style={{ color: deletingCourseId === course.id ? '#999' : '#b35a38' }}>
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
                  <Label>Time</Label>
                  <TimeRow>
                    <TimeInput
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                    <TimeSeparator>to</TimeSeparator>
                    <TimeInput
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </TimeRow>
                </InputGroup>
              </div>

              <InputGroup>
                <Label>Days</Label>
                <DayPicker>
                  {DAYS.map(day => (
                    <DayChip
                      key={day}
                      type="button"
                      $active={selectedDays.includes(day)}
                      onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                    >
                      {day}
                    </DayChip>
                  ))}
                </DayPicker>
                {(selectedDays.length > 0 || startTime) && (
                  <SchedulePreview>
                    {composeSchedule(selectedDays, startTime, endTime) || 'Select days and time'}
                  </SchedulePreview>
                )}
              </InputGroup>

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
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreview && (
                    <RemoveImageBtn type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}>
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

              <InputGroup>
                <Label><Paperclip size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} /> Attachments (syllabus, outline, resources)</Label>
                <AttachUploadArea onClick={() => document.getElementById('course-attach-input')?.click()}>
                  <Upload size={18} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload files</span>
                  <input
                    id="course-attach-input"
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
              </InputGroup>

              <ModalActions>
                <SecondaryBtn type="button" onClick={() => setModalOpen(false)}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? <><Loader className="spin" size={18} /> Saving...</> : editingCourse ? 'Save Changes' : 'Create Course'}
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
      {confirmDeleteId && (() => {
        const course = courses.find(c => c.id === confirmDeleteId);
        return (
          <Overlay onClick={() => setConfirmDeleteId(null)}>
            <Modal onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Delete Course?</ModalTitle>
                <CloseBtn onClick={() => setConfirmDeleteId(null)}><X size={20} /></CloseBtn>
              </ModalHeader>
              <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                This will permanently delete <strong>{course?.name}</strong> ({course?.code}) and all its attachments. This action cannot be undone.
              </p>
              <ModalActions>
                <SecondaryBtn onClick={() => setConfirmDeleteId(null)}>Cancel</SecondaryBtn>
                <PrimaryBtn
                  onClick={async () => {
                    setDeletingCourseId(confirmDeleteId);
                    await deleteCourse(confirmDeleteId);
                    setDeletingCourseId(null);
                    setConfirmDeleteId(null);
                  }}
                  style={{ background: '#dc2626' }}
                >
                  {deletingCourseId === confirmDeleteId ? <><Loader className="spin" size={16} /> Deleting...</> : 'Delete'}
                </PrimaryBtn>
              </ModalActions>
            </Modal>
          </Overlay>
        );
      })()}
    </Container>
  );
};

export default CourseList;
