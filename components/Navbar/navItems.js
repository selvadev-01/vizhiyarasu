// Single source of truth for the site navigation. Both the desktop inline
// bar and the mobile overlay render from this list, so a label or target
// only ever has to change in one place.
//
// The site is single-page: every entry maps to a section that already
// exists on the home page and is reached by smooth scrolling, never by a
// route change. `target: "top"` is a sentinel for "scroll to the very top
// of the document" (the hero), which owns the first viewport and so needs
// no anchor element of its own.
export const NAV_ITEMS = [
  { label: "HOME", target: "top" },
  { label: "ABOUT", target: "about" },
  { label: "WORK", target: "projects-section" },
  { label: "EXPERIENCE", target: "ventures" },
  { label: "CONTACT", target: "contact-section" },
];

export const NAV_TARGETS = NAV_ITEMS.map((item) => item.target);

// Smooth-scroll to an in-page section. Prefers the active Lenis instance
// (exposed by SmoothScroll on `window.__lenis`) so nav clicks feel
// identical to every other scroll on the site, and falls back to the
// browser's native smooth behaviour when Lenis isn't ready yet — e.g.
// during hydration, before SmoothScroll has mounted.
export const scrollToSection = (id) => {
  if (typeof window === "undefined") return;
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target == null) return;

  const lenis = window.__lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    return;
  }
  if (target === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
