import { supabase } from './supabase';
import { mapCourses, mapAssignments, mapSubmissions, mapRubrics, mapRubric } from '../utils/dataMapper';

// ── Courses ──
export async function fetchCourses() {
  const { data } = await supabase.from('courses').select('*').order('id');
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
export async function fetchAssignments() {
  const { data } = await supabase.from('assignments').select('*').order('created_at');
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
export async function fetchSubmissions() {
  const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
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
  await supabase.from('accepted_courses').insert({ user_id: userId, course_id: courseId });
}

export async function removeAcceptedCourse(userId, courseId) {
  await supabase.from('accepted_courses').delete().match({ user_id: userId, course_id: courseId });
}
