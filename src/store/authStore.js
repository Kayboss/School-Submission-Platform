import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { fetchAcceptedCourses, acceptCourse as dbAcceptCourse, removeAcceptedCourse as dbRemoveAcceptedCourse } from '../lib/supabaseService';
import { logActivity, startSession, endSession, ACTIONS } from '../lib/activityService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      loading: false,
      sessionId: null,

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) console.error('initialize profile fetch error:', error);

          const role = profile?.role || (session.user.user_metadata?.role) || 'student';

          if (!profile) {
            console.error('No profile found for user', session.user.id, '- creating one');
            await supabase.from('profiles').insert({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'student',
              institution: session.user.user_metadata?.institution || 'Tamale Technical University',
              onboarding_completed: role !== 'student'
            });
            const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (newProfile) {
              set({ user: newProfile, isAuthenticated: true, role: newProfile.role });
            } else {
              set({
                user: { id: session.user.id, email: session.user.email },
                isAuthenticated: true,
                role
              });
            }
          } else {
            // Auto-complete onboarding for ALL existing users with profiles.
            // Only brand-new student signups (flag set in signUp) should see onboarding.
            if (!profile.onboarding_completed) {
              try {
                const pendingOnboarding = localStorage.getItem('tatu_pending_onboarding');
                if (!pendingOnboarding || pendingOnboarding !== session.user.id) {
                  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', session.user.id);
                  profile.onboarding_completed = true;
                }
              } catch (e) {
                console.error('Auto-complete onboarding failed:', e);
              }
            }
            set({
              user: profile,
              isAuthenticated: true,
              role
            });
          }

          const courses = await fetchAcceptedCourses(session.user.id);
          set({ acceptedCourses: courses });
        } else {
          set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) console.error('onAuthStateChange profile fetch error:', error);

            if (profile) {
              // Also auto-complete onboarding here as a safety net
              if (!profile.onboarding_completed) {
                try {
                  const pendingOnboarding = localStorage.getItem('tatu_pending_onboarding');
                  if (!pendingOnboarding || pendingOnboarding !== session.user.id) {
                    await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', session.user.id);
                    profile.onboarding_completed = true;
                  }
                } catch (e) {
                  console.error('Auto-complete onboarding failed:', e);
                }
              }
              set({
                user: profile,
                isAuthenticated: true,
                role: profile.role || 'student'
              });
              const courses = await fetchAcceptedCourses(session.user.id);
              set({ acceptedCourses: courses });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false, role: null, acceptedCourses: [] });
          }
        });
      },

      signUp: async ({ email, password, name, role, institution, studentId }) => {
        set({ loading: true });

        // First check if user already exists
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
            onboarding_completed: role === 'student' ? false : true
          });

          if (profileError) {
            set({ loading: false });
            return { error: profileError.message };
          }

          // If session exists, user is auto-confirmed; otherwise email confirmation required
          if (data.session) {
            if (role === 'student') {
              localStorage.setItem('tatu_pending_onboarding', data.user.id);
            }
            set({
              user: { id: data.user.id, name, email, role, institution, student_id: studentId || null, onboarding_completed: role === 'student' ? false : true },
              isAuthenticated: true,
              role,
              loading: false
            });
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (error) console.error('login profile fetch error:', error);

          set({
            user: profile || { id: data.user.id, email: data.user.email },
            isAuthenticated: true,
            role: profile?.role || 'student',
            loading: false
          });

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
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          acceptedCourses: [],
          sessionId: null
        });
      },

      updateProfile: async (updates) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) return;

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) console.error('updateProfile error:', error);

        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      },

      acceptedCourses: [],

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
