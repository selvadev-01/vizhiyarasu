"use client";

import React from "react";

/**
 * Splits `text` into one animatable span per character, wrapped in per-word
 * spans so the text still wraps at word boundaries.
 *
 * The hero has its own SplitChars that splits on "\n" into fixed lines — that
 * one exists to stack a two-line wordmark. This one is the general case used by
 * the scrolling sections: it never introduces line breaks of its own, and it
 * keeps words intact so a long project title wraps like normal prose instead of
 * breaking mid-word (which is what splitting straight into characters does,
 * because every inline-block char becomes its own break opportunity).
 *
 * Screen readers see the word spans as separate nodes; `aria-label` on the
 * wrapper restores the original string so the text is announced once, normally.
 */
const SplitText = ({ text, className, as: Tag = "span" }) => (
  <Tag className={className} aria-label={text}>
    {String(text)
      .split(" ")
      .map((word, wordIndex, words) => (
        <span key={wordIndex} className="split-word" aria-hidden="true">
          {word.split("").map((char, i) => (
            <span key={i} className="split-char">
              {char}
            </span>
          ))}
          {/* Trailing space kept inside the word span so it can't collapse and
              so it isn't animated as a stray character of its own. */}
          {wordIndex < words.length - 1 ? " " : null}
        </span>
      ))}
  </Tag>
);

export default SplitText;
