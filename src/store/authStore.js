import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store for TaTU Submission Portal
 * Manages user session, roles (Student/Lecturer), and profile.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null, // 'student' | 'lecturer'
      
      register: (userData) => {
        // Store registered users in localStorage for future login
        const users = JSON.parse(localStorage.getItem('tatu-registered-users') || '[]');
        users.push({ email: userData.email, password: userData.password, role: userData.role, name: userData.name });
        localStorage.setItem('tatu-registered-users', JSON.stringify(users));
      },

      login: (userData) => {
        // Check if there's a registered user with matching email/password
        const users = JSON.parse(localStorage.getItem('tatu-registered-users') || '[]');
        const registered = users.find(
          u => u.email === userData.email && u.password === userData.password
        );
        const role = registered?.role || userData.role || 'student';

        set({ 
          user: { ...userData, ...(registered && { name: registered.name, role }) },
          isAuthenticated: true, 
          role,
        });
      },
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        role: null,
        acceptedCourses: []
      }),
      
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

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
