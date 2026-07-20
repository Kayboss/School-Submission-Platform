import React, { useState, useEffect } from 'react';
import { useCourseStore } from '../../store/courseStore';
import { fetchStudents } from '../../lib/supabaseService';
import { Search, Award, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import {
  Container, Controls, SearchWrapper, SearchInput, FilterSelect,
  StudentGrid, StudentCard, StudentCardHeader, StudentAvatar,
  StudentName, StudentId, StudentCardBody, Bio, StatRow, StatLabel2, StatValue2
} from './lecturerStyles';

const LecturerStudents = () => {
  const courses = useCourseStore(s => s.courses);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s =>
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()))
  ).filter(s =>
    filterCourse === 'all' || s.courses.includes(filterCourse)
  );

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#55433c' }}>
          <Loader className="spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700 }}>Loading students...</p>
        </div>
      </Container>
    );
  }

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
              {s.bio && <Bio>{s.bio}</Bio>}
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
