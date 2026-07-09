import React from 'react';
import { useCurrentFrame } from 'remotion';

export type Word = {
  word: string;
  start: number; // seconds
  end: number;   // seconds
};

interface CaptionsProps {
  words: Word[];
  currentTime: number; // in seconds (frame / fps)
  style?: React.CSSProperties;
  activeStyle?: React.CSSProperties;
}

export const Captions: React.FC<CaptionsProps> = ({
  words,
  currentTime,
  style = {},
  activeStyle = {},
}) => {
  if (!words || words.length === 0) return null;

  const activeWordIndex = words.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 12px',
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const isActive = i === activeWordIndex;
        return (
          <span
            key={`${w.start}-${i}`}
            style={{
              transition: 'color 0.1s ease, transform 0.1s ease',
              color: isActive ? '#fff' : '#ccc',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              ...activeStyle,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};
