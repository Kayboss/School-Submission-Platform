import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { fetchSubmissions, addSubmission, gradeSubmission } from '../lib/supabaseService';
import { logActivity, ACTIONS } from '../lib/activityService';

export const useSubmissionStore = create((set) => ({
  submissions: [],
  loading: false,

  loadSubmissions: async () => {
    set({ loading: true });
    const submissions = await fetchSubmissions();
    set({ submissions, loading: false });
  },

  addSubmission: async (submission) => {
    const existing = useSubmissionStore.getState().submissions.find(
      s => s.assignment_id === submission.assignmentId && s.student_id === submission.studentId
    );
    if (existing) {
      const versionNum = (existing.versions?.length || 0) + 1;
      const newVersion = {
        timestamp: submission.timestamp || new Date().toISOString(),
        files: submission.files || [],
        videoLink: submission.videoLink || '',
        projectFiles: submission.projectFiles || [],
        version: versionNum
      };
      const updatedVersions = [...(existing.versions || []), newVersion];
      const data = await gradeSubmission(existing.id, existing.score, existing.feedback, null);
      const { data: updated } = await supabase.from('submissions').update({
        versions: updatedVersions,
        files: submission.files,
        video_link: submission.videoLink || '',
        is_late: submission.isLate,
        status: submission.isLate ? 'Late' : 'Pending'
      }).eq('id', existing.id).select().single();
      if (updated) set((state) => ({
        submissions: state.submissions.map(s => s.id === existing.id ? updated : s)
      }));
      return;
    }

    const data = await addSubmission({
      assignment_id: submission.assignmentId,
      course_code: submission.courseCode,
      assignment_title: submission.assignmentTitle,
      student_name: submission.studentName,
      student_id: submission.studentId,
      user_id: submission.userId,
      timestamp: submission.timestamp || new Date().toISOString(),
      is_late: submission.isLate,
      time_discrepancy: submission.timeDiscrepancy,
      files: submission.files || [],
      video_link: submission.videoLink || '',
      status: submission.isLate ? 'Late' : 'Pending',
      versions: [{
        timestamp: new Date().toISOString(),
        files: submission.files || [],
        videoLink: submission.videoLink || '',
        version: 1
      }],
      semester: submission.semester,
      hash: submission.hash
    });

    if (data) {
      set((state) => ({ submissions: [data, ...state.submissions] }));
      logActivity(ACTIONS.SUBMIT_ASSIGNMENT, 'submission', data.id, {
        courseCode: submission.courseCode, assignmentId: submission.assignmentId
      });
    }
  },

  gradeSubmission: async (id, score, feedback, rubricScores) => {
    const data = await gradeSubmission(id, score, feedback, rubricScores);
    if (data) {
      set((state) => ({
        submissions: state.submissions.map((sub) => sub.id === id ? data : sub)
      }));
      logActivity(ACTIONS.GRADE_SUBMISSION, 'submission', id, { score, hasFeedback: !!feedback });
    }
  }
}));
