import React from "react";
import Image from "next/image";
import Link from "next/link";

import { PROFILE } from "../../data/profile";

// Left-hand brand lockup: the line-art portrait in a circular frame, with
// the first name set beside it. Clicking it scrolls back to the top rather
// than navigating, since the site is single-page — the caller passes
// `onClick` so it can reuse the same Lenis-aware scroll handler the nav
// links use.
//
// The source art is a full portrait on an opaque white ground, so it can't
// simply be dropped onto the dark bar. Two things make it work as a mark:
// `rounded-full` + `overflow-hidden` crops it to a circular badge, and
// `object-top` pulls the framing up to the head — centring would land the
// crop on the shirt. The white ground then reads as an intentional filled
// avatar rather than a stray rectangle.
//
// Only the first name: the full name would run wide enough beside the badge
// to crowd the nav links, and the hero already carries the name in full.
const Wordmark = ({ onClick, subtitle = "SYSTEM ONLINE" }) => (
  <Link
    href="/"
    aria-label="Home"
    onClick={onClick}
    // `group` so the badge's hover scale is driven by the whole lockup —
    // hovering the name should animate the mark too, not just the image.
    className="group flex items-center gap-3 cursor-pointer"
  >
    <span className="relative block w-11 h-11 lg:w-12 lg:h-12 shrink-0 rounded-full overflow-hidden bg-white ring-1 ring-theme-border transition-transform duration-200 group-hover:scale-105">
      <Image
        src="/icon.png"
        alt=""
        fill
        // The bar renders at ~48px; 96px covers 2× displays without
        // shipping the full 992KB source to every visitor.
        sizes="96px"
        priority
        className="object-cover object-top"
      />
    </span>
    {/* Name over subtitle. `leading-none` on the stack so the two lines sit
        tight together and the lockup stays optically centred against the
        badge — default line-height would push the pair off-axis. */}
    <span className="flex flex-col leading-none">
      <span
        className="text-fg font-bold text-xl lg:text-2xl uppercase whitespace-nowrap"
        style={{ letterSpacing: "0.02em" }}
      >
        {PROFILE.firstName}
        <span className="text-accent">.</span>
      </span>
      {/* Tracking is eased back at the narrowest widths: 0.35em on a nowrap
          string pushes the lockup into the hamburger on a ~320px bar. */}
      {/* 0.55rem resolved to 8.8px, well under the ~12px legibility floor the
          rest of the site holds via clamp(). Raised to 0.6875rem (11px) — still
          clearly subordinate to the name above it, but actually readable. The
          tracking easing at narrow widths is unchanged. */}
      <span className="font-mono text-[0.6875rem] tracking-[0.18em] sm:tracking-[0.3em] text-fg-subtle mt-1.5 uppercase whitespace-nowrap">
        {subtitle}
      </span>
    </span>
  </Link>
);

export default Wordmark;
