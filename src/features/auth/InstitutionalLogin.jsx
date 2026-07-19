import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store/authStore';
import { GraduationCap, ShieldCheck, ArrowRight, User, Lock, Mail, Loader } from 'lucide-react';

const Container = styled.div`
  height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background.main};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 2px 2px, ${({ theme }) => theme.colors.primary}10 1px, transparent 0);
    background-size: 24px 24px;
  }

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 80%;
    height: 150%;
    background: radial-gradient(circle, ${({ theme }) => theme.colors.secondary}15 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(100px);
  }
`;

const DecorativeShape = styled.div`
  position: absolute;
  bottom: -10%;
  left: -5%;
  width: 40%;
  height: 60%;
  background: radial-gradient(circle, ${({ theme }) => theme.colors.primary}10 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(80px);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  margin: auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  padding: 3.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.premium};
  border: 1px solid rgba(179, 90, 56, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled.div`
  width: 72px;
  height: 72px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 12px 24px rgba(179, 90, 56, 0.2);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9375rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary}80;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}15;
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted}80;
  }
`;

const RoleSwitcher = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  background: ${({ theme }) => theme.colors.background.alt};
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const RoleButton = styled.button`
  padding: 0.75rem;
  border-radius: calc(${({ theme }) => theme.borderRadius.medium} - 4px);
  background: ${({ $active, theme }) => $active ? 'white' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.muted};
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: ${({ $active, theme }) => $active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1.125rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  box-shadow: 0 8px 20px ${({ theme }) => theme.colors.primary}40;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 12px 24px ${({ theme }) => theme.colors.primary}50;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FooterText = styled.p`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMsg = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
`;

const InstitutionalLogin = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const result = await login({ email, password });
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Container>
      <DecorativeShape />
      <Content>
        <Header>
          <Logo>
            <GraduationCap size={36} strokeWidth={2.5} />
          </Logo>
          <Title>TaTU Portal</Title>
          <Subtitle>Excellence through Knowledge</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon><Mail size={20} /></InputIcon>
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <InputIcon><Lock size={20} /></InputIcon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Loader size={20} className="spin" /> : <ArrowRight size={20} />}
            {loading ? 'Signing In...' : 'Sign In to Portal'}
          </SubmitButton>
        </Form>

        <FooterText>
          Don't have an account? <StyledLink to="/signup">Sign up</StyledLink>
        </FooterText>
      </Content>
    </Container>
  );
};

export default InstitutionalLogin;
