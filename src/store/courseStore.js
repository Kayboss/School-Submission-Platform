import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_COURSES = [
  {
    id: 1,
    code: 'IT 401',
    name: 'Advanced Software Engineering',
    instructor: 'Dr. John Mensah',
    accent: '#b35a38',
    credits: '3.0',
    schedule: 'Mon, Wed 10:00 AM'
  },
  {
    id: 2,
    code: 'IT 405',
    name: 'Data Communication & Networking',
    instructor: 'Eng. Sarah Boateng',
    accent: '#daa520',
    credits: '4.0',
    schedule: 'Tue, Thu 02:00 PM'
  },
  {
    id: 3,
    code: 'IT 302',
    name: 'Database Management Systems',
    instructor: 'Dr. Robert Koomson',
    accent: '#4a7c59',
    credits: '3.0',
    schedule: 'Fri 08:30 AM'
  },
  {
    id: 4,
    code: 'IT 408',
    name: 'Cloud Computing Architecture',
    instructor: 'Prof. Amara Okafor',
    accent: '#6F240A',
    credits: '3.0',
    schedule: 'Mon 01:00 PM'
  }
];

export const useCourseStore = create(
  persist(
    (set) => ({
      courses: DEFAULT_COURSES,

      addCourse: (course) => set((state) => ({
        courses: [...state.courses, { ...course, id: Date.now() }]
      })),

      updateCourse: (id, updates) => set((state) => ({
        courses: state.courses.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),

      updateCourseImage: (id, imageDataUrl) => set((state) => ({
        courses: state.courses.map((c) => c.id === id ? { ...c, image: imageDataUrl } : c)
      })),

      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id)
      }))
    }),
    {
      name: 'tatu-course-storage'
    }
  )
);
