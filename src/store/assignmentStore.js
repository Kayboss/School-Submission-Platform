import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_ASSIGNMENTS = [
  {
    id: 'assign-1',
    courseCode: 'IT 401',
    title: 'Final Project Submission',
    description: 'Upload your complete source code and project documentation. Ensure your project repository matches all software testing criteria.',
    dueDate: '2026-06-25T23:59:59',
    submissionTypes: { document: true, video: false, project: true },
    maxSize: 50,
    allowedExtensions: ['.zip', '.pdf'],
    lecturerName: 'Dr. John Mensah',
    latePenalty: 5,
    allowResubmission: true,
    maxResubmissions: 3
  },
  {
    id: 'assign-2',
    courseCode: 'IT 401',
    title: 'Software Design Patterns',
    description: 'Write a comprehensive report on 5 architectural patterns used in modern cloud applications.',
    dueDate: '2026-06-12T23:59:59',
    submissionTypes: { document: true, video: false, project: false },
    maxSize: 10,
    allowedExtensions: ['.pdf'],
    lecturerName: 'Dr. John Mensah',
    latePenalty: 5,
    allowResubmission: false,
    maxResubmissions: 0
  },
  {
    id: 'assign-3',
    courseCode: 'IT 405',
    title: 'Network Topology Design',
    description: 'Submit the network design topology PDF and optionally provide a video explanation link (YouTube/Vimeo/Drive).',
    dueDate: '2026-06-28T18:00:00',
    submissionTypes: { document: true, video: true, project: false },
    maxSize: 20,
    allowedExtensions: ['.pdf', '.docx', '.pptx'],
    lecturerName: 'Eng. Sarah Boateng',
    latePenalty: 10,
    allowResubmission: true,
    maxResubmissions: 2
  },
  {
    id: 'assign-4',
    courseCode: 'IT 302',
    title: 'SQL Query Optimization Exam',
    description: 'Solve the optimization questions and submit your SQL scripts. Late submissions will automatically be flagged.',
    dueDate: '2026-06-18T12:00:00',
    submissionTypes: { document: true, video: false, project: false },
    maxSize: 5,
    allowedExtensions: ['.sql', '.pdf'],
    lecturerName: 'Dr. Robert Koomson',
    latePenalty: 0,
    allowResubmission: false,
    maxResubmissions: 0
  }
];

export const useAssignmentStore = create(
  persist(
    (set) => ({
      assignments: DEFAULT_ASSIGNMENTS,

      createAssignment: (assignment) => set((state) => ({
        assignments: [
          ...state.assignments,
          {
            ...assignment,
            id: `assign-${Date.now()}`,
            latePenalty: assignment.latePenalty ?? 0,
            allowResubmission: assignment.allowResubmission ?? false,
            maxResubmissions: assignment.maxResubmissions ?? 0
          }
        ]
      }))
    }),
    {
      name: 'tatu-assignment-storage'
    }
  )
);
