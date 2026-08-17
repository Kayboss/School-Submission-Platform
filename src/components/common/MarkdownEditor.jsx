import React, { useState } from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

const EditorWrapper = styled.div`
  border: 1.5px solid ${({ theme }) => theme.colors.border}60;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TabBar = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background?.alt || '#f8f8f8'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${({ $active, theme }) => $active ? theme.colors.background?.main || '#fff' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text?.muted || '#888'};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.primary}; }
`;

const StyledTextarea = styled.textarea`
  padding: 0.75rem 1rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', monospace;
  resize: vertical;
  min-height: 200px;
  width: 100%;
  background: ${({ theme }) => theme.colors.background?.main || '#fff'};
  &:focus { outline: none; }
`;

const Preview = styled.div`
  padding: 0.75rem 1rem;
  min-height: 200px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
  background: ${({ theme }) => theme.colors.background?.main || '#fff'};

  h1, h2, h3 { margin: 0.5rem 0; font-weight: 800; }
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1.15rem; }
  h3 { font-size: 1rem; }
  p { margin: 0.4rem 0; }
  ul, ol { margin: 0.4rem 0 0.4rem 1.5rem; }
  li { margin: 0.2rem 0; }
  code {
    background: ${({ theme }) => theme.colors.background?.alt || '#f0f0f0'};
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.85rem;
  }
  strong { font-weight: 800; }
  em { font-style: italic; }
`;

const Hint = styled.div`
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text?.muted || '#999'};
  background: ${({ theme }) => theme.colors.background?.alt || '#fafafa'};
  border-top: 1px solid ${({ theme }) => theme.colors.border}20;
`;

function parseMarkdown(text) {
  if (!text) return '<p style="color:#999">Nothing to preview</p>';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>');
  if (!html.startsWith('<')) html = `<p>${html}</p>`;
  return html;
}

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [tab, setTab] = useState('write');

  return (
    <EditorWrapper>
      <TabBar>
        <Tab $active={tab === 'write'} onClick={() => setTab('write')} type="button">Write</Tab>
        <Tab $active={tab === 'preview'} onClick={() => setTab('preview')} type="button">Preview</Tab>
      </TabBar>
      {tab === 'write' ? (
        <StyledTextarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Describe the assignment...\n\nSupports **bold**, *italic*, `code`, - lists, # headings'}
        />
      ) : (
        <Preview dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseMarkdown(value)) }} />
      )}
      <Hint>
        **bold** &middot; *italic* &middot; `code` &middot; - list &middot; 1. numbered &middot; # heading
      </Hint>
    </EditorWrapper>
  );
}
