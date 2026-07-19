import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRubricStore = create(
  persist(
    (set) => ({
      rubrics: [],

      createRubric: (rubric) => set((state) => ({
        rubrics: [...state.rubrics, { ...rubric, id: `rubric-${Date.now()}` }]
      })),

      updateRubric: (id, updates) => set((state) => ({
        rubrics: state.rubrics.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      deleteRubric: (id) => set((state) => ({
        rubrics: state.rubrics.filter(r => r.id !== id)
      }))
    }),
    { name: 'tatu-rubric-storage' }
  )
);
