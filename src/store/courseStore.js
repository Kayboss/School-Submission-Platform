import { create } from 'zustand';
import { fetchCourses, addCourse, updateCourse, deleteCourse } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';

export const useCourseStore = create((set) => ({
  courses: [],
  loading: false,

  loadCourses: async (user) => {
    set({ loading: true });
    const courses = await fetchCourses(user);
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

  uploadCourseImage: async (courseId, file) => {
    const ext = file.name.split('.').pop();
    const path = `course-${courseId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('course-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    const data = await updateCourse(courseId, { image: publicUrl });
    if (data) set((state) => ({
      courses: state.courses.map((c) => (c.id === courseId ? data : c))
    }));
    return publicUrl;
  },

  deleteCourseImage: async (courseId, currentImage) => {
    if (!currentImage) return;
    const path = currentImage.split('/').pop();
    await supabase.storage.from('course-images').remove([path]);
    const data = await updateCourse(courseId, { image: null });
    if (data) set((state) => ({
      courses: state.courses.map((c) => (c.id === courseId ? data : c))
    }));
  },

  deleteCourse: async (id) => {
    await deleteCourse(id);
    set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
  }
}));
