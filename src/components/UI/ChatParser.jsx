import React from 'react';
import ReferenceTooltip from '../../components/UI/ReferenceTooltip';

const ChatParser = ({ text, content }) => {
  // Support both text and content prop, gracefully handle undefined/null/non-string
  const rawText = typeof text === 'string' ? text : (typeof content === 'string' ? content : (text || content ? String(text || content) : ''));
  
  if (!rawText) {
    return null;
  }

  // Simple parser that looks for [Text] and replaces it with ReferenceTooltip
  const parts = rawText.split(/(\[[^\]]+\])/g);
  
  return (
    <div className="parsed-text" style={{ lineHeight: '1.6' }}>
      {parts.map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const term = part.slice(1, -1);
          return <ReferenceTooltip key={index} term={term} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default ChatParser;
