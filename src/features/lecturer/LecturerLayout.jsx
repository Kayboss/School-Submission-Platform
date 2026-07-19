import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Title, Subtitle, Header, TitleBlock } from './lecturerStyles';

const LecturerLayout = () => {
  return (
    <Container>
      <Header>
        <TitleBlock>
          <Title>Lecturer Portal</Title>
          <Subtitle>Review, grade, and manage student submissions across all courses.</Subtitle>
        </TitleBlock>
      </Header>
      <Outlet />
    </Container>
  );
};

export default LecturerLayout;
