import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      loading: false,

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            user: profile || { id: session.user.id, email: session.user.email },
            isAuthenticated: true,
            role: profile?.role || 'student'
          });
        }
      },

      signUp: async ({ email, password, name, role, institution }) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role, institution } }
        });

        if (error) {
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            email,
            role,
            institution: institution || 'Tamale Technical University'
          });

          if (profileError) {
            set({ loading: false });
            return { error: profileError.message };
          }

          set({
            user: { id: data.user.id, name, email, role, institution },
            isAuthenticated: true,
            role,
            loading: false
          });
        }
        return { error: null };
      },

      login: async ({ email, password }) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          set({
            user: profile || { id: data.user.id, email: data.user.email },
            isAuthenticated: true,
            role: profile?.role || 'student',
            loading: false
          });
        }
        return { error: null };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          acceptedCourses: []
        });
      },

      updateProfile: async (updates) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        await supabase.from('profiles').update(updates).eq('id', user.id);

        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      },

      acceptedCourses: [],

      acceptCourse: (courseId) => set((state) => ({
        acceptedCourses: state.acceptedCourses.includes(courseId)
          ? state.acceptedCourses
          : [...state.acceptedCourses, courseId]
      })),

      removeAcceptedCourse: (courseId) => set((state) => ({
        acceptedCourses: state.acceptedCourses.filter(id => id !== courseId)
      }))
    }),
    {
      name: 'tatu-auth-storage',
    }
  )
);
