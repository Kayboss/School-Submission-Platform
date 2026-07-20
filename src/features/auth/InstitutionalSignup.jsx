import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store/authStore';
import { GraduationCap, ShieldCheck, User, Lock, Mail, ArrowRight, Building, Eye, EyeOff, Loader } from 'lucide-react';

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
  padding: 2.5rem 3.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.premium};
  border: 1px solid rgba(179, 90, 56, 0.1);

  @media (max-width: 520px) {
    max-width: 92vw;
    padding: 1.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  box-shadow: 0 12px 24px rgba(179, 90, 56, 0.2);
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.35rem;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary}80;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3.25rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9rem;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const RoleSwitcher = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  background: ${({ theme }) => theme.colors.background.alt};
  padding: 0.4rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const RoleButton = styled.button`
  padding: 0.6rem;
  border-radius: calc(${({ theme }) => theme.borderRadius.medium} - 4px);
  background: ${({ $active, theme }) => $active ? 'white' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.muted};
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: ${({ $active, theme }) => $active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.95rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
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
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
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

const InstitutionalSignup = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const signUp = useAuthStore(state => state.signUp);
  const loading = useAuthStore(state => state.loading);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [institution, setInstitution] = useState('Tamale Technical University');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await signUp({ email, password, name, role, institution });
    if (result?.error) {
      setError(result.error);
    } else if (result?.needsEmailConfirmation) {
      setError(result.message);
    }
  };

  return (
    <Container>
      <DecorativeShape />
      <Content>
        <Header>
          <Logo>
            <GraduationCap size={30} strokeWidth={2.5} />
          </Logo>
          <Title>Create Account</Title>
          <Subtitle>Join the TaTU Portal</Subtitle>
        </Header>

        <RoleSwitcher>
          <RoleButton
            type="button"
            $active={role === 'student'}
            onClick={() => setRole('student')}
          >
            <User size={16} /> Student
          </RoleButton>
          <RoleButton
            type="button"
            $active={role === 'lecturer'}
            onClick={() => setRole('lecturer')}
          >
            <ShieldCheck size={16} /> Lecturer
          </RoleButton>
        </RoleSwitcher>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon><User size={18} /></InputIcon>
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Mail size={18} /></InputIcon>
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Lock size={18} /></InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <InputIcon><Lock size={18} /></InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><Building size={18} /></InputIcon>
            <Input
              type="text"
              placeholder="Institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
          </InputGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : <ArrowRight size={18} />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </SubmitButton>
        </Form>

        <FooterText>
          Already have an account? <StyledLink to="/login">Sign in</StyledLink>
        </FooterText>
      </Content>
    </Container>
  );
};

export default InstitutionalSignup;
