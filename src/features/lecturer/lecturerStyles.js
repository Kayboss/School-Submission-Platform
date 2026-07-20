import styled, { keyframes } from 'styled-components';

export const Container = styled.div` padding: 1rem; `;

export const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;
`;
export const TitleBlock = styled.div``;
export const Title = styled.h2`
  font-size: 2.25rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main};
  margin-bottom: 0.5rem; letter-spacing: -1px;
  @media (max-width: 600px) { font-size: 1.5rem; }
`;
export const Subtitle = styled.p` color: ${({ theme }) => theme.colors.text.muted}; font-size: 1.125rem; font-weight: 500; `;

export const StatsRow = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;
export const StatCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem; box-shadow: ${({ theme }) => theme.shadows.medium};
  border-bottom: 4px solid ${({ $accent }) => $accent};
  display: flex; flex-direction: column; gap: 0.25rem;
`;
export const StatLabel = styled.p`
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${({ theme }) => theme.colors.text.muted};
`;
export const StatValue = styled.p`
  font-size: 2.25rem; font-weight: 900; color: ${({ theme }) => theme.colors.text.main}; letter-spacing: -2px; line-height: 1;
`;
export const StatIconWrap = styled.div`
  width: 36px; height: 36px; border-radius: 10px;
  background: ${({ $accent }) => $accent}15; color: ${({ $accent }) => $accent};
  display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
`;

export const Controls = styled.div`
  display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap;
`;
export const SearchWrapper = styled.div`
  position: relative; flex: 1; min-width: 200px;
  svg { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.text.muted}80; }
  @media (max-width: 600px) { min-width: 100%; }
`;
export const SearchInput = styled.input`
  width: 100%; padding: 0.75rem 1rem 0.75rem 3rem;
  background: white; border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9375rem; font-weight: 600;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const FilterSelect = styled.select`
  padding: 0.75rem 1.25rem; background: white;
  border: 1.5px solid ${({ theme }) => theme.colors.border}40;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.875rem; font-weight: 700; color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer; &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

export const TableContainer = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; overflow: hidden; border: 1px solid ${({ theme }) => theme.colors.border}20;
  @media (max-width: 768px) { overflow-x: auto; }
`;
export const Table = styled.table` width: 100%; border-collapse: collapse; text-align: left; min-width: ${({ $minWidth }) => $minWidth || 'auto'}; `;
export const Th = styled.th`
  padding: 1rem 1.25rem; background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border}20;
`;
export const Td = styled.td`
  padding: 1rem 1.25rem; font-size: 0.875rem; color: ${({ theme }) => theme.colors.text.main};
  font-weight: 600; border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt};
`;
export const Tr = styled.tr`
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.background.alt}50; }
  &:last-child td { border-bottom: none; }
`;

export const StatusBadge = styled.span`
  padding: 0.35rem 0.75rem; border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 0.7rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.4rem;
  background: ${({ $status, theme }) =>
    $status === 'Graded' ? `${theme.colors.tertiary}15` :
    $status === 'Pending' ? `${theme.colors.secondary}15` : `${theme.colors.primary}15`};
  color: ${({ $status, theme }) =>
    $status === 'Graded' ? theme.colors.tertiary :
    $status === 'Pending' ? theme.colors.secondary : theme.colors.primary};
