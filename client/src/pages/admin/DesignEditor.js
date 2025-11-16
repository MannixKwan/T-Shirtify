import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 20px;
`;

const DesignEditor = () => {
  return (
    <Container>
      <Title>Design Editor</Title>
      <p>Design editor with drag & drop functionality coming soon...</p>
    </Container>
  );
};

export default DesignEditor; 