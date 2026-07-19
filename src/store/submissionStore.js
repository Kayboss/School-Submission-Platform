import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SUBMISSIONS = [
  // Current Student Submissions (Zack Student)
  {
    id: 'TaTU-Z8D2W3Q9',
    assignmentId: 'assign-2',
    courseCode: 'IT 401',
    assignmentTitle: 'Software Design Patterns',
    studentName: 'Zack Student',
    studentId: '05210810',
    timestamp: '2026-06-11T16:45:00',
    isLate: false,
    timeDiscrepancy: '1 day early',
    files: [
      { name: 'Zack_Design_Patterns.pdf', size: 1.5, type: 'application/pdf', hash: 'c5938efc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Graded',
    score: 88,
    feedback: 'Good work, Zack. The design pattern explanations were clear. Try to add UML class diagrams next time.',
    semester: '2025/2026 Semester 2'
  },
  
  // Current Semester Submissions
  {
    id: 'TaTU-A9F2X1K8',
    assignmentId: 'assign-2',
    courseCode: 'IT 401',
    assignmentTitle: 'Software Design Patterns',
    studentName: 'Kwame Asante',
    studentId: '05210811',
    timestamp: '2026-06-11T14:22:00',
    isLate: false,
    timeDiscrepancy: '1 day early',
    files: [
      { name: 'Design_Patterns_Kwame.pdf', size: 1.2, type: 'application/pdf', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }
    ],
    status: 'Graded',
    score: 85,
    feedback: 'Excellent breakdown of the MVC and Observer patterns. Minor typos in section 3.',
    semester: '2025/2026 Semester 2'
  },
  {
    id: 'TaTU-B7V3L9M0',
    assignmentId: 'assign-2',
    courseCode: 'IT 401',
    assignmentTitle: 'Software Design Patterns',
    studentName: 'Abena Mensah',
    studentId: '05210812',
    timestamp: '2026-06-12T10:15:00',
    isLate: false,
    timeDiscrepancy: '13 hours early',
    files: [
      { name: 'Patterns_Report_Abena.pdf', size: 2.1, type: 'application/pdf', hash: '8f43890c2ea11b816226f958f000ea5428807d4b9b9a622a59a72dfa4f001c34' }
    ],
    status: 'Graded',
    score: 92,
    feedback: 'Fantastic report! The diagrams detailing the microservices gateway pattern are very clear and helpful.',
    semester: '2025/2026 Semester 2'
  },
  {
    id: 'TaTU-C4H6N2P1',
    assignmentId: 'assign-4',
    courseCode: 'IT 302',
    assignmentTitle: 'SQL Query Optimization Exam',
    studentName: 'Kofi Boateng',
    studentId: '05210813',
    timestamp: '2026-06-14T09:12:00',
    isLate: false,
    timeDiscrepancy: '4 days early',
    files: [
      { name: 'Optimization_Exam_Boateng.sql', size: 0.15, type: 'application/sql', hash: 'b35a38efc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Pending',
    semester: '2025/2026 Semester 2'
  },
  {
    id: 'TaTU-D2K5R8T3',
    assignmentId: 'assign-2',
    courseCode: 'IT 401',
    assignmentTitle: 'Software Design Patterns',
    studentName: 'Ama Owusu',
    studentId: '05210814',
    timestamp: '2026-06-13T01:30:00', // Due on June 12
    isLate: true,
    timeDiscrepancy: '1 hour 30 mins late',
    files: [
      { name: 'Design_Patterns_Report_Ama.pdf', size: 3.4, type: 'application/pdf', hash: '55433cefc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Late',
    semester: '2025/2026 Semester 2'
  },
  {
    id: 'TaTU-E3L6S9U4',
    assignmentId: 'assign-3',
    courseCode: 'IT 405',
    assignmentTitle: 'Network Topology Design',
    studentName: 'Yaw Darko',
    studentId: '05210815',
    timestamp: '2026-06-14T11:45:00',
    isLate: false,
    timeDiscrepancy: '4 days early',
    files: [
      { name: 'Network_Topology_Map.pdf', size: 4.2, type: 'application/pdf', hash: 'a4e321fc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'Pending',
    semester: '2025/2026 Semester 2'
  },

  // Archive / Past Semester Submissions (For Batch Auditing)
  {
    id: 'TaTU-ARC-101',
    assignmentId: 'archive-assign-1',
    courseCode: 'IT 302',
    assignmentTitle: 'Relational Database Schema Design',
    studentName: 'Musa Ibrahim',
    studentId: '05200901',
    timestamp: '2025-05-15T11:40:00',
    isLate: false,
    timeDiscrepancy: 'On time',
    files: [
      { name: 'Musa_Ibrahim_Relational_Schema.pdf', size: 1.8, type: 'application/pdf', hash: '7c5938efc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Graded',
    score: 88,
    feedback: 'Superb normalisation steps. Clear description of Primary and Foreign Keys.',
    semester: '2024/2025 Semester 2'
  },
  {
    id: 'TaTU-ARC-102',
    assignmentId: 'archive-assign-1',
    courseCode: 'IT 302',
    assignmentTitle: 'Relational Database Schema Design',
    studentName: 'Fatima Yakubu',
    studentId: '05200902',
    timestamp: '2025-05-16T15:20:00',
    isLate: true,
    timeDiscrepancy: '3 hours late',
    files: [
      { name: 'Fatima_Yakubu_Schema.pdf', size: 2.5, type: 'application/pdf', hash: '206138efc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Graded',
    score: 75,
    feedback: 'Late penalty applied. Normalisation was correct but section 4 was incomplete.',
    semester: '2024/2025 Semester 2'
  },
  {
    id: 'TaTU-ARC-201',
    assignmentId: 'archive-assign-2',
    courseCode: 'IT 405',
    assignmentTitle: 'IP Subnetting Assignment',
    studentName: 'Kwame Asante',
    studentId: '05210811',
    timestamp: '2025-11-20T10:05:00',
    isLate: false,
    timeDiscrepancy: 'On time',
    files: [
      { name: 'Subnetting_Practice_Kwame.pdf', size: 1.1, type: 'application/pdf', hash: '5b3838efc1231a4e1236fb92427ae41e4649b934ca495991b7852b8557a221f00' }
    ],
    status: 'Graded',
    score: 95,
    feedback: 'All subnet calculations are 100% correct. Well presented.',
    semester: '2025/2026 Semester 1'
  }
];

export const useSubmissionStore = create(
  persist(
    (set) => ({
      submissions: DEFAULT_SUBMISSIONS,

      addSubmission: (submission) => set((state) => {
        const existing = state.submissions.find(
          s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId
        );
        if (existing) {
          const newVersion = {
            timestamp: new Date().toISOString(),
            files: submission.files || [],
            videoLink: submission.videoLink || '',
            projectFiles: submission.projectFiles || [],
            version: (existing.versions?.length || 0) + 1
          };
          return {
            submissions: state.submissions.map(s =>
              s.id === existing.id
                ? { ...s, versions: [...(s.versions || []), newVersion], timestamp: newVersion.timestamp, files: submission.files, videoLink: submission.videoLink || '', isLate: submission.isLate, status: submission.isLate ? 'Late' : 'Pending' }
                : s
            )
          };
        }
        const newSub = {
          ...submission,
          id: `TaTU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          status: submission.isLate ? 'Late' : 'Pending',
          versions: [{
            timestamp: new Date().toISOString(),
            files: submission.files || [],
            videoLink: submission.videoLink || '',
            projectFiles: submission.projectFiles || [],
            version: 1
          }]
        };
        return { submissions: [...state.submissions, newSub] };
      }),

      gradeSubmission: (id, score, feedback, rubricScores) => set((state) => ({
        submissions: state.submissions.map((sub) => 
          sub.id === id 
            ? { ...sub, status: 'Graded', score: Number(score), feedback, rubricScores: rubricScores || sub.rubricScores } 
            : sub
        )
      }))
    }),
    {
      name: 'tatu-submission-storage'
    }
  )
);