`;

export const ActionBtn = styled.button`
  background: ${({ $variant, disabled, theme }) => disabled ? theme.colors.border : $variant === 'primary' ? theme.colors.primary : theme.colors.background.alt};
  color: ${({ $variant, disabled }) => disabled ? 'white' : $variant === 'primary' ? 'white' : 'inherit'};
  border: none; width: 34px; height: 34px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover { transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'}; }
`;
export const ActionGroup = styled.div` display: flex; gap: 0.4rem; `;

export const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(30, 20, 15, 0.55);
  z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
`;
export const Modal = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2.5rem; width: 480px; box-shadow: ${({ theme }) => theme.shadows.large};
  @media (max-width: 600px) { width: 90vw; padding: 1.5rem; }
`;
export const ModalTitle = styled.h3`
  font-size: 1.375rem; font-weight: 800; margin-bottom: 0.5rem; color: ${({ theme }) => theme.colors.text.main};
`;
export const ModalSub = styled.p`
  font-size: 0.85rem; color: #55433c; font-weight: 600; margin-bottom: 1.5rem;
`;
export const ScoreInput = styled.input`
  width: 100%; padding: 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1.5rem; font-weight: 900; text-align: center;
  color: ${({ theme }) => theme.colors.primary}; margin-bottom: 1rem;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const FeedbackTextarea = styled.textarea`
  width: 100%; padding: 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9rem; font-weight: 600; resize: vertical; min-height: 100px;
  margin-bottom: 1.5rem; &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const ModalActions = styled.div` display: flex; gap: 1rem; `;
export const PrimaryBtn = styled.button`
  flex: 1; padding: 0.875rem;
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.primary};
  color: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 800;
  box-shadow: ${({ disabled, theme }) => disabled ? 'none' : `0 6px 16px ${theme.colors.primary}40`};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:hover { transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'}; }
`;
export const SecondaryBtn = styled.button`
  padding: 0.875rem 1.5rem; background: ${({ theme }) => theme.colors.background.alt};
  color: ${({ theme }) => theme.colors.text.main}; border-radius: ${({ theme }) => theme.borderRadius.medium}; font-weight: 800;
`;

export const ViewerOverlay = styled(Overlay)``;
export const ViewerModal = styled(Modal)` width: min(700px, 90vw); `;
export const ViewerContent = styled.div`
  background: #f5f5f5; border-radius: 8px; padding: 2rem; text-align: center;
  min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;
`;

export const AssignForm = styled.div`
  background: white; padding: 2rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; margin-bottom: 2rem;
`;
export const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; @media (max-width: 600px) { grid-template-columns: 1fr; } `;
export const FormGroup = styled.div` display: flex; flex-direction: column; gap: 0.375rem; ${({ $full }) => $full && 'grid-column: 1 / -1;'} `;
export const Label = styled.label` font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${({ theme }) => theme.colors.text.muted}; `;
export const FormInput = styled.input`
  padding: 0.75rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium}; font-size: 0.9rem; font-weight: 600;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const FormTextarea = styled.textarea`
  padding: 0.75rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium}; font-size: 0.9rem; font-weight: 600;
  resize: vertical; min-height: 80px; &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const FormSelect = styled.select`
  padding: 0.75rem 1rem; border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium}; font-size: 0.9rem; font-weight: 600;
  background: white; cursor: pointer; &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;
export const CheckboxGroup = styled.div` display: flex; gap: 1.5rem; flex-wrap: wrap; `;
export const CheckboxLabel = styled.label` display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; `;
export const CreateBtn = styled(PrimaryBtn)` margin-top: 1.5rem; max-width: 200px; `;
export const AssignCard = styled.div`
  background: white; padding: 1.25rem; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; border-left: 4px solid ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;
`;

export const StudentGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;
`;
export const StudentCard = styled.div`
  background: white; border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium}; overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border}20; transition: all 0.3s;
  &:hover { transform: translateY(-4px); box-shadow: ${({ theme }) => theme.shadows.large}; }
`;
export const StudentCardHeader = styled.div`
  padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt};
`;
export const StudentAvatar = styled.div`
  width: 56px; height: 56px; border-radius: 16px;
  background: ${({ theme }) => theme.colors.primary}; color: white;
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;
`;
export const StudentName = styled.h4` font-size: 1.05rem; font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; `;
export const StudentId = styled.p` font-size: 0.75rem; color: #55433c; font-weight: 700; `;
export const StudentCardBody = styled.div` padding: 1.25rem 1.5rem; `;
export const Bio = styled.p` font-size: 0.825rem; color: #55433c; font-weight: 600; line-height: 1.5; margin-bottom: 1rem; `;
export const StatRow = styled.div`
  display: flex; justify-content: space-between; padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.alt}; font-size: 0.8125rem;
  &:last-child { border-bottom: none; }
`;
export const StatLabel2 = styled.span` color: #55433c; font-weight: 600; `;
export const StatValue2 = styled.span` font-weight: 800; color: ${({ theme }) => theme.colors.text.main}; `;
export const EmptyState = styled.div` text-align: center; padding: 3rem; color: #55433c; font-weight: 600; `;
export const ZipAnimation = styled.div`
  display: flex; align-items: center; gap: 0.75rem; padding: 1rem;
  background: ${({ theme }) => theme.colors.background.alt};
  border-radius: ${({ theme }) => theme.borderRadius.medium}; margin-bottom: 1rem; font-weight: 700; font-size: 0.9rem;
`;
const spin = keyframes` from { transform: rotate(0deg); } to { transform: rotate(360deg); } `;
export const Spinner = styled.div`
  width: 24px; height: 24px; border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.6s linear infinite;
`;
