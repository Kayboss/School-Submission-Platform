import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { fetchRubrics, saveRubric, deleteRubric } from '../lib/supabaseService';

export const useRubricStore = create((set) => ({
  rubrics: [],
  loading: false,

  loadRubrics: async () => {
    set({ loading: true });
    const rubrics = await fetchRubrics();
    set({ rubrics, loading: false });
  },

  createRubric: async (rubric) => {
    const data = await saveRubric({
      assignment_id: rubric.assignmentId,
      criteria: rubric.criteria
    });
    if (data) set((state) => {
      const filtered = state.rubrics.filter(r => r.assignment_id !== rubric.assignmentId);
      return { rubrics: [...filtered, data] };
    });
  },

  updateRubric: async (id, updates) => {
    const { data } = await supabase.from('rubrics').update(updates).eq('id', id).select().single();
    if (data) set((state) => ({
      rubrics: state.rubrics.map(r => r.id === id ? data : r)
    }));
  },

  deleteRubric: async (id) => {
    await deleteRubric(id);
    set((state) => ({ rubrics: state.rubrics.filter(r => r.id !== id) }));
  }
}));
