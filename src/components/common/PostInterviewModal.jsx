import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
  cursor: default;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: fadeIn 0.4s ease;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 72px; height: 72px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary || '#daa520'});
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h3`
  font-weight: 800;
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.75rem;
`;

const StartBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 14px ${({ theme }) => theme.colors.primary}40;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px ${({ theme }) => theme.colors.primary}50; }
`;

const RequiredText = styled.p`
  font-size: 0.75rem;
  color: #999;
  margin-top: 1rem;
`;

const MODAL_SHOWN_KEY = 'post_interview_modal_shown';

export default function PostInterviewModal() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const viewedPages = useAuthStore(s => s.viewedPages);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.post_interview_completed) return;
    if (sessionStorage.getItem(MODAL_SHOWN_KEY)) return;

    const isStudent = user.role === 'student' || !user.role;
    const isLecturer = user.role === 'lecturer';

    let eligible = false;
    if (isStudent) {
      eligible = user.onboarding_completed !== false;
    } else if (isLecturer) {
      eligible = viewedPages?.includes('/lecturer/assignments') && viewedPages?.includes('/lecturer/submissions');
    }

    if (eligible) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem(MODAL_SHOWN_KEY, '1');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, viewedPages]);

  if (!show) return null;

  return (
    <Overlay>
      <Modal>
        <IconWrapper>
          <Star size={32} strokeWidth={2} />
        </IconWrapper>
        <Title>Share Your Experience</Title>
        <Description>
          You've been using the system for a while. We'd love to hear your feedback to help us improve.
        </Description>
        <StartBtn onClick={() => { setShow(false); navigate('/post-interview'); }}>
          Start Survey <ArrowRight size={18} />
        </StartBtn>
        <RequiredText>This survey is required to continue using the system.</RequiredText>
      </Modal>
    </Overlay>
  );
}
