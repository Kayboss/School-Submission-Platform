import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Wrapper = styled.div`
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
`;

const ToastItem = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1rem 1.25rem;
  box-shadow: 0 8px 24px rgba(179, 90, 56, 0.15);
  border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  animation: ${slideIn} 0.3s ease;
  border-left: 4px solid ${({ type, theme }) =>
    type === 'success' ? theme.colors.tertiary :
    type === 'error' ? theme.colors.primary :
    type === 'warning' ? theme.colors.secondary :
    theme.colors.primary
  };
`;

const ToastMessage = styled.span`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.main};
  line-height: 1.4;
`;

const CloseBtn = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <Wrapper>
      {toasts.map((t) => (
        <ToastItem key={t.id} type={t.type}>
          {t.type === 'success' && <CheckCircle size={20} color="#4a7c59" />}
          {t.type === 'error' && <AlertCircle size={20} color="#b35a38" />}
          {t.type === 'warning' && <AlertCircle size={20} color="#daa520" />}
          <ToastMessage>{t.message}</ToastMessage>
          <CloseBtn onClick={() => removeToast(t.id)}><X size={16} /></CloseBtn>
        </ToastItem>
      ))}
    </Wrapper>
  );
};
