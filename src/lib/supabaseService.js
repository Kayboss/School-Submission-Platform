import { supabase } from './supabase';
import { mapCourses, mapAssignments, mapSubmissions, mapRubrics, mapRubric, mapStudents } from '../utils/dataMapper';

// ── Courses ──
export async function fetchCourses(user) {
  let query = supabase.from('courses').select('*').order('id');
  if (user?.role === 'lecturer') {
    query = query.eq('user_id', user.id);
  }
  const { data } = await query;
  return mapCourses(data);
}

export async function addCourse(course) {
  const { data } = await supabase.from('courses').insert(course).select().single();
  return data ? { ...data, id: data.id } : null;
}

export async function updateCourse(id, updates) {
  const { data } = await supabase.from('courses').update(updates).eq('id', id).select().single();
  return mapCourses(data ? [data] : [])[0];
}

export async function deleteCourse(id) {
  await supabase.from('courses').delete().eq('id', id);
}

// ── Assignments ──
export async function fetchAssignments(user) {
  let query = supabase.from('assignments').select('*').order('created_at');
  if (user?.role === 'lecturer') {
    query = query.eq('user_id', user.id);
  }
  const { data } = await query;
  return mapAssignments(data);
}

export async function createAssignment(assignment) {
  const { data } = await supabase.from('assignments').insert(assignment).select().single();
  return mapAssignments(data ? [data] : [])[0];
}

// ── Rubrics ──
export async function fetchRubrics() {
  const { data } = await supabase.from('rubrics').select('*');
  return mapRubrics(data);
}

export async function saveRubric(rubric) {
  const existing = await supabase.from('rubrics').select('id').eq('assignment_id', rubric.assignmentId).maybeSingle();
  if (existing.data) {
    const { data } = await supabase.from('rubrics').update(rubric).eq('id', existing.data.id).select().single();
    return mapRubric(data);
  }
  const { data } = await supabase.from('rubrics').insert(rubric).select().single();
  return mapRubric(data);
}

export async function deleteRubric(id) {
  await supabase.from('rubrics').delete().eq('id', id);
}

// ── Submissions ──
export async function fetchSubmissions(user) {
  let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });
  if (user?.role === 'student') {
    query = query.eq('user_id', user.id);
  } else if (user?.role === 'lecturer') {
    const { data: myCourses } = await supabase.from('courses').select('code').eq('user_id', user.id);
    const codes = (myCourses || []).map(c => c.code);
    if (codes.length === 0) return [];
    query = query.in('course_code', codes);
  }
  const { data } = await query;
  return mapSubmissions(data);
}

export async function addSubmission(submission) {
  const { data } = await supabase.from('submissions').insert(submission).select().single();
  return mapSubmissions(data ? [data] : [])[0];
}

export async function gradeSubmission(id, score, feedback, rubricScores) {
  const { data } = await supabase.from('submissions').update({
    status: 'Graded', score: Number(score), feedback,
    rubric_scores: rubricScores || null
  }).eq('id', id).select().single();
  return mapSubmissions(data ? [data] : [])[0];
}

// ── Notifications ──
export async function fetchNotifications(userId) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

// ── Accepted Courses ──
export async function fetchAcceptedCourses(userId) {
  const { data } = await supabase.from('accepted_courses').select('course_id').eq('user_id', userId);
  return (data || []).map(r => r.course_id);
}

export async function acceptCourse(userId, courseId) {
  await supabase.from('accepted_courses').upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' });
}

export async function removeAcceptedCourse(userId, courseId) {
  await supabase.from('accepted_courses').delete().match({ user_id: userId, course_id: courseId });
}

// ── Students (Lecturer View) ──
export async function fetchStudents() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (!profiles) return [];

  const { data: submissions } = await supabase
    .from('submissions')
    .select('student_id, status, course_code');

  const { data: accepted } = await supabase
    .from('accepted_courses')
    .select('user_id, course_id');

  const { data: courses } = await supabase
    .from('courses')
    .select('id, code');

  const courseIdToCode = {};
  (courses || []).forEach(c => { courseIdToCode[c.id] = c.code; });

  const studentMap = {};
  (submissions || []).forEach(s => {
    if (!studentMap[s.student_id]) {
      studentMap[s.student_id] = { submitted: 0, pending: 0, overdue: 0 };
    }
    if (s.status === 'Graded') studentMap[s.student_id].submitted++;
    else if (s.status === 'Pending') studentMap[s.student_id].pending++;
    else if (s.status === 'Late') studentMap[s.student_id].overdue++;
  });

  const acceptedMap = {};
  (accepted || []).forEach(a => {
    const code = courseIdToCode[a.course_id];
    if (!acceptedMap[a.user_id]) acceptedMap[a.user_id] = [];
    if (code) acceptedMap[a.user_id].push(code);
  });

  const students = profiles.map(p => ({
    id: p.student_id || p.id,
    name: p.name,
    email: p.email,
    bio: '',
    userId: p.id,
    submitted: studentMap[p.student_id]?.submitted || 0,
    pending: studentMap[p.student_id]?.pending || 0,
    overdue: studentMap[p.student_id]?.overdue || 0,
    courses: acceptedMap[p.id] || [],
  }));

  return mapStudents(students);
}
