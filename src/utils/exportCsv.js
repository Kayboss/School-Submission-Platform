export function exportGradesCsv(submissions, courseCode) {
  const filtered = courseCode
    ? submissions.filter(s => s.courseCode === courseCode)
    : submissions;

  const headers = ['Student Name', 'Student ID', 'Course', 'Assignment', 'Score', 'Status', 'Submitted', 'Feedback'];
  const rows = filtered.map(s => [
    s.studentName,
    s.studentId,
    s.courseCode,
    s.assignmentTitle,
    s.score ?? 'N/A',
    s.status,
    new Date(s.timestamp).toLocaleDateString('en-GB'),
    (s.feedback || '').replace(/"/g, '""')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = courseCode
    ? `grades-${courseCode.replace(/\s+/g, '-')}.csv`
    : 'all-grades.csv';
  a.click();
  URL.revokeObjectURL(url);
}
