import React from "react";

import { CONTACT } from "../../data/profile";

const EMAIL = CONTACT.email;

// Bordered call-to-action at the right end of the navbar. Opens the user's
// mail client straight to the real contact address — the same handle used
// by the contact section and the footer.
//
// The hover inversion (outline → solid) lives in `.nav_cta` in globals.css
// alongside the other navbar styles, so the whole bar's interaction
// language is defined in one place rather than split across components.
const LetsTalk = () => (
  <a
    href={`mailto:${EMAIL}`}
    aria-label={`Email ${EMAIL}`}
    className="nav_cta cursor-pointer"
  >
    HIRE ME
  </a>
);

export default LetsTalk;
