export function mapSubmission(sub) {
  if (!sub) return sub;
  return {
    ...sub,
    id: sub.id,
    assignmentId: sub.assignment_id,
    courseCode: sub.course_code,
    assignmentTitle: sub.assignment_title,
    studentName: sub.student_name,
    studentId: sub.student_id,
    userId: sub.user_id,
    isLate: sub.is_late,
    timeDiscrepancy: sub.time_discrepancy,
    videoLink: sub.video_link,
    rubricScores: sub.rubric_scores,
    score: sub.score,
    feedback: sub.feedback,
    files: sub.files || [],
    versions: sub.versions || [],
    semester: sub.semester,
    hash: sub.hash,
    timestamp: sub.timestamp,
    status: sub.status,
  };
}

export function mapAssignment(ass) {
  if (!ass) return ass;
  return {
    ...ass,
    id: ass.id,
    courseCode: ass.course_code,
    dueDate: ass.due_date,
    submissionTypes: ass.submission_types,
    maxSize: ass.max_size,
    allowedExtensions: ass.allowed_extensions,
    lecturerName: ass.lecturer_name,
    latePenalty: ass.late_penalty,
    allowResubmission: ass.allow_resubmission,
    maxResubmissions: ass.max_resubmissions,
    createdAt: ass.created_at,
  };
}

export function mapCourse(c) {
  if (!c) return c;
  return {
    ...c,
    id: c.id,
    code: c.code,
    name: c.name,
    instructor: c.instructor,
    accent: c.accent,
    credits: c.credits,
    schedule: c.schedule,
    image: c.image,
  };
}

export function mapRubric(r) {
  if (!r) return r;
  return {
    ...r,
    id: r.id,
    assignmentId: r.assignment_id,
    criteria: r.criteria || [],
    createdAt: r.created_at,
  };
}

export function mapAssignments(list) { return (list || []).map(mapAssignment); }
export function mapCourses(list) { return (list || []).map(mapCourse); }
export function mapSubmissions(list) { return (list || []).map(mapSubmission); }
export function mapRubrics(list) { return (list || []).map(mapRubric); }
