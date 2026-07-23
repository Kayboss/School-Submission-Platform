import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { fetchAcceptedCourses, acceptCourse as dbAcceptCourse, removeAcceptedCourse as dbRemoveAcceptedCourse } from '../lib/supabaseService';
import { logActivity, startSession, endSession, ACTIONS } from '../lib/activityService';

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) console.error('Profile fetch error:', error);
  return data;
}

function userFromSession(sessionUser, profile) {
  return {
    id: sessionUser.id,
    name: profile?.name || sessionUser.user_metadata?.name || sessionUser.email,
    email: profile?.email || sessionUser.email,
    role: profile?.role || sessionUser.user_metadata?.role || 'student',
    institution: profile?.institution || sessionUser.user_metadata?.institution || '',
    student_id: profile?.student_id || null,
    onboarding_completed: profile?.onboarding_completed ?? true,
  };
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      loading: false,
      sessionId: null,
      acceptedCourses: [],

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
            return;
          }

          const profile = await getProfile(session.user.id);
          const u = userFromSession(session.user, profile);
          set({ user: u, isAuthenticated: true, role: u.role });

          fetchAcceptedCourses(session.user.id)
            .then(courses => set({ acceptedCourses: courses }))
            .catch(() => {});
        } catch (e) {
          console.error('initialize error:', e);
          set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const profile = await getProfile(session.user.id);
              const u = userFromSession(session.user, profile);
              set({ user: u, isAuthenticated: true, role: u.role });
              fetchAcceptedCourses(session.user.id)
                .then(courses => set({ acceptedCourses: courses }))
                .catch(() => {});
            } catch (e) {
              console.error('onAuthStateChange error:', e);
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
          }
        });
      },

      signUp: async ({ email, password, name, role, institution, studentId }) => {
        set({ loading: true });

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile) {
          set({ loading: false });
          return { error: 'An account with this email already exists. Please sign in.' };
        }

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
            institution: institution || 'Tamale Technical University',
            student_id: studentId || null,
            onboarding_completed: true
          });

          if (profileError) {
            set({ loading: false });
            return { error: profileError.message };
          }

          if (data.session) {
            const u = {
              id: data.user.id, name, email, role,
              institution: institution || 'Tamale Technical University',
              student_id: studentId || null,
              onboarding_completed: true
            };
            set({ user: u, isAuthenticated: true, role, loading: false });
            logActivity(ACTIONS.LOGIN, 'auth', data.user.id, { email });
            startSession().then(sid => set({ sessionId: sid }));
          } else {
            set({ loading: false });
            return {
              error: null,
              needsEmailConfirmation: true,
              message: 'Account created! Check your email to confirm your account before signing in.'
            };
          }
        }
        return { error: null };
      },

      login: async ({ email, password }) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user) {
          const profile = await getProfile(data.user.id);
          const u = userFromSession(data.user, profile);
          set({ user: u, isAuthenticated: true, role: u.role, loading: false });
          logActivity(ACTIONS.LOGIN, 'auth', data.user.id, { email });
          startSession().then(sid => set({ sessionId: sid }));
        }
        return { error: null };
      },

      logout: async () => {
        const sid = get().sessionId;
        await endSession(sid);
        logActivity(ACTIONS.LOGOUT, 'auth');
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [], sessionId: null });
      },

      updateProfile: async (updates) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) console.error('updateProfile error:', error);

        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      acceptCourse: async (courseId) => {
        const userId = get().user?.id;
        if (!userId) return;
        set((state) => ({
          acceptedCourses: state.acceptedCourses.includes(courseId)
            ? state.acceptedCourses
            : [...state.acceptedCourses, courseId]
        }));
        await dbAcceptCourse(userId, courseId);
      },

      removeAcceptedCourse: async (courseId) => {
        const userId = get().user?.id;
        if (!userId) return;
        set((state) => ({
          acceptedCourses: state.acceptedCourses.filter(id => id !== courseId)
        }));
        await dbRemoveAcceptedCourse(userId, courseId);
      }
    }),
    {
      name: 'tatu-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        acceptedCourses: state.acceptedCourses,
        sessionId: state.sessionId
      }),
    }
  )
);
