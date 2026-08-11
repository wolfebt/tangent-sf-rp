import React from 'react';
import ReferenceTooltip from '../../components/UI/ReferenceTooltip';

const ChatParser = ({ text }) => {
  // Simple parser that looks for [Text] and replaces it with ReferenceTooltip
  const parts = text.split(/(\[[^\]]+\])/g);
  
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
