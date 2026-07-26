import { create } from 'zustand';

export const useErrorLogStore = create((set, get) => ({
  errors: [],

  logError: (error) => {
    const entry = {
      id: Date.now() + Math.random(),
      message: error.message || String(error),
      stack: error.stack || '',
      source: error.source || 'unknown',
      filename: error.filename || '',
      lineno: error.lineno || 0,
      colno: error.colno || 0,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    set((state) => ({ errors: [entry, ...state.errors].slice(0, 200) }));
  },

  clearErrors: () => set({ errors: [] }),

  getErrorCount: () => get().errors.length,
}));
