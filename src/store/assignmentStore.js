import { create } from 'zustand';
import { fetchAssignments, createAssignment } from '../lib/supabaseService';

export const useAssignmentStore = create((set) => ({
  assignments: [],
  loading: false,

  loadAssignments: async () => {
    set({ loading: true });
    const assignments = await fetchAssignments();
    set({ assignments, loading: false });
  },

  createAssignment: async (assignment) => {
    const data = await createAssignment(assignment);
    if (data) set((state) => ({ assignments: [...state.assignments, data] }));
  }
}));
