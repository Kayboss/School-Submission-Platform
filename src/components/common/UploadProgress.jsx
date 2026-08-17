import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useUploadStore } from '../../store/uploadStore';
import { Check, AlertCircle, X } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 340px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 2px;
  display: flex;
  opacity: 0.8;
  &:hover { opacity: 1; }
`;

const FileRow = styled.div`
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  &:last-child { border-bottom: none; }
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
`;

const FileName = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
`;

const FileStatus = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ $status }) =>
    $status === 'done' ? '#16a34a' :
    $status === 'error' ? '#dc2626' :
    '#b35a38'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const BarBg = styled.div`
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${({ $status, theme }) =>
    $status === 'done' ? '#16a34a' :
    $status === 'error' ? '#dc2626' :
    theme.colors.primary};
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${({ $progress }) => $progress}%;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function UploadProgress() {
  const uploads = useUploadStore((s) => s.uploads);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);
  const removeUpload = useUploadStore((s) => s.removeUpload);

  if (uploads.length === 0) return null;

  const allDone = uploads.every((u) => u.status === 'done' || u.status === 'error');

  return (
    <Wrapper>
      <Header>
        <span>{allDone ? 'Upload complete' : `Uploading ${uploads.filter(u => u.status === 'uploading').length} file(s)...`}</span>
        <CloseBtn onClick={allDone ? clearCompleted : undefined} title={allDone ? 'Dismiss' : undefined}>
          {allDone ? <X size={16} /> : null}
        </CloseBtn>
      </Header>
      {uploads.map((u) => (
        <FileRow key={u.id}>
          <FileInfo>
            <FileName title={u.name}>{u.name}</FileName>
            <FileStatus $status={u.status}>
              {u.status === 'done' && <Check size={12} />}
              {u.status === 'error' && <AlertCircle size={12} />}
              {u.status === 'uploading' && <Spinner />}
              {u.status === 'done' ? 'Done' :
               u.status === 'error' ? 'Failed' :
               `${Math.round(u.progress)}%`}
            </FileStatus>
          </FileInfo>
          <BarBg>
            <BarFill $progress={u.progress} $status={u.status} />
          </BarBg>
        </FileRow>
      ))}
    </Wrapper>
  );
}
