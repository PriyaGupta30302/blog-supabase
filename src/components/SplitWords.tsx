import React from 'react';

interface SplitWordsProps {
  text: string;
  /** Class applied to every word's inner span (the one GSAP animates). */
  wordClassName?: string;
}

/**
 * Splits text into words, each wrapped in a clipping mask + an inner span,
 * so GSAP can slide `.split-word` up from behind the mask.
 */
export default function SplitWords({ text, wordClassName = '' }: SplitWordsProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <span className={`split-word inline-block will-change-transform ${wordClassName}`}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
}
