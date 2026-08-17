import { create } from 'zustand';

export const useUploadStore = create((set, get) => ({
  uploads: [],

  startUpload: (fileId, fileName, fileSize) => {
    const entry = {
      id: fileId,
      name: fileName,
      size: fileSize,
      progress: 0,
      status: 'uploading',
      error: null,
    };
    set((state) => ({ uploads: [...state.uploads, entry] }));
    return fileId;
  },

  updateProgress: (fileId, progress) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === fileId ? { ...u, progress: Math.min(100, progress) } : u
      ),
    }));
  },

  completeUpload: (fileId) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === fileId ? { ...u, progress: 100, status: 'done' } : u
      ),
    }));
  },

  failUpload: (fileId, error) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.id === fileId ? { ...u, status: 'error', error } : u
      ),
    }));
  },

  clearUploads: () => set({ uploads: [] }),

  removeUpload: (fileId) => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.id !== fileId),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.status !== 'done'),
    }));
  },
}));
