import { create } from 'zustand';
import { fetchAssignments, createAssignment } from '../lib/supabaseService';
import { logActivity, ACTIONS } from '../lib/activityService';

export const useAssignmentStore = create((set) => ({
  assignments: [],
  loading: false,

  loadAssignments: async (user) => {
    set({ loading: true });
    const assignments = await fetchAssignments(user);
    set({ assignments, loading: false });
  },

  createAssignment: async (assignment) => {
    const data = await createAssignment(assignment);
    if (!data) throw new Error('Failed to create assignment');
    set((state) => ({ assignments: [...state.assignments, data] }));
    logActivity(ACTIONS.CREATE_ASSIGNMENT, 'assignment', data.id, { title: assignment.title, courseCode: assignment.courseCode });
  }
}));
