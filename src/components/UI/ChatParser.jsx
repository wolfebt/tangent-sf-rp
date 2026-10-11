import React from 'react';
import ReferenceTooltip from './ReferenceTooltip';

/**
 * Universal text parser that turns bracketed tokens [Term], [Label|Target], and [[Wiki Links]]
 * into interactive, color-coded hyperlinks with rich hover preview cards.
 */
const ChatParser = ({ 
  text, 
  content, 
  onLinkClick, 
  className = '', 
  style = {},
  inline = false
}) => {
  // Support both text and content prop, gracefully handle undefined/null/non-string
  const rawText = typeof text === 'string' 
    ? text 
    : (typeof content === 'string' ? content : (text || content ? String(text || content) : ''));
  
  if (!rawText) {
    return null;
  }

  // Regex matches both [[Double Bracketed]] and [Single Bracketed] tokens
  const parts = rawText.split(/(\[\[[^\n\r\]]+\]\]|\[[^\n\r\]]+\])/g);
  
  const contentNodes = parts.map((part, index) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const term = part.slice(2, -2).trim();
      return <ReferenceTooltip key={index} term={term} onLinkClick={onLinkClick} />;
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      const term = part.slice(1, -1).trim();
      return <ReferenceTooltip key={index} term={term} onLinkClick={onLinkClick} />;
    }
    return <span key={index}>{part}</span>;
  });

  const RootTag = inline ? 'span' : 'div';

  return (
    <RootTag 
      className={`parsed-text ${className}`.trim()} 
      style={{ lineHeight: '1.35', ...style }}
    >
      {contentNodes}
    </RootTag>
  );
};

export const HyperlinkText = ChatParser;
export default ChatParser;
