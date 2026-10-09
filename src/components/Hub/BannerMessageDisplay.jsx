import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BANNER_SPEEDS, TICKER_SPEEDS } from '../../services/bannerService';

/**
 * BannerMessageDisplay
 *
 * Renders the marquee message transmission according to display mode:
 * - Ticker Effect: Builds from the left on ticker, one line before the next to finish, then clears to restart cycle.
 * - Scrolling Marquee: Continuous right-to-left scrolling track.
 * - Static Display: Text horizontally centered across all lines.
 */
export const BannerMessageDisplay = ({
  lines = [],
  mode = 'ticker',
  speed = 'normal',
  tickerSpeed,
  theme,
  className = '',
  interactive = true
}) => {
  // Normalize lines to 1-3 non-empty strings (preserving user lines)
  const activeLines = useMemo(() => {
    let raw = Array.isArray(lines) ? lines : [lines];
    if (raw.length === 0) {
      return ['NO TRANSMISSION ENTERED'];
    }
    const sanitized = raw
      .map(l => (typeof l === 'string' ? l : ''))
      .slice(0, 3);

    // Keep active lines that have content, but ensure at least 1 line
    const nonEmpty = sanitized.filter(l => l.trim().length > 0);
    return nonEmpty.length > 0 ? nonEmpty : ['NO TRANSMISSION ENTERED'];
  }, [lines]);

  // Interval in ms between printed characters
  const charInterval = useMemo(() => {
    if (typeof tickerSpeed === 'number' && tickerSpeed > 0) {
      return tickerSpeed;
    }
    return TICKER_SPEEDS[speed]?.interval || 28;
  }, [speed, tickerSpeed]);

  // Marquee duration CSS variable
  const marqueeDuration = useMemo(() => {
    return BANNER_SPEEDS[speed]?.duration || '25s';
  }, [speed]);

  // Ticker animation state:
  // lineIdx: which line is currently typing (0 to activeLines.length - 1)
  // charIdx: how many characters in lineIdx have printed
  // phase: 'typing' | 'holding' | 'clearing'
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [isHovered, setIsHovered] = useState(false);

  // Stable ref for activeLines to avoid timer disruptions
  const activeLinesRef = useRef(activeLines);
  useEffect(() => {
    activeLinesRef.current = activeLines;
  }, [activeLines]);

  // Reset progression whenever lines or display mode change
  useEffect(() => {
    setLineIdx(0);
    setCharIdx(0);
    setPhase('typing');
  }, [activeLines, mode]);

  // Ticker progression effect loop:
  // Builds from the left, one line finishes before the next starts, holds, then clears to restart cycle.
  useEffect(() => {
    if (mode !== 'ticker') return;
    if (interactive && isHovered) return; // Pause on hover

    let timer = null;

    if (phase === 'typing') {
      const currentLines = activeLinesRef.current;
      const targetText = currentLines[lineIdx] || '';

      if (charIdx < targetText.length) {
        timer = setTimeout(() => {
          setCharIdx(prev => prev + 1);
        }, charInterval);
      } else {
        // Current line finished!
        if (lineIdx < currentLines.length - 1) {
          // Pause slightly between lines before the next line begins typing
          timer = setTimeout(() => {
            setLineIdx(prev => prev + 1);
            setCharIdx(0);
          }, Math.max(charInterval * 3, 140));
        } else {
          // All lines completed, hold reading state
          setPhase('holding');
        }
      }
    } else if (phase === 'holding') {
      // Hold completed message for reading (3.2s) before clearing
      timer = setTimeout(() => {
        setPhase('clearing');
      }, 3200);
    } else if (phase === 'clearing') {
      // Clear/wipe state briefly (400ms) before restarting cycle from Line 1
      timer = setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
        setPhase('typing');
      }, 400);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mode, phase, lineIdx, charIdx, charInterval, isHovered, interactive]);

  const currentTheme = theme || {};
  const textColor = currentTheme.text || 'text-cyan-300';
  const textGlow = currentTheme.textGlow || '';

  // 1. Ticker Mode: Builds from the left, one line before next to finish, clears to restart cycle
  if (mode === 'ticker') {
    return (
      <div 
        className={`w-full flex flex-col justify-center items-start text-left min-w-0 ${activeLines.length > 1 ? 'py-0.5 space-y-0.5' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {activeLines.map((lineText, idx) => {
          let displayedText = '';
          let isCurrentTypingLine = false;

          if (phase === 'clearing') {
            displayedText = '';
          } else if (phase === 'holding') {
            displayedText = lineText;
          } else {
            // phase === 'typing'
            if (idx < lineIdx) {
              displayedText = lineText;
            } else if (idx === lineIdx) {
              displayedText = lineText.slice(0, charIdx);
              isCurrentTypingLine = true;
            } else {
              displayedText = '';
            }
          }

          const fontSizeClass = activeLines.length === 1 
            ? 'text-[11.5px] sm:text-[13px]' 
            : activeLines.length === 2
              ? 'text-[10.5px] sm:text-[12px]'
              : 'text-[9.5px] sm:text-[11px]';

          return (
            <div 
              key={idx} 
              className={`w-full font-mono font-semibold tracking-wide flex items-center justify-start text-left min-h-[17px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap ${textColor} ${textGlow} ${fontSizeClass}`}
            >
              {displayedText ? (
                <span className="truncate">{displayedText}</span>
              ) : (
                <span className="invisible select-none opacity-0 pointer-events-none">&nbsp;</span>
              )}

              {/* Cursor indicator while typing current line */}
              {isCurrentTypingLine && phase === 'typing' && (
                <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-current ml-0.5 animate-pulse align-middle shrink-0" />
              )}
              {/* Cursor indicator on final line during reading hold */}
              {phase === 'holding' && idx === activeLines.length - 1 && (
                <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-current ml-0.5 opacity-60 animate-pulse align-middle shrink-0" />
              )}
              {/* Cursor indicator on first line during clear wipe */}
              {phase === 'clearing' && idx === 0 && (
                <span className="inline-block w-1.5 h-3 sm:h-3.5 bg-current animate-pulse align-middle shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Scrolling Marquee Mode: Right to left on scroll
  if (mode === 'scrolling') {
    return (
      <div 
        className={`w-full flex flex-col justify-center overflow-hidden min-w-0 ${activeLines.length > 1 ? 'py-0.5 space-y-0.5' : 'h-full'} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {activeLines.map((lineText, idx) => {
          const fontSizeClass = activeLines.length === 1 
            ? 'text-[11px] sm:text-[12px]' 
            : activeLines.length === 2
              ? 'text-[10px] sm:text-[11px]'
              : 'text-[9px] sm:text-[10.5px]';

          return (
            <div key={idx} className="w-full overflow-hidden relative whitespace-nowrap min-h-[17px] flex items-center justify-start">
              <div 
                className={`animate-marquee-scifi font-mono font-semibold tracking-wide flex items-center whitespace-nowrap shrink-0 ${textColor} ${textGlow} ${fontSizeClass}`}
                style={{ '--marquee-duration': marqueeDuration }}
              >
                {/* 4 segments provide continuous right-to-left flow across wide viewports */}
                <span className="mr-16 whitespace-nowrap shrink-0">
                  {lineText}
                </span>
                <span className="mr-16 whitespace-nowrap shrink-0">
                  {lineText}
                </span>
                <span className="mr-16 whitespace-nowrap shrink-0">
                  {lineText}
                </span>
                <span className="mr-16 whitespace-nowrap shrink-0">
                  {lineText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Static Display Mode: Text horizontally centered across all lines
  return (
    <div className={`w-full flex flex-col justify-center items-center text-center py-0.5 space-y-0.5 min-w-0 ${className}`}>
      {activeLines.map((lineText, idx) => {
        const fontSizeClass = activeLines.length === 1 
          ? 'text-[11px] sm:text-[12.5px]' 
          : activeLines.length === 2
            ? 'text-[10.5px] sm:text-[11.5px]'
            : 'text-[9.5px] sm:text-[11px]';

        return (
          <div 
            key={idx} 
            className={`w-full text-center flex items-center justify-center font-mono font-semibold whitespace-normal break-words leading-relaxed ${textColor} ${textGlow} ${fontSizeClass}`}
          >
            {lineText}
          </div>
        );
      })}
    </div>
  );
};

export default BannerMessageDisplay;
