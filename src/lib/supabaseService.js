import { supabase } from './supabase';
import { mapCourses, mapAssignments, mapSubmissions, mapRubrics, mapRubric, mapStudents } from '../utils/dataMapper';
import { useErrorLogStore } from '../store/errorLogStore';

function handleError(operation, error, context = {}) {
  console.error(`[Supabase] ${operation} failed:`, error);
  useErrorLogStore.getState().logSupabaseError(operation, error, context);
  return null;
}

// ── Courses ──
export async function fetchCourses(user) {
  try {
    let query = supabase.from('courses').select('*').order('id');
    if (user?.role === 'lecturer') {
      query = query.eq('user_id', user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return mapCourses(data);
  } catch (error) {
    return handleError('fetchCourses', error, { userId: user?.id });
  }
}

export async function addCourse(course) {
  try {
    const { data, error } = await supabase.from('courses').insert(course).select().single();
    if (error) throw error;
    return data ? mapCourses([data])[0] : null;
  } catch (error) {
    return handleError('addCourse', error, { course });
  }
}

export async function updateCourse(id, updates) {
  try {
    const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapCourses(data ? [data] : [])[0];
  } catch (error) {
    return handleError('updateCourse', error, { courseId: id });
  }
}

export async function deleteCourse(id) {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('deleteCourse', error, { courseId: id });
  }
}

// ── Assignments ──
export async function fetchAssignments(user) {
  try {
    let query = supabase.from('assignments').select('*').order('created_at');
    if (user?.role === 'lecturer') {
      query = query.eq('user_id', user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    return mapAssignments(data);
  } catch (error) {
    return handleError('fetchAssignments', error, { userId: user?.id });
  }
}

export async function createAssignment(assignment) {
  try {
    const { data, error } = await supabase.from('assignments').insert(assignment).select().single();
    if (error) throw error;
    return mapAssignments(data ? [data] : [])[0];
  } catch (error) {
    return handleError('createAssignment', error, { assignment });
  }
}

export async function updateAssignment(id, updates) {
  try {
    const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapAssignments(data ? [data] : [])[0];
  } catch (error) {
    return handleError('updateAssignment', error, { assignmentId: id });
  }
}

export async function deleteAssignment(id) {
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('deleteAssignment', error, { assignmentId: id });
  }
}

// ── Rubrics ──
export async function fetchRubrics() {
  try {
    const { data, error } = await supabase.from('rubrics').select('*');
    if (error) throw error;
    return mapRubrics(data);
  } catch (error) {
    return handleError('fetchRubrics', error);
  }
}

export async function saveRubric(rubric) {
  try {
    const { data: existing, error: existErr } = await supabase
      .from('rubrics')
      .select('id')
      .eq('assignment_id', rubric.assignmentId)
      .maybeSingle();
    if (existErr) throw existErr;

    if (existing) {
      const { data, error } = await supabase
        .from('rubrics')
        .update(rubric)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return mapRubric(data);
    }
    const { data, error } = await supabase.from('rubrics').insert(rubric).select().single();
    if (error) throw error;
    return mapRubric(data);
  } catch (error) {
    return handleError('saveRubric', error, { rubric });
  }
}

export async function deleteRubric(id) {
  try {
    const { error } = await supabase.from('rubrics').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('deleteRubric', error, { rubricId: id });
  }
}

// ── Submissions ──
export async function fetchSubmissions(user) {
  try {
    let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });
    if (user?.role === 'student') {
      query = query.eq('user_id', user.id);
    } else if (user?.role === 'lecturer') {
      const { data: myCourses, error: courseErr } = await supabase
        .from('courses')
        .select('code')
        .eq('user_id', user.id);
      if (courseErr) throw courseErr;

      const codes = (myCourses || []).map(c => c.code);
      if (codes.length === 0) return [];
      query = query.in('course_code', codes);
    }
    const { data, error } = await query;
    if (error) throw error;
    return mapSubmissions(data);
  } catch (error) {
    return handleError('fetchSubmissions', error, { userId: user?.id });
  }
}

export async function addSubmission(submission) {
  try {
    const { data, error } = await supabase.from('submissions').insert(submission).select().single();
    if (error) throw error;
    return mapSubmissions(data ? [data] : [])[0];
  } catch (error) {
    return handleError('addSubmission', error, { submission });
  }
}

export async function gradeSubmission(id, score, feedback, rubricScores) {
  try {
    const { data, error } = await supabase.from('submissions').update({
      status: 'Graded', score: Number(score), feedback,
      rubric_scores: rubricScores || null
    }).eq('id', id).select().single();
    if (error) throw error;
    return mapSubmissions(data ? [data] : [])[0];
  } catch (error) {
    return handleError('gradeSubmission', error, { submissionId: id });
  }
}

// ── Notifications ──
export async function fetchNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError('fetchNotifications', error, { userId });
  }
}

export async function markNotificationRead(id) {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('markNotificationRead', error, { notificationId: id });
  }
}

// ── Accepted Courses ──
export async function fetchAcceptedCourses(userId) {
  try {
    const { data, error } = await supabase
      .from('accepted_courses')
      .select('course_id')
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(r => r.course_id);
  } catch (error) {
    return handleError('fetchAcceptedCourses', error, { userId });
  }
}

export async function acceptCourse(userId, courseId) {
  try {
    const { error } = await supabase
      .from('accepted_courses')
      .upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' });
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('acceptCourse', error, { userId, courseId });
  }
}

export async function removeAcceptedCourse(userId, courseId) {
  try {
    const { error } = await supabase
      .from('accepted_courses')
      .delete()
      .match({ user_id: userId, course_id: courseId });
    if (error) throw error;
    return true;
  } catch (error) {
    return handleError('removeAcceptedCourse', error, { userId, courseId });
  }
}

// ── Course Enrollments (Lecturer View) ──
export async function fetchCourseEnrollments() {
  try {
    const { data, error } = await supabase.rpc('get_course_enrollments');
    if (error) throw error;
    return data || [];
  } catch (error) {
    return handleError('fetchCourseEnrollments', error);
  }
}

// ── Students (Lecturer / Admin View) ──
export async function fetchStudents(user) {
  try {
    if (user?.role !== 'lecturer' && user?.role !== 'admin') return [];

    const { data, error } = await supabase.rpc('get_course_students');
    if (error) throw error;

    const { data: submissions, error: subErr } = await supabase
      .from('submissions')
      .select('student_id, user_id, status');
    if (subErr) throw subErr;

    const studentMap = {};
    (submissions || []).forEach(s => {
      const key = s.student_id || s.user_id;
      if (!studentMap[key]) {
        studentMap[key] = { submitted: 0, pending: 0, overdue: 0 };
      }
      if (s.status === 'Graded') studentMap[key].submitted++;
      else if (s.status === 'Pending') studentMap[key].pending++;
      else if (s.status === 'Late') studentMap[key].overdue++;
    });

    const students = (data || []).map(p => ({
      id: p.student_id || p.user_id,
      name: p.name,
      email: p.email,
      bio: '',
      userId: p.user_id,
      submitted: studentMap[p.student_id || p.user_id]?.submitted || 0,
      pending: studentMap[p.student_id || p.user_id]?.pending || 0,
      overdue: studentMap[p.student_id || p.user_id]?.overdue || 0,
      courses: p.course_codes || [],
    }));

    return mapStudents(students);
  } catch (error) {
    return handleError('fetchStudents', error, { userId: user?.id });
  }
}
