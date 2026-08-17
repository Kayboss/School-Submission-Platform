import { create } from 'zustand';
import { fetchAssignments, createAssignment, updateAssignment, deleteAssignment } from '../lib/supabaseService';
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
    logActivity(ACTIONS.CREATE_ASSIGNMENT, 'assignment', data.id, { title: assignment.title, course_code: assignment.course_code });
    return data;
  },

  updateAssignment: async (id, updates) => {
    const data = await updateAssignment(id, updates);
    if (!data) throw new Error('Failed to update assignment');
    set((state) => ({
      assignments: state.assignments.map(a => a.id === id ? data : a)
    }));
    logActivity(ACTIONS.UPDATE_ASSIGNMENT || 'update_assignment', 'assignment', id, { title: updates.title });
    return data;
  },

  deleteAssignment: async (id) => {
    const ok = await deleteAssignment(id);
    if (!ok) throw new Error('Failed to delete assignment');
    set((state) => ({
      assignments: state.assignments.filter(a => a.id !== id)
    }));
    logActivity(ACTIONS.DELETE_ASSIGNMENT || 'delete_assignment', 'assignment', id);
  }
}));
