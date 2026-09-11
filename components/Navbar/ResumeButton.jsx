import React from "react";

import { CONTACT, PROFILE } from "../../data/profile";

const RESUME_URL = CONTACT.resumeUrl;

// Resume download sitting left of the "HIRE ME" CTA. Styled as a ghost
// button (`.nav_cta_ghost`) rather than a second bordered one so the bar
// keeps a single primary action — two identical outline buttons side by
// side would read as competing CTAs.
//
// `download` names the saved file after the profile owner instead of
// letting the browser fall back to the raw path, and the explicit
// extension keeps it correct even though the href already ends in .pdf.
const ResumeButton = () => (
  <a
    href={RESUME_URL}
    download={`${PROFILE.fullName.replace(/\s+/g, "_")}_Resume.pdf`}
    aria-label={`Download ${PROFILE.fullName}'s resume as PDF`}
    // The 768-1023px hide lives in `.nav_cta_ghost` itself — a `hidden` utility
    // here would lose to the `flex` that class bakes in via @apply.
    className="nav_cta_ghost cursor-pointer"
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Downward arrow into a tray — the conventional download affordance,
          drawn inline so it inherits currentColor through the hover swap. */}
      <path
        d="M6 1v6.5M6 7.5 3.5 5M6 7.5 8.5 5M1.5 9.5v1h9v-1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
    </svg>
    RESUME
  </a>
);

export default ResumeButton;
