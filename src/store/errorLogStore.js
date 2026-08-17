import { create } from 'zustand';

export const useErrorLogStore = create((set, get) => ({
  errors: [],
  consoleEnabled: true,

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

  logSupabaseError: (operation, error, context = {}) => {
    const entry = {
      id: Date.now() + Math.random(),
      message: `[Supabase] ${operation}: ${error?.message || String(error)}`,
      stack: error?.stack || '',
      source: 'supabase',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context: { operation, ...context },
    };
    set((state) => ({ errors: [entry, ...state.errors].slice(0, 200) }));
  },

  installConsoleCapture: () => {
    if (!get().consoleEnabled) return;
    const originalError = console.error;
    console.error = (...args) => {
      const message = args
        .map((a) => (a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');
      const stack = args.find((a) => a instanceof Error)?.stack || '';
      get().logError({
        message,
        stack,
        source: 'console.error',
      });
      originalError.apply(console, args);
    };
  },

  clearErrors: () => set({ errors: [] }),

  getErrorCount: () => get().errors.length,
}));
