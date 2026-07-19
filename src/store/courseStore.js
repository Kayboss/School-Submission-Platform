import { create } from 'zustand';
import { fetchCourses, addCourse, updateCourse, deleteCourse } from '../lib/supabaseService';

export const useCourseStore = create((set) => ({
  courses: [],
  loading: false,

  loadCourses: async () => {
    set({ loading: true });
    const courses = await fetchCourses();
    set({ courses, loading: false });
  },

  addCourse: async (course) => {
    const data = await addCourse(course);
    if (data) set((state) => ({ courses: [...state.courses, data] }));
  },

  updateCourse: async (id, updates) => {
    const data = await updateCourse(id, updates);
    if (data) set((state) => ({
      courses: state.courses.map((c) => c.id === id ? data : c)
    }));
  },

  updateCourseImage: async (id, imageDataUrl) => {
    const data = await updateCourse(id, { image: imageDataUrl });
    if (data) set((state) => ({
      courses: state.courses.map((c) => c.id === id ? data : c)
    }));
  },

  deleteCourse: async (id) => {
    await deleteCourse(id);
    set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
  }
}));
