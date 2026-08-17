import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { fetchAcceptedCourses, acceptCourse as dbAcceptCourse, removeAcceptedCourse as dbRemoveAcceptedCourse } from '../lib/supabaseService';
import { logActivity, startSession, endSession, ACTIONS } from '../lib/activityService';

// Maps raw Supabase errors to safe, user-friendly messages
// (raw DB error text can leak schema/implementation details).
function friendlyAuthError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('user already registered')) return 'An account with this email already exists.';
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) return 'Please confirm your email before signing in.';
  if (m.includes('password should be at least')) return message;
  if (m.includes('rate limit') || m.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'Network error. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

async function getProfile(userId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        if (attempt < 2) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return data;
    } catch (e) {
      if (attempt < 2) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
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
      viewedPages: [],

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
            return;
          }

          const profile = await getProfile(session.user.id);
          const meta = session.user.user_metadata || {};

          const user = {
            id: session.user.id,
            name: profile?.name || meta.name || session.user.email,
            email: profile?.email || session.user.email,
            role: profile?.role || meta.role || 'student',
            institution: profile?.institution || meta.institution || '',
            student_id: profile?.student_id || null,
            onboarding_completed: profile?.onboarding_completed ?? false,
            post_interview_completed: profile?.post_interview_completed ?? false,
          };

          set({ user, isAuthenticated: true, role: user.role });

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
              const meta = session.user.user_metadata || {};

              if (!profile) {
                console.warn('No profile found for', session.user.id, '- keeping current user state');
                return;
              }

              const user = {
                id: session.user.id,
                name: profile.name || meta.name || session.user.email,
                email: profile.email || session.user.email,
                role: profile.role || meta.role || 'student',
                institution: profile.institution || meta.institution || '',
                student_id: profile.student_id || null,
                onboarding_completed: profile.onboarding_completed ?? false,
                post_interview_completed: profile.post_interview_completed ?? false,
              };

              set({ user, isAuthenticated: true, role: user.role });

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
          return { error: friendlyAuthError(error.message) };
        }

          if (data.user) {
          const needsOnboarding = role === 'student';
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            email,
            role,
            institution: institution || 'Tamale Technical University',
            student_id: studentId || null,
            onboarding_completed: !needsOnboarding
          });

          if (profileError) {
            console.error('Profile insert error:', profileError.message);
            set({ loading: false });
            return { error: profileError.message };
          }

          if (data.session) {
            set({
              user: {
                id: data.user.id, name, email, role,
                institution: institution || 'Tamale Technical University',
                student_id: studentId || null,
                onboarding_completed: !needsOnboarding,
                post_interview_completed: false,
              },
              isAuthenticated: true,
              role,
              loading: false
            });
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
          return { error: friendlyAuthError(error.message) };
        }

        if (data.user) {
          const profile = await getProfile(data.user.id);
          const meta = data.user.user_metadata || {};

          const user = {
            id: data.user.id,
            name: profile?.name || meta.name || data.user.email,
            email: profile?.email || data.user.email,
            role: profile?.role || meta.role || 'student',
            institution: profile?.institution || meta.institution || '',
            student_id: profile?.student_id || null,
            onboarding_completed: profile?.onboarding_completed ?? false,
            post_interview_completed: profile?.post_interview_completed ?? false,
          };

          set({ user, isAuthenticated: true, role: user.role, loading: false });
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
      },

      trackPageView: (path) => {
        set((state) => {
          if (state.viewedPages.includes(path)) return state;
          return { viewedPages: [...state.viewedPages, path] };
        });
      },
    }),
    {
      name: 'tatu-auth-storage',
      partialize: (state) => ({
        user: state.user ? { id: state.user.id, name: state.user.name, role: state.user.role } : null,
        isAuthenticated: state.isAuthenticated,
        acceptedCourses: state.acceptedCourses,
        viewedPages: state.viewedPages,
        sessionId: state.sessionId
      }),
    }
  )
);
