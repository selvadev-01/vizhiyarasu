"use client";

import React, { useEffect, useState } from 'react'

// Sun / moon glyphs match the rest of the navbar's stroked SVG style.
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// This used to be the EN/AR language toggle. It's now repurposed as the
// site-wide theme switcher: the button reads/writes the active theme on
// `document.documentElement` (the same attribute the no-flash bootstrap
// script in `app/layout.js` sets on first paint), and persists the user's
// choice to localStorage so it survives reloads.
const ThemeButton = () => {
  // Matches the server-rendered default in app/layout.js so the button's
  // first paint agrees with the document theme and doesn't flash the wrong
  // label before the effect below syncs it.
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      // localStorage may be unavailable (private mode, etc.) — the toggle
      // still works for the current session, just doesn't persist.
    }
  };

  const isDark = theme === 'dark';

  // Icon-only in the inline navbar — the label is carried by aria-label so
  // the bar stays visually quiet next to the tracked-caps links and CTA.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className='nav_icon_btn cursor-pointer'
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default ThemeButton
