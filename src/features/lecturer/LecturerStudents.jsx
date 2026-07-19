import React, { useState } from 'react';
import { useCourseStore } from '../../store/courseStore';
import { Search, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Container, Controls, SearchWrapper, SearchInput, FilterSelect,
  StudentGrid, StudentCard, StudentCardHeader, StudentAvatar,
  StudentName, StudentId, StudentCardBody, Bio, StatRow, StatLabel2, StatValue2
} from './lecturerStyles';

const MOCK_STUDENTS = [
  { id: '05210810', name: 'Zack Student', email: 'zack@tatu.edu.gh', gpa: '3.8', bio: 'Final-year IT student passionate about software engineering and cloud architecture.', submitted: 6, pending: 2, overdue: 0, courses: ['IT 401', 'IT 405', 'IT 302'] },
  { id: '05210811', name: 'Kwame Asante', email: 'kwame@tatu.edu.gh', gpa: '3.6', bio: 'Dedicated network engineer in training. Enjoys solving complex subnetting problems.', submitted: 5, pending: 1, overdue: 1, courses: ['IT 401', 'IT 405'] },
  { id: '05210812', name: 'Abena Mensah', email: 'abena@tatu.edu.gh', gpa: '4.0', bio: 'Top-performing student with a passion for database optimization and data modeling.', submitted: 7, pending: 0, overdue: 0, courses: ['IT 302', 'IT 401'] },
  { id: '05210813', name: 'Kofi Boateng', email: 'kofi@tatu.edu.gh', gpa: '3.2', bio: 'Intermediate SQL developer. Focused on improving query performance and normalization.', submitted: 4, pending: 2, overdue: 1, courses: ['IT 302'] },
  { id: '05210814', name: 'Ama Owusu', email: 'ama@tatu.edu.gh', gpa: '3.5', bio: 'Hardworking student with a keen interest in Agile methodologies and software testing.', submitted: 5, pending: 1, overdue: 2, courses: ['IT 401', 'IT 405'] },
  { id: '05210815', name: 'Yaw Darko', email: 'yaw@tatu.edu.gh', gpa: '3.9', bio: 'Network topology enthusiast. Skilled in designing reliable and scalable network infrastructures.', submitted: 6, pending: 1, overdue: 0, courses: ['IT 405', 'IT 302'] },
];

const LecturerStudents = () => {
  const courses = useCourseStore(s => s.courses);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');

  const filtered = MOCK_STUDENTS.filter(s =>
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()))
  ).filter(s =>
    filterCourse === 'all' || s.courses.includes(filterCourse)
  );

  return (
    <Container>
      <Controls>
        <SearchWrapper>
          <Search size={18} />
          <SearchInput placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </SearchWrapper>
        <FilterSelect value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
        </FilterSelect>
      </Controls>

      <StudentGrid>
        {filtered.map(s => (
          <StudentCard key={s.id}>
            <StudentCardHeader>
              <StudentAvatar>{s.name.charAt(0)}</StudentAvatar>
              <div>
                <StudentName>{s.name}</StudentName>
                <StudentId>{s.id} &middot; {s.email}</StudentId>
              </div>
            </StudentCardHeader>
            <StudentCardBody>
              <Bio>{s.bio}</Bio>
              <StatRow><StatLabel2><Award size={14} /> GPA</StatLabel2><StatValue2>{s.gpa}</StatValue2></StatRow>
              <StatRow><StatLabel2><CheckCircle size={14} /> Submitted</StatLabel2><StatValue2>{s.submitted}</StatValue2></StatRow>
              <StatRow><StatLabel2><Clock size={14} /> Pending</StatLabel2><StatValue2>{s.pending}</StatValue2></StatRow>
              <StatRow><StatLabel2><AlertCircle size={14} /> Overdue</StatLabel2><StatValue2>{s.overdue}</StatValue2></StatRow>
            </StudentCardBody>
          </StudentCard>
        ))}
      </StudentGrid>
    </Container>
  );
};

export default LecturerStudents;
