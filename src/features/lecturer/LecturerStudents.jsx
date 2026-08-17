import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Users, Search, Mail, BookOpen, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { fetchStudents } from '../../lib/supabaseService';
import { useAuthStore } from '../../store/authStore';
import { Container } from './lecturerStyles';

const Header = styled.div`
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1rem;
  font-weight: 500;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg { color: ${({ theme }) => theme.colors.text.muted}; flex-shrink: 0; }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.main};

  &::placeholder { color: ${({ theme }) => theme.colors.text.muted}; font-weight: 500; }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: ${({ $accent }) => $accent}12;
  color: ${({ $accent }) => $accent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 700;
  font-size: 0.85rem;

  svg { opacity: 0.8; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
`;

const StudentCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border}15;
  transition: all 0.2s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.medium};
    transform: translateY(-2px);
  }
`;

const StudentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
`;

const StudentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StudentName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.main};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StudentEmail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;

  svg { width: 12px; height: 12px; }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const MetaTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $bg }) => $bg || '#f5f5f5'};
  color: ${({ $color }) => $color || '#666'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: ${({ theme }) => theme.colors.text.muted};

  svg { margin: 0 auto 1.5rem; opacity: 0.3; }
  p { font-weight: 600; font-size: 1.125rem; margin-bottom: 0.5rem; color: ${({ theme }) => theme.colors.text.main}; }
  span { font-size: 0.875rem; }
`;

const LecturerStudents = () => {
  const user = useAuthStore(s => s.user);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents(user)
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSubmitted = students.reduce((sum, s) => sum + (s.submitted || 0), 0);
  const totalPending = students.reduce((sum, s) => sum + (s.pending || 0), 0);
  const totalOverdue = students.reduce((sum, s) => sum + (s.overdue || 0), 0);

  if (loading) {
    return (
      <Container>
        <EmptyState>
          <Loader className="spin" size={48} />
          <p>Loading students...</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Students</Title>
        <Subtitle>{students.length} student{students.length !== 1 ? 's' : ''} enrolled in your courses</Subtitle>
      </Header>

      <SearchBar>
        <Search size={18} />
        <SearchInput
          placeholder="Search by name, email, or student ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchBar>

      <StatsRow>
        <StatChip $accent="#4a7c59"><CheckCircle size={16} /> {totalSubmitted} Submitted</StatChip>
        <StatChip $accent="#daa520"><Clock size={16} /> {totalPending} Pending</StatChip>
        <StatChip $accent="#b35a38"><AlertCircle size={16} /> {totalOverdue} Overdue</StatChip>
      </StatsRow>

      {filtered.length === 0 ? (
        <EmptyState>
          <Users size={48} />
          <p>{search ? 'No students match your search' : 'No students registered yet'}</p>
          <span>{search ? 'Try a different search term' : 'Students will appear here once they register.'}</span>
        </EmptyState>
      ) : (
        <Grid>
          {filtered.map(student => (
            <StudentCard key={student.userId || student.id}>
              <StudentHeader>
                <Avatar>{student.name?.charAt(0)?.toUpperCase() || '?'}</Avatar>
                <StudentInfo>
                  <StudentName>{student.name}</StudentName>
                  <StudentEmail><Mail size={12} /> {student.email}</StudentEmail>
                </StudentInfo>
              </StudentHeader>
              <MetaRow>
                {student.id && student.id !== student.userId && (
                  <MetaTag $bg="#f0f0f0" $color="#666">ID: {student.id}</MetaTag>
                )}
                {student.courses?.map(code => (
                  <MetaTag key={code} $bg="#4a7c5915" $color="#4a7c59">
                    <BookOpen size={11} /> {code}
                  </MetaTag>
                ))}
              </MetaRow>
              <MetaRow>
                {student.submitted > 0 && <MetaTag $bg="#4a7c5915" $color="#4a7c59">{student.submitted} graded</MetaTag>}
                {student.pending > 0 && <MetaTag $bg="#daa52015" $color="#daa520">{student.pending} pending</MetaTag>}
                {student.overdue > 0 && <MetaTag $bg="#b35a3815" $color="#b35a38">{student.overdue} overdue</MetaTag>}
              </MetaRow>
            </StudentCard>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LecturerStudents;
