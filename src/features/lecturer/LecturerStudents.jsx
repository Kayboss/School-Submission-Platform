import React from 'react';
import { Users } from 'lucide-react';
import styled from 'styled-components';
import { Container } from './lecturerStyles';

const EmptyState = styled.div`
  text-align: center; padding: 5rem 2rem; color: #55433c;
  svg { margin: 0 auto 1.5rem; opacity: 0.3; }
  p { font-weight: 600; font-size: 1.125rem; margin-bottom: 0.5rem; }
  span { font-size: 0.875rem; opacity: 0.7; }
`;

const LecturerStudents = () => (
  <Container>
    <EmptyState>
      <Users size={48} />
      <p>No students enrolled yet</p>
      <span>Students will appear here once they register for courses.</span>
    </EmptyState>
  </Container>
);

export default LecturerStudents;
