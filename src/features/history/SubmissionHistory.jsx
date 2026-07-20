import React from 'react';
import styled from 'styled-components';
import { Archive } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Container = styled.div` padding: 1rem; `;

const Header = styled.div` margin-bottom: 2.5rem; `;

const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted}; font-size: 1.125rem; font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center; padding: 5rem 2rem; color: #55433c;
  svg { margin: 0 auto 1.5rem; opacity: 0.3; }
  p { font-weight: 600; font-size: 1.125rem; margin-bottom: 0.5rem; }
  span { font-size: 0.875rem; opacity: 0.7; }
`;

const SubmissionHistory = () => {
  const user = useAuthStore(state => state.user);
  const isLecturer = user?.role === 'lecturer';

  return (
    <Container>
      <Header>
        <Title>{isLecturer ? 'Institutional Archive' : 'Submission Archive'}</Title>
        <Subtitle>
          {isLecturer
            ? 'A comprehensive archive of all student submissions across semesters and courses.'
            : 'Your digital audit trail of academic contributions.'}
        </Subtitle>
      </Header>

      <EmptyState>
        <Archive size={48} />
        <p>No submissions yet</p>
        <span>Submissions will appear here once they are uploaded.</span>
      </EmptyState>
    </Container>
  );
};

export default SubmissionHistory;
